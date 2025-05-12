"use server"

import { format, addDays, isMonday, isWednesday, isFriday } from "date-fns"
import { bloquearData, desbloquearData, obterDatasBloqueadas } from "@/lib/google-sheets"
import { lerTreinamentos } from "@/utils/json-utils"

// Horários padrão disponíveis
const HORARIOS_PADRAO = ["10:00", "14:00"]

// Interface para datas disponíveis
export interface DataDisponivel {
  data: string
  horarios: string[]
}

// Interface para datas bloqueadas
export interface DataBloqueada {
  data: string
  motivo?: string
}

// Função para obter datas disponíveis
export async function obterDatasDisponiveis(): Promise<DataDisponivel[]> {
  "use server"

  try {
    // Gerar datas disponíveis para os próximos 30 dias
    return await gerarDatasDisponiveis(30)
  } catch (error) {
    console.error("Erro ao obter datas disponíveis:", error)
    return []
  }
}

// Função para obter datas bloqueadas
export async function obterDatasBloqueadasAction(): Promise<DataBloqueada[]> {
  "use server"

  try {
    return await obterDatasBloqueadas()
  } catch (error) {
    console.error("Erro ao obter datas bloqueadas:", error)
    return []
  }
}

// Função para bloquear uma data
export async function bloquearDataAction(data: string, motivo: string): Promise<boolean> {
  "use server"

  try {
    return await bloquearData(data, motivo)
  } catch (error) {
    console.error("Erro ao bloquear data:", error)
    return false
  }
}

// Função para desbloquear uma data
export async function desbloquearDataAction(data: string): Promise<boolean> {
  "use server"

  try {
    return await desbloquearData(data)
  } catch (error) {
    console.error("Erro ao desbloquear data:", error)
    return false
  }
}

// Função para extrair data e hora de uma string ISO ou formato DD/MM/YYYY
function extrairDataHora(dataHoraStr: string): { data: string; hora: string } | null {
  try {
    console.log(`Extraindo data e hora de: ${dataHoraStr}`)

    // Verificar se é formato ISO (contém 'T')
    if (dataHoraStr.includes("T")) {
      // Formato ISO: "2025-05-14T17:00:00.000Z"
      const data = new Date(dataHoraStr)

      // Extrair componentes da data
      const ano = data.getFullYear()
      const mes = String(data.getMonth() + 1).padStart(2, "0")
      const dia = String(data.getDate()).padStart(2, "0")

      // Extrair hora e minutos
      const hora = String(data.getHours()).padStart(2, "0")
      const minutos = String(data.getMinutes()).padStart(2, "0")

      const dataFormatada = `${ano}-${mes}-${dia}`
      const horaFormatada = `${hora}:${minutos}`

      console.log(`Data extraída (ISO): ${dataFormatada}, Hora extraída: ${horaFormatada}`)
      return { data: dataFormatada, hora: horaFormatada }
    }
    // Verificar se é formato DD/MM/YYYY HH:MM
    else if (dataHoraStr.includes("/")) {
      // Tentar extrair data e hora do formato DD/MM/YYYY HH:MM
      const partes = dataHoraStr.split(" ")
      if (partes.length >= 2) {
        const dataStr = partes[0] // DD/MM/YYYY
        const horaStr = partes[1] // HH:MM

        // Converter DD/MM/YYYY para YYYY-MM-DD
        const [dia, mes, ano] = dataStr.split("/")
        const dataFormatada = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`

        console.log(`Data extraída (DD/MM/YYYY): ${dataFormatada}, Hora extraída: ${horaStr}`)
        return { data: dataFormatada, hora: horaStr }
      }
    }

    console.log(`Formato de data não reconhecido: ${dataHoraStr}`)
    return null
  } catch (error) {
    console.error(`Erro ao extrair data e hora de ${dataHoraStr}:`, error)
    return null
  }
}

// Função para verificar se já existe um agendamento para uma data e horário específicos no arquivo JSON
export async function verificarAgendamentoExistenteJSON(data: string, horario: string): Promise<boolean> {
  try {
    console.log(`Verificando agendamento para data ${data} e horário ${horario}...`)
    const treinamentos = await lerTreinamentos()
    console.log(`Total de treinamentos encontrados: ${treinamentos.length}`)
    console.log(`Treinamentos:`, JSON.stringify(treinamentos, null, 2))

    // Verificar cada treinamento
    for (const t of treinamentos) {
      if (!t.dataHora) continue

      console.log(`Analisando treinamento:`, JSON.stringify(t, null, 2))

      // Extrair data e hora do treinamento
      const dataHoraExtraida = extrairDataHora(t.dataHora)
      if (!dataHoraExtraida) continue

      // Verificar apenas a data (ignorando a hora)
      console.log(`Comparando: data=${dataHoraExtraida.data} === ${data}`)

      if (dataHoraExtraida.data === data) {
        console.log(`Agendamento encontrado para o dia ${data} (qualquer horário)`)
        return true
      }
    }

    console.log(`Nenhum agendamento encontrado para o dia ${data}`)
    return false
  } catch (error) {
    console.error("Erro ao verificar agendamento existente no JSON:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return false
  }
}

// Função para gerar datas disponíveis para o próximo mês
export async function gerarDatasDisponiveis(diasAfrente = 30): Promise<{ data: string; horarios: string[] }[]> {
  "use server"

  try {
    console.log(`Gerando datas disponíveis para os próximos ${diasAfrente} dias...`)

    // Carregar datas bloqueadas da API
    const datasBloqueadas = await obterDatasBloqueadas()

    // Carregar treinamentos do arquivo JSON local
    const treinamentos = await lerTreinamentos()

    console.log(`Dados carregados: ${datasBloqueadas.length} datas bloqueadas, ${treinamentos.length} treinamentos`)
    console.log(`Treinamentos carregados:`, JSON.stringify(treinamentos, null, 2))

    // Criar um mapa de datas bloqueadas para acesso rápido
    const datasBloqueadasMap = new Map<string, boolean>()
    datasBloqueadas.forEach((d) => datasBloqueadasMap.set(d.data, true))

    // Criar um conjunto de datas com agendamentos existentes
    const datasAgendadas = new Set<string>()

    // Processar cada treinamento para extrair datas ocupadas
    for (const t of treinamentos) {
      if (t.dataHora) {
        try {
          console.log(`Processando treinamento com dataHora: ${t.dataHora}`)

          // Extrair data e hora do treinamento
          const dataHoraExtraida = extrairDataHora(t.dataHora)
          if (!dataHoraExtraida) continue

          const { data } = dataHoraExtraida
          console.log(`Data extraída: ${data}`)

          // Adicionar a data ao conjunto de datas agendadas
          datasAgendadas.add(data)
          console.log(`Data ${data} marcada como agendada (dia inteiro)`)
        } catch (err) {
          console.error("Erro ao processar data de treinamento:", t.dataHora, err)
        }
      }
    }

    // Imprimir datas agendadas para debug
    console.log("Datas com agendamentos:")
    datasAgendadas.forEach((data) => {
      console.log(`Data: ${data} (dia inteiro bloqueado)`)
    })

    const hoje = new Date()
    const dataLimite = addDays(hoje, diasAfrente)
    const datasDisponiveis = []

    // Iterar pelos próximos dias
    let dataAtual = hoje
    while (dataAtual <= dataLimite) {
      // Verificar se é segunda, quarta ou sexta
      if (isMonday(dataAtual) || isWednesday(dataAtual) || isFriday(dataAtual)) {
        const dataFormatada = format(dataAtual, "yyyy-MM-dd")

        // Verificar se a data não está bloqueada e não tem agendamento
        if (!datasBloqueadasMap.has(dataFormatada) && !datasAgendadas.has(dataFormatada)) {
          // Se a data está disponível, todos os horários padrão estão disponíveis
          datasDisponiveis.push({
            data: dataFormatada,
            horarios: [...HORARIOS_PADRAO], // Clone do array de horários padrão
          })
          console.log(`Data ${dataFormatada} disponível com todos os horários: ${HORARIOS_PADRAO.join(", ")}`)
        } else {
          console.log(
            `Data ${dataFormatada} indisponível: ${datasBloqueadasMap.has(dataFormatada) ? "bloqueada manualmente" : "já tem agendamento"}`,
          )
        }
      }

      // Avançar para o próximo dia
      dataAtual = addDays(dataAtual, 1)
    }

    console.log(`${datasDisponiveis.length} datas disponíveis encontradas`)
    return datasDisponiveis
  } catch (error) {
    console.error("Erro ao gerar datas disponíveis:", error)
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return []
  }
}
