// Este script testa a conexão com o Google Sheets
const { GoogleSpreadsheet } = require("google-spreadsheet")
const fs = require("fs")
const path = require("path")

// Caminho para o arquivo de credenciais
const CREDENTIALS_PATH = path.join(process.cwd(), "formulariotreinamento-96bebae6b65b.json")

// ID da planilha - usando a variável de ambiente ou um valor padrão para teste
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || "1m5ZgHpJ1X8OSGMc7ATsTrSy_IM_PLh2xrT7ubgW2_gQ"

async function testConnection() {
  try {
    console.log("=== TESTE DE CONEXÃO COM O GOOGLE SHEETS ===")
    console.log("ID da planilha:", SPREADSHEET_ID)

    // Verificar se o arquivo de credenciais existe
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error(`Arquivo de credenciais não encontrado: ${CREDENTIALS_PATH}`)
      process.exit(1)
    }

    console.log("Arquivo de credenciais encontrado, lendo...")

    // Ler o arquivo de credenciais
    const credentialsContent = fs.readFileSync(CREDENTIALS_PATH, "utf-8")
    const credentials = JSON.parse(credentialsContent)

    console.log("Credenciais lidas com sucesso")
    console.log("Email da conta de serviço:", credentials.client_email)

    // Inicializar o documento
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID)

    console.log("Cliente JWT criado, autenticando com as credenciais...")

    // Usar autenticação diretamente com as credenciais
    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    })

    console.log("Autenticação realizada, carregando informações do documento...")

    // Carregar informações do documento
    await doc.loadInfo()

    console.log("=== CONEXÃO BEM-SUCEDIDA! ===")
    console.log("Título do documento:", doc.title)
    console.log("Planilhas disponíveis:")

    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.title} (${sheet.rowCount} linhas)`)
    })

    console.log("\nTeste concluído com sucesso!")
  } catch (error) {
    console.error("=== ERRO NA CONEXÃO ===")
    console.error("Detalhes do erro:", error)
    if (error.response) {
      console.error("Resposta da API:", error.response.data)
      console.error("Status HTTP:", error.response.status)
    }
    process.exit(1)
  }
}

// Executar o teste
testConnection()
