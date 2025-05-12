import { GoogleSpreadsheet } from "google-spreadsheet"
import fs from "fs"
import path from "path"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Caminho para o arquivo de credenciais
const CREDENTIALS_PATH = path.join(process.cwd(), "formulariotreinamento-96bebae6b65b.json")

// ID da planilha - usando a variável de ambiente
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || ""

// Nomes das abas da planilha
const SHEET_TREINAMENTOS = "Treinamentos"
const SHEET_OPCOES = "Opcoes"
const SHEET_DATAS_BLOQUEADAS = "DatasBloqueadas"

// Interface para as credenciais
interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

// Interface para os dados de treinamento
export interface Treinamento {
  id?: string
  empresa: string
  tipoTreinamento: string
  participantes: string // JSON string
  telefones?: string // JSON string
  emails?: string // JSON string
  agendamento?: string // Data em formato ISO
  dataCriacao: string
  status: string
  autorizaGravacao?: string // "Sim" ou "Não"
}

// Interface para as opções de treinamento
export interface OpcaoTreinamento {
  treinamentoId: string
  opcao: string
  valor: number
}

// Interface para datas bloqueadas
export interface DataBloqueada {
  data: string // Data em formato ISO (YYYY-MM-DD)
  motivo?: string
}

// Variável global para armazenar a instância do documento
let docInstance: GoogleSpreadsheet | null = null
let infoLoaded = false
let credentials: ServiceAccountCredentials | null = null

// Função para inicializar a conexão com o Google Sheets
async function getSpreadsheet() {
  try {
    console.log("Iniciando conexão com o Google Sheets...")
    console.log("ID da planilha:", SPREADSHEET_ID)

    // Verificar se o ID da planilha está definido
    if (!SPREADSHEET_ID) {
      console.error("ID da planilha não definido")
      return null
    }

    // Verificar se o arquivo de credenciais existe
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error(`Arquivo de credenciais não encontrado: ${CREDENTIALS_PATH}`)
      return null
    }

    // Se já temos uma instância e as informações já foram carregadas, retornar
    if (docInstance && infoLoaded) {
      return docInstance
    }

    // Se não temos uma instância, criar uma nova
    if (!docInstance) {
      console.log("Arquivo de credenciais encontrado, lendo...")

      // Ler o arquivo de credenciais
      const credentialsContent = fs.readFileSync(CREDENTIALS_PATH, "utf-8")
      credentials = JSON.parse(credentialsContent) as ServiceAccountCredentials

      console.log("Credenciais lidas com sucesso")
      console.log("Email da conta de serviço:", credentials?.client_email)

      // Inicializar o documento
      docInstance = new GoogleSpreadsheet(SPREADSHEET_ID)

      console.log("Autenticando com as credenciais...")
    }

    // Sempre carregar as informações do documento antes de retornar
    if (docInstance && !infoLoaded) {
      // Autenticar somente se as informações ainda não foram carregadas
      try {
        if (credentials) {
          await docInstance.useServiceAccountAuth({
            client_email: credentials.client_email,
            private_key: credentials.private_key,
          })
        } else {
          console.error("Credenciais não foram carregadas corretamente.")
          return null
        }
      } catch (authError) {
        console.error("Erro na autenticação:", authError)
        // Tratar o erro de autenticação conforme necessário
        docInstance = null
        infoLoaded = false
        return null
      }

      console.log("Carregando informações do documento...")
      await docInstance.loadInfo()
      infoLoaded = true

      console.log("Documento carregado com sucesso!")
      console.log("Título do documento:", docInstance.title)
    }

    return docInstance
  } catch (error) {
    console.error("Erro detalhado ao conectar com o Google Sheets:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    // Resetar a instância em caso de erro para forçar uma nova tentativa
    docInstance = null
    infoLoaded = false
    return null
  }
}

// Função para garantir que as abas necessárias existam
async function garantirAbas() {
  try {
    console.log("Verificando abas necessárias...")
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, retornar
    if (!doc) {
      console.log("Não foi possível obter o documento, usando modo fallback")
      return false
    }

    // Carregar todas as planilhas
    const sheets = doc.sheetsByIndex
    console.log(
      "Planilhas existentes:",
      sheets.map((s) => s.title),
    )

    // Verificar se as abas existem, se não, criá-las
    if (!doc.sheetsByTitle[SHEET_TREINAMENTOS]) {
      console.log(`Criando aba ${SHEET_TREINAMENTOS}...`)
      await doc.addSheet({
        title: SHEET_TREINAMENTOS,
        headerValues: [
          "id",
          "empresa",
          "tipoTreinamento",
          "participantes",
          "telefones",
          "emails",
          "agendamento",
          "dataCriacao",
          "status",
          "gravacao",
        ],
      })
      console.log(`Aba ${SHEET_TREINAMENTOS} criada`)
    }

    if (!doc.sheetsByTitle[SHEET_OPCOES]) {
      console.log(`Criando aba ${SHEET_OPCOES}...`)
      await doc.addSheet({
        title: SHEET_OPCOES,
        headerValues: ["treinamentoId", "opcao", "valor"],
      })
      console.log(`Aba ${SHEET_OPCOES} criada`)
    }

    if (!doc.sheetsByTitle[SHEET_DATAS_BLOQUEADAS]) {
      console.log(`Criando aba ${SHEET_DATAS_BLOQUEADAS}...`)
      await doc.addSheet({
        title: SHEET_DATAS_BLOQUEADAS,
        headerValues: ["data", "motivo"],
      })
      console.log(`Aba ${SHEET_DATAS_BLOQUEADAS} criada`)
    }

    console.log("Todas as abas verificadas e criadas se necessário")
    return true
  } catch (error) {
    console.error("Erro ao garantir abas:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return false
  }
}

// Função para obter o próximo ID disponível
async function obterProximoId(): Promise<number> {
  try {
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, usar modo fallback
    if (!doc) {
      return 1 // Fallback para ID 1
    }

    const sheet = doc.sheetsByTitle[SHEET_TREINAMENTOS]
    const rows = await sheet.getRows()

    if (rows.length === 0) {
      return 1 // Se não há registros, começar do 1
    }

    // Encontrar o maior ID atual e adicionar 1
    const ids = rows.map((row) => Number.parseInt(row.id) || 0)
    const maxId = Math.max(...ids)
    return maxId + 1
  } catch (error) {
    console.error("Erro ao obter próximo ID:", error)
    return 1 // Em caso de erro, retornar 1
  }
}

// Função para formatar data para padrão brasileiro
function formatarDataBR(dataISO: string): string {
  if (!dataISO) return ""
  try {
    const data = new Date(dataISO)
    return format(data, "dd/MM/yyyy HH:mm", { locale: ptBR })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dataISO
  }
}

// Função para extrair nomes dos participantes
function extrairParticipantes(participantesJSON: string): string {
  try {
    const participantes = JSON.parse(participantesJSON)
    return participantes.map((p: { nome: string }) => p.nome).join(", ")
  } catch (error) {
    console.error("Erro ao extrair participantes:", error)
    return participantesJSON
  }
}

// Função para extrair telefones
function extrairTelefones(telefonesJSON: string): string {
  try {
    const telefones = JSON.parse(telefonesJSON)
    return telefones.map((t: { numero: string }) => t.numero).join(", ")
  } catch (error) {
    console.error("Erro ao extrair telefones:", error)
    return telefonesJSON
  }
}

// Função para extrair emails
function extrairEmails(emailsJSON: string): string {
  try {
    const emails = JSON.parse(emailsJSON)
    return emails.map((e: { email: string }) => e.email).join(", ")
  } catch (error) {
    console.error("Erro ao extrair emails:", error)
    return emailsJSON
  }
}

// Função para salvar um treinamento na planilha
export async function salvarTreinamento(treinamento: Treinamento): Promise<string | null> {
  try {
    console.log("Salvando treinamento...")
    console.log("Dados do treinamento:", JSON.stringify(treinamento, null, 2))
    await garantirAbas()
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, usar modo fallback
    if (!doc) {
      const id = Date.now().toString()
      console.log("Modo fallback: Treinamento seria salvo com ID:", id)
      return id
    }

    const sheet = doc.sheetsByTitle[SHEET_TREINAMENTOS]

    // Gerar ID sequencial
    const id = await obterProximoId()

    // Tratar dados para formato mais legível na planilha
    const participantesFormatados = extrairParticipantes(treinamento.participantes)
    const telefonesFormatados = treinamento.telefones ? extrairTelefones(treinamento.telefones) : ""
    const emailsFormatados = treinamento.emails ? extrairEmails(treinamento.emails) : ""
    const agendamentoFormatado = treinamento.agendamento ? formatarDataBR(treinamento.agendamento) : ""
    const dataCriacaoFormatada = formatarDataBR(treinamento.dataCriacao)

    // Verificar o valor de autorizaGravacao
    const autorizaGravacao = treinamento.autorizaGravacao === "sim" ? "Sim" : "Não"
    console.log(`Valor de autorizaGravacao: ${treinamento.autorizaGravacao}, será salvo como: ${autorizaGravacao}`)

    console.log("Adicionando linha com dados do treinamento...")

    // Adicionar linha com os dados do treinamento
    await sheet.addRow({
      id: id.toString(),
      empresa: treinamento.empresa,
      tipoTreinamento: treinamento.tipoTreinamento,
      participantes: participantesFormatados,
      telefones: telefonesFormatados,
      emails: emailsFormatados,
      agendamento: agendamentoFormatado,
      dataCriacao: dataCriacaoFormatada,
      status: "agendado",
      gravacao: autorizaGravacao,
    })

    console.log("Treinamento salvo com sucesso, ID:", id)
    return id.toString()
  } catch (error) {
    console.error("Erro ao salvar treinamento:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return null
  }
}

// Função para salvar opções de treinamento
export async function salvarOpcoesTreinamento(treinamentoId: string, opcoes: Record<string, string>): Promise<boolean> {
  try {
    console.log("Salvando opções de treinamento para ID:", treinamentoId)
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, usar modo fallback
    if (!doc) {
      console.log("Modo fallback: Opções seriam salvas para o treinamento:", treinamentoId)
      return true
    }

    const sheet = doc.sheetsByTitle[SHEET_OPCOES]

    // Converter valores para números
    const rows = Object.entries(opcoes).map(([opcao, valor]) => ({
      treinamentoId,
      opcao,
      valor: converterValorParaNumero(valor),
    }))

    console.log(`Adicionando ${rows.length} opções...`)

    // Adicionar todas as opções
    for (const row of rows) {
      await sheet.addRow(row)
    }

    console.log("Opções salvas com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao salvar opções de treinamento:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return false
  }
}

// Função para converter valor de string para número
function converterValorParaNumero(valor: string): number {
  switch (valor) {
    case "naoPreciso":
      return 0
    case "breveExplicacao":
      return 1
    case "explicacaoCompleta":
      return 2
    default:
      return 0
  }
}

// Função para obter datas bloqueadas
export async function obterDatasBloqueadas(): Promise<DataBloqueada[]> {
  try {
    console.log("Obtendo datas bloqueadas...")
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, usar modo fallback
    if (!doc) {
      console.log("Modo fallback: Retornando lista vazia de datas bloqueadas")
      return []
    }

    // Verificar se a aba existe
    if (!doc.sheetsByTitle[SHEET_DATAS_BLOQUEADAS]) {
      console.log("Aba de datas bloqueadas não existe, criando...")
      await garantirAbas()
      // Se acabamos de criar a aba, não há dados ainda
      return []
    }

    const sheet = doc.sheetsByTitle[SHEET_DATAS_BLOQUEADAS]
    const rows = await sheet.getRows()

    console.log(`${rows.length} datas bloqueadas encontradas`)

    return rows.map((row) => ({
      data: row.data,
      motivo: row.motivo,
    }))
  } catch (error) {
    console.error("Erro ao obter datas bloqueadas:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return []
  }
}

// Função para bloquear uma data
export async function bloquearData(data: string, motivo: string): Promise<boolean> {
  try {
    console.log(`Bloqueando data ${data} com motivo: ${motivo}...`)
    await garantirAbas()
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, usar modo fallback
    if (!doc) {
      console.log(`Modo fallback: Data ${data} seria bloqueada com motivo: ${motivo}`)
      return true
    }

    const sheet = doc.sheetsByTitle[SHEET_DATAS_BLOQUEADAS]
    const rows = await sheet.getRows()

    const dataJaBloqueada = rows.find((row) => row.data === data)

    if (dataJaBloqueada) {
      console.log("Data já está bloqueada, atualizando motivo...")
      // Atualizar motivo
      dataJaBloqueada.motivo = motivo
      await dataJaBloqueada.save()
    } else {
      console.log("Adicionando nova data bloqueada...")
      // Adicionar nova data bloqueada
      await sheet.addRow({
        data,
        motivo,
      })
    }

    console.log("Data bloqueada com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao bloquear data:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return false
  }
}

// Função para desbloquear uma data
export async function desbloquearData(data: string): Promise<boolean> {
  try {
    console.log(`Desbloqueando data ${data}...`)
    const doc = await getSpreadsheet()

    // Se não conseguimos obter o documento, usar modo fallback
    if (!doc) {
      console.log(`Modo fallback: Data ${data} seria desbloqueada`)
      return true
    }

    const sheet = doc.sheetsByTitle[SHEET_DATAS_BLOQUEADAS]
    const rows = await sheet.getRows()

    const rowIndex = rows.findIndex((row) => row.data === data)

    if (rowIndex === -1) {
      console.log("Data não está bloqueada")
      return false // Data não está bloqueada
    }

    console.log("Removendo data bloqueada...")
    // Remover a linha
    await rows[rowIndex].delete()

    console.log("Data desbloqueada com sucesso")
    return true
  } catch (error) {
    console.error("Erro ao desbloquear data:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return false
  }
}

// Função para verificar se uma data está bloqueada
export async function verificarDataBloqueada(data: string): Promise<boolean> {
  try {
    console.log(`Verificando se data ${data} está bloqueada...`)
    const datasBloqueadas = await obterDatasBloqueadas()
    const bloqueada = datasBloqueadas.some((d) => d.data === data)
    console.log(`Data ${data} está bloqueada? ${bloqueada}`)
    return bloqueada
  } catch (error) {
    console.error("Erro ao verificar data bloqueada:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return false
  }
}

// Inicializar as abas ao carregar o módulo
console.log("Inicializando módulo Google Sheets...")
getSpreadsheet()
  .then((doc) => {
    if (doc) {
      console.log("Conexão inicial com Google Sheets estabelecida com sucesso")
      garantirAbas()
        .then((resultado) => {
          console.log("Inicialização de abas concluída, resultado:", resultado)
        })
        .catch((erro) => {
          console.error("Erro na inicialização de abas:", erro)
        })
    } else {
      console.log("Não foi possível estabelecer conexão inicial com Google Sheets")
    }
  })
  .catch((erro) => {
    console.error("Erro na conexão inicial:", erro)
  })
