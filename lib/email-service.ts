import nodemailer from "nodemailer"
import { format } from "date-fns"
import { createEvent } from "ics"

// Lista de links fixos do Google Meet
const MEET_LINKS = 

  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar", 
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar",
  "https://meet.google.com/não posso informar", 
]

// Interface para os dados do convite
interface DadosConvite {
  participantes: { nome: string; email: string }[]
  dataHora: Date
  empresa: string
  tipoTreinamento: string
}

// Configuração do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "email-ssl.com.br",
  port: Number.parseInt(process.env.EMAIL_PORT || "465"),
  secure: true, // Forçando secure como true para porta 465
  auth: {
    user: process.env.EMAIL_USER || "NÃOPOSSOINFORMAR",
    pass: process.env.EMAIL_PASSWORD || "NÃOPOSSOINFORMAR",
  },
  tls: {
    // Não rejeitar certificados autoassinados
    rejectUnauthorized: false,
  },
})

// Função para obter um link aleatório do Google Meet
function obterLinkMeetAleatorio(): string {
  const indiceAleatorio = Math.floor(Math.random() * MEET_LINKS.length)
  return MEET_LINKS[indiceAleatorio]
}

// Função para criar um evento de calendário ICS
function criarEventoCalendarioICS(dados: DadosConvite, meetLink: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Duração padrão de 2 horas para o treinamento
    const dataInicio = dados.dataHora
    const dataFim = new Date(dataInicio)
    dataFim.setHours(dataFim.getHours() + 2)

    // Criar evento
    createEvent(
      {
        start: [
          dataInicio.getFullYear(),
          dataInicio.getMonth() + 1,
          dataInicio.getDate(),
          dataInicio.getHours(),
          dataInicio.getMinutes(),
        ],
        duration: { hours: 2, minutes: 0 },
        title: `Treinamento ${dados.tipoTreinamento} - ${dados.empresa}`,
        description: `Treinamento ${dados.tipoTreinamento} para ${dados.empresa}.

Link da reunião: ${meetLink}`,
        location: "Online via Google Meet",
        url: meetLink,
        status: "CONFIRMED",
        busyStatus: "BUSY",
        organizer: { name: "Ideia2001", email: process.env.EMAIL_USER || "NÃOPOSSOINFORMAR" },
        attendees: dados.participantes.map((p) => ({
          name: p.nome,
          email: p.email,
          rsvp: true,
          partstat: "NEEDS-ACTION",
          role: "REQ-PARTICIPANT",
        })),
      },
      (error, value) => {
        if (error) {
          reject(error)
        } else {
          resolve(value)
        }
      },
    )
  })
}

// Função para enviar convite de reunião
export async function enviarConviteReuniao(dados: DadosConvite): Promise<boolean> {
  try {
    console.log("Iniciando envio de convite de reunião...")
    console.log(`Total de participantes: ${dados.participantes.length}`)

    // Verificar se há participantes
    if (dados.participantes.length === 0) {
      console.log("Nenhum participante com e-mail para enviar convite")
      return false
    }

    // Duração padrão de 2 horas para o treinamento
    const dataInicio = dados.dataHora
    const dataFim = new Date(dataInicio)
    dataFim.setHours(dataFim.getHours() + 2)

    // Obter um link aleatório do Google Meet
    const meetLink = obterLinkMeetAleatorio()
    console.log(`Link do Meet selecionado: ${meetLink}`)

    // Criar arquivo ICS
    const eventoICS = await criarEventoCalendarioICS(dados, meetLink)

    // Preparar e-mail
    const dataFormatada = format(dados.dataHora, "dd/MM/yyyy 'às' HH:mm")
    const assunto = `Convite: Treinamento ${dados.tipoTreinamento} - ${dados.empresa} (${dataFormatada})`

    // Template HTML com logo
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
          <img src="cid:logo" alt="Ideia2001" style="max-width: 200px; height: auto;" />
        </div>
        <div style="padding: 20px; border: 1px solid #e5e5e5; border-top: none;">
          <p>Olá,</p>
          <p>Você foi convidado para um treinamento ${dados.tipoTreinamento} da Ideia2001.</p>
          <p><strong>Data e hora:</strong> ${dataFormatada}</p>
          <p><strong>Empresa:</strong> ${dados.empresa}</p>
          <p><strong>Link da reunião:</strong> <a href="${meetLink}" target="_blank">${meetLink}</a></p>
          <p>Este convite contém um arquivo .ics que você pode adicionar ao seu calendário. Para utilizá-lo:</p>
          <ol>
            <li>Abra o arquivo anexo "convite.ics"</li>
            <li>Seu aplicativo de calendário (como Google Calendar, Outlook, etc.) deverá abrir automaticamente</li>
            <li>Confirme a adição do evento ao seu calendário</li>
            <li>O evento será adicionado com todos os detalhes e lembretes</li>
          </ol>
          <p>Atenciosamente,<br>Equipe Ideia2001</p>
        </div>
      </div>
    `

    // Enviar e-mail para cada participante
    const sucessos = []
    const falhas = []

    for (const participante of dados.participantes) {
      if (!participante.email) continue

      console.log(`Enviando convite para ${participante.nome} (${participante.email})...`)

      try {
        // Preparar anexos
        const anexos = [
          {
            filename: "logo-ideia2001.png",
            path: "./public/images/logo-ideia2001.png",
            cid: "logo", // ID de referência para uso no HTML
          },
          {
            filename: "convite.ics",
            content: eventoICS,
            contentType: "text/calendar",
          },
        ]

        const info = await transporter.sendMail({
          from: `"Ideia2001" <${process.env.EMAIL_USER || "NÃOPOSSOINFORMAR"}>`,
          to: participante.email,
          subject: assunto,
          html: html,
          attachments: anexos,
        })

        console.log(
          `Convite enviado para ${participante.nome} (${participante.email}). ID da mensagem: ${info.messageId}`,
        )
        sucessos.push(participante.email)
      } catch (emailError) {
        console.error(`Erro ao enviar e-mail para ${participante.email}:`, emailError)
        falhas.push(participante.email)
      }
    }

    console.log(`Envio de convites concluído. Sucessos: ${sucessos.length}, Falhas: ${falhas.length}`)

    // Retornar true se pelo menos um e-mail foi enviado com sucesso
    return sucessos.length > 0
  } catch (error) {
    console.error("Erro ao enviar convite de reunião:", error)
    return false
  }
}
