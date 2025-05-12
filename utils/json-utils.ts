import fs from "fs/promises"
import path from "path"

// Caminho para o arquivo JSON
const jsonFilePath = path.join(process.cwd(), "data", "treinamentos.json")

// Tipo simplificado para os dados do treinamento (apenas ID e dataHora)
export type TreinamentoSimplificado = {
  id: number | string
  dataHora: string | null
}

// Tipo completo para os dados do treinamento (para referência)
export type Treinamento = {
  id: number | string
  empresa: string
  tipoTreinamento: "completo" | "personalizado"
  participantes: { nome: string }[]
  telefones: { numero: string }[]
  emails: { email: string }[]
  opcoesTreinamento: Record<string, string | number>
  dataHora: string | null
  dataCriacao: string
}

// Função para ler todos os treinamentos do arquivo JSON
export async function lerTreinamentos(): Promise<TreinamentoSimplificado[]> {
  try {
    // Verificar se o diretório data existe
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch (error) {
      // Diretório não existe, criar
      await fs.mkdir(dataDir, { recursive: true })
      // Retornar array vazio já que não há arquivo ainda
      return []
    }

    // Verificar se o arquivo existe
    try {
      await fs.access(jsonFilePath)
    } catch (error) {
      // Arquivo não existe, criar um vazio
      await fs.writeFile(jsonFilePath, "[]", "utf-8")
      return []
    }

    // Ler o arquivo
    const fileContent = await fs.readFile(jsonFilePath, "utf-8")
    console.log("Conteúdo do arquivo JSON:", fileContent)

    try {
      const treinamentos = JSON.parse(fileContent)
      console.log("Treinamentos parseados:", JSON.stringify(treinamentos, null, 2))
      return treinamentos
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError)
      return []
    }
  } catch (error) {
    console.error("Erro ao ler arquivo JSON:", error)
    return []
  }
}

// Função para salvar um treinamento simplificado no arquivo JSON
export async function salvarTreinamentoSimplificado(id: string, dataHora: string | null): Promise<boolean> {
  try {
    // Criar diretório data se não existir
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Verificar se o arquivo existe
    let treinamentos: TreinamentoSimplificado[] = []
    try {
      const fileContent = await fs.readFile(jsonFilePath, "utf-8")
      treinamentos = JSON.parse(fileContent)
    } catch (error) {
      // Arquivo não existe ou está vazio, criar um novo array
      treinamentos = []
    }

    // Adicionar novo treinamento com ID e dataHora apenas
    treinamentos.push({
      id,
      dataHora,
    })

    // Salvar arquivo atualizado
    await fs.writeFile(jsonFilePath, JSON.stringify(treinamentos, null, 2), "utf-8")

    console.log(`Dados simplificados salvos em JSON com sucesso: ${jsonFilePath}`)
    console.log(`Conteúdo salvo:`, JSON.stringify(treinamentos, null, 2))
    return true
  } catch (error) {
    console.error("Erro ao salvar dados em JSON:", error)
    return false
  }
}

// Função para extrair data e hora de uma string ISO ou formato DD/MM/YYYY HH:MM
export function extrairDataHora(dataHoraStr: string): { data: string; hora: string } | null {
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
