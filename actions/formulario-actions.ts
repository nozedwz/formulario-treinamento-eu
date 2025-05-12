"use server"

import { revalidatePath } from "next/cache"
import { salvarTreinamento, salvarOpcoesTreinamento, verificarDataBloqueada } from "@/lib/google-sheets"
import { enviarConviteReuniao } from "@/lib/email-service"
import { verificarAgendamentoExistenteJSON } from "@/actions/datas-disponiveis"
import { salvarTreinamentoSimplificado } from "@/utils/json-utils"

// Tipo para os dados do formulário
type DadosFormulario = {
  participantes: { nome: string }[]
  empresa: string
  telefones: { numero: string }[]
  emails: { email: string }[]
  tipoTreinamento: "completo" | "personalizado"
  autorizaGravacao: "sim" | "nao"
  aceitouTermos: boolean
  opcoesTreinamento: Record<string, string>
  dataHora?: Date
}

// Função para enviar os dados do formulário para o Google Sheets
export async function enviarFormulario(dados: DadosFormulario) {
  "use server"

  try {
    console.log("Dados do formulário recebidos:", JSON.stringify(dados, null, 2))

    // Verificar disponibilidade da data e horário
    if (dados.dataHora) {
      const dataString = dados.dataHora.toISOString().split("T")[0]
      const horario = `${dados.dataHora.getHours().toString().padStart(2, "0")}:${dados.dataHora.getMinutes().toString().padStart(2, "0")}`

      console.log(`Verificando disponibilidade para ${dataString} às ${horario}...`)

      // Verificar se a data está bloqueada
      const dataBloqueada = await verificarDataBloqueada(dataString)
      if (dataBloqueada) {
        return {
          sucesso: false,
          mensagem: "Esta data não está disponível para agendamento. Por favor, escolha outra data.",
        }
      }

      // Verificar se já existe um agendamento para esta data (ignorando o horário)
      const agendamentoExistente = await verificarAgendamentoExistenteJSON(dataString, horario)
      if (agendamentoExistente) {
        return {
          sucesso: false,
          mensagem: "Esta data já está agendada. Por favor, escolha outra data.",
        }
      }
    }

    // Verificar o valor de autorizaGravacao
    console.log(`Valor de autorizaGravacao: ${dados.autorizaGravacao}`)

    // Salvar treinamento no Google Sheets
    const treinamentoId = await salvarTreinamento({
      empresa: dados.empresa,
      tipoTreinamento: dados.tipoTreinamento,
      participantes: JSON.stringify(dados.participantes),
      telefones: JSON.stringify(dados.telefones),
      emails: JSON.stringify(dados.emails),
      agendamento: dados.dataHora ? dados.dataHora.toISOString() : undefined,
      dataCriacao: new Date().toISOString(),
      status: "agendado",
      autorizaGravacao: dados.autorizaGravacao,
    })

    if (!treinamentoId) {
      throw new Error("Falha ao salvar o treinamento no Google Sheets")
    }

    // Salvar opções de treinamento
    await salvarOpcoesTreinamento(treinamentoId, dados.opcoesTreinamento)

    // Salvar apenas ID e dataHora no arquivo JSON local (por segurança)
    await salvarTreinamentoSimplificado(treinamentoId, dados.dataHora ? dados.dataHora.toISOString() : null)

    // Enviar convites de reunião por e-mail
    if (dados.dataHora && dados.emails && dados.emails.length > 0) {
      // Preparar dados para o convite
      const participantesComEmail = dados.participantes
        .map((p, index) => {
          return {
            nome: p.nome,
            email: dados.emails[index]?.email || "",
          }
        })
        .filter((p) => p.email) // Filtrar apenas participantes com e-mail

      if (participantesComEmail.length > 0) {
        console.log(`Enviando convites para ${participantesComEmail.length} participantes...`)
        await enviarConviteReuniao({
          participantes: participantesComEmail,
          dataHora: dados.dataHora,
          empresa: dados.empresa,
          tipoTreinamento: dados.tipoTreinamento,
        })
      }
    }

    // Revalidar a página para atualizar os dados
    revalidatePath("/")

    return { sucesso: true, mensagem: "Formulário enviado com sucesso!" }
  } catch (error) {
    console.error("Erro ao processar formulário:", error)
    return {
      sucesso: false,
      mensagem: `Não foi possível processar o formulário: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
