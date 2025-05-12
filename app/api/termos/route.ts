import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Obter o idioma da query string
    const searchParams = request.nextUrl.searchParams
    const lang = searchParams.get("lang") || "pt"

    // Caminho para os arquivos de termos em diferentes idiomas
    const termosPath = path.join(process.cwd(), "data", `termos-privacidade-${lang}.html`)
    const termosPathDefault = path.join(process.cwd(), "data", "termos-privacidade.html")

    // Verificar se o arquivo específico do idioma existe
    let conteudo: string
    try {
      await fs.access(termosPath)
      conteudo = await fs.readFile(termosPath, "utf-8")
    } catch (error) {
      // Se o arquivo específico do idioma não existir, tentar o arquivo padrão
      try {
        await fs.access(termosPathDefault)
        conteudo = await fs.readFile(termosPathDefault, "utf-8")

        // Se estamos usando o arquivo padrão mas o idioma não é português,
        // devemos traduzir o conteúdo programaticamente ou usar um fallback
        if (lang !== "pt") {
          conteudo = getConteudoFallback(lang)
        }
      } catch (dirError) {
        // Se nem mesmo o arquivo padrão existir, criar o diretório e o arquivo
        const dataDir = path.join(process.cwd(), "data")
        try {
          await fs.access(dataDir)
        } catch (dirError) {
          await fs.mkdir(dataDir, { recursive: true })
        }

        // Usar o conteúdo fallback para o idioma solicitado
        conteudo = getConteudoFallback(lang)

        // Salvar o conteúdo fallback como arquivo padrão se não existir
        await fs.writeFile(termosPathDefault, getConteudoFallback("pt"), "utf-8")
      }
    }

    return NextResponse.json({ conteudo })
  } catch (error) {
    console.error("Erro ao obter termos de privacidade:", error)
    return NextResponse.json({ erro: "Não foi possível carregar os termos de privacidade" }, { status: 500 })
  }
}

// Função para obter conteúdo fallback em diferentes idiomas
function getConteudoFallback(lang: string): string {
  const conteudos: Record<string, string> = {
    pt: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidade | Ideia2001</title>
  <style>
    body {
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }

    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }

    h2 {
      text-align: center;
      color: #0059b3;
      margin-bottom: 10px;
    }

    p.update-date {
      text-align: center;
      font-size: 0.9rem;
      color: #777;
      margin-bottom: 30px;
    }

    h3 {
      color: #004080;
      margin-top: 30px;
    }

    ul {
      padding-left: 20px;
    }

    ul li {
      margin-bottom: 8px;
    }

    a {
      color: #0059b3;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Política de Privacidade da Ideia2001</h2>
    <p class="update-date"><strong>Última atualização:</strong> 30 de abril de 2025</p>

    <h3>1. Introdução</h3>
    <p>A Ideia2001 está comprometida com a proteção da sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais ao utilizar nossos serviços de treinamento e suporte.</p>

    <h3>2. Informações que Coletamos</h3>
    <p>Coletamos os seguintes dados pessoais:</p>
    <ul>
      <li>Nome completo</li>
      <li>Nome da empresa</li>
      <li>Telefone e WhatsApp</li>
      <li>E-mail</li>
      <li>Preferências de treinamento</li>
      <li>Data e hora de agendamentos</li>
      <li>Autorização para gravações de treinamentos</li>
    </ul>

    <h3>3. Como Usamos Suas Informações</h3>
    <ul>
      <li>Agendamentos e confirmações</li>
      <li>Suporte técnico e acompanhamento de chamados</li>
      <li>Envio de materiais, convites e atualizações sobre treinamentos</li>
      <li>Contato para assuntos pendentes</li>
      <li>Divulgação de novidades e melhorias dos nossos serviços</li>
    </ul>

    <h3>4. Compartilhamento de Informações</h3>
    <p>Não compartilhamos suas informações com terceiros. O único compartilhamento ocorre com autoridades legais, quando exigido. Eventualmente, podemos usar ferramentas como Google Sheets para fins internos e organizacionais.</p>

    <h3>5. Segurança dos Dados</h3>
    <p>Adotamos medidas técnicas e organizacionais para proteger suas informações contra acessos não autorizados, perdas ou usos indevidos.</p>

    <h3>6. Seus Direitos</h3>
    <p>Você pode solicitar acesso, correção, exclusão dos dados ou revogação do consentimento a qualquer momento.</p>

    <h3>7. Retenção de Dados</h3>
    <p>Seus dados são armazenados pelo tempo necessário para os fins informados, ou conforme exigido por lei.</p>

    <h3>8. Atualizações desta Política</h3>
    <p>Podemos atualizar esta Política periodicamente. A versão mais recente estará sempre disponível em nosso site.</p>

    <h3>9. Contato</h3>
    <p>Para dúvidas ou solicitações sobre privacidade, entre em contato com a gente:</p>
    <ul>
      <li><strong>Telefone:</strong> (11) 2917-5277</li>
      <li><strong>E-mail:</strong> <a href="mailto:suporte@ideia2001.com.br">suporte@ideia2001.com.br</a></li>
    </ul>
  </div>
</body>
</html>
    `,
    es: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Privacidad | Ideia2001</title>
  <style>
    body {
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }

    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }

    h2 {
      text-align: center;
      color: #0059b3;
      margin-bottom: 10px;
    }

    p.update-date {
      text-align: center;
      font-size: 0.9rem;
      color: #777;
      margin-bottom: 30px;
    }

    h3 {
      color: #004080;
      margin-top: 30px;
    }

    ul {
      padding-left: 20px;
    }

    ul li {
      margin-bottom: 8px;
    }

    a {
      color: #0059b3;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Política de Privacidad de Ideia2001</h2>
    <p class="update-date"><strong>Última actualización:</strong> 30 de abril de 2025</p>

    <h3>1. Introducción</h3>
    <p>Ideia2001 está comprometida con la protección de su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando utiliza nuestros servicios de capacitación y soporte.</p>

    <h3>2. Información que Recopilamos</h3>
    <p>Recopilamos los siguientes datos personales:</p>
    <ul>
      <li>Nombre completo</li>
      <li>Nombre de la empresa</li>
      <li>Teléfono y WhatsApp</li>
      <li>Correo electrónico</li>
      <li>Preferencias de capacitación</li>
      <li>Fecha y hora de programaciones</li>
      <li>Autorización para grabaciones de capacitaciones</li>
    </ul>

    <h3>3. Cómo Usamos Su Información</h3>
    <ul>
      <li>Programaciones y confirmaciones</li>
      <li>Soporte técnico y seguimiento de solicitudes</li>
      <li>Envío de materiales, invitaciones y actualizaciones sobre capacitaciones</li>
      <li>Contacto para asuntos pendientes</li>
      <li>Divulgación de novedades y mejoras de nuestros servicios</li>
    </ul>

    <h3>4. Compartir Información</h3>
    <p>No compartimos su información con terceros. El único intercambio ocurre con autoridades legales, cuando es requerido. Eventualmente, podemos usar herramientas como Google Sheets para fines internos y organizacionales.</p>

    <h3>5. Seguridad de Datos</h3>
    <p>Adoptamos medidas técnicas y organizativas para proteger su información contra accesos no autorizados, pérdidas o usos indebidos.</p>

    <h3>6. Sus Derechos</h3>
    <p>Puede solicitar acceso, corrección, eliminación de datos o revocación del consentimiento en cualquier momento.</p>

    <h3>7. Retención de Datos</h3>
    <p>Sus datos se almacenan por el tiempo necesario para los fines informados, o según lo exija la ley.</p>

    <h3>8. Actualizaciones de esta Política</h3>
    <p>Podemos actualizar esta Política periódicamente. La versión más reciente siempre estará disponible en nuestro sitio web.</p>

    <h3>9. Contacto</h3>
    <p>Para preguntas o solicitudes sobre privacidad, contáctenos:</p>
    <ul>
      <li><strong>Teléfono:</strong> (11) 2917-5277</li>
      <li><strong>Correo electrónico:</strong> <a href="mailto:soporte@ideia2001.com.br">soporte@ideia2001.com.br</a></li>
    </ul>
  </div>
</body>
</html>
    `,
    en: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy | Ideia2001</title>
  <style>
    body {
      font-family: "Segoe UI", Roboto, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }

    .container {
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }

    h2 {
      text-align: center;
      color: #0059b3;
      margin-bottom: 10px;
    }

    p.update-date {
      text-align: center;
      font-size: 0.9rem;
      color: #777;
      margin-bottom: 30px;
    }

    h3 {
      color: #004080;
      margin-top: 30px;
    }

    ul {
      padding-left: 20px;
    }

    ul li {
      margin-bottom: 8px;
    }

    a {
      color: #0059b3;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Ideia2001 Privacy Policy</h2>
    <p class="update-date"><strong>Last updated:</strong> April 30, 2025</p>

    <h3>1. Introduction</h3>
    <p>Ideia2001 is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our training and support services.</p>

    <h3>2. Information We Collect</h3>
    <p>We collect the following personal data:</p>
    <ul>
      <li>Full name</li>
      <li>Company name</li>
      <li>Phone and WhatsApp</li>
      <li>Email</li>
      <li>Training preferences</li>
      <li>Scheduling date and time</li>
      <li>Authorization for training recordings</li>
    </ul>

    <h3>3. How We Use Your Information</h3>
    <ul>
      <li>Scheduling and confirmations</li>
      <li>Technical support and ticket tracking</li>
      <li>Sending materials, invitations, and updates about trainings</li>
      <li>Contact for pending matters</li>
      <li>Disclosure of news and improvements to our services</li>
    </ul>

    <h3>4. Information Sharing</h3>
    <p>We do not share your information with third parties. The only sharing occurs with legal authorities when required. Eventually, we may use tools like Google Sheets for internal and organizational purposes.</p>

    <h3>5. Data Security</h3>
    <p>We adopt technical and organizational measures to protect your information against unauthorized access, loss, or misuse.</p>

    <h3>6. Your Rights</h3>
    <p>You can request access, correction, deletion of data, or revocation of consent at any time.</p>

    <h3>7. Data Retention</h3>
    <p>Your data is stored for as long as necessary for the stated purposes, or as required by law.</p>

    <h3>8. Updates to this Policy</h3>
    <p>We may update this Policy periodically. The most recent version will always be available on our website.</p>

    <h3>9. Contact</h3>
    <p>For questions or requests about privacy, contact us:</p>
    <ul>
      <li><strong>Phone:</strong> (11) 2917-5277</li>
      <li><strong>Email:</strong> <a href="mailto:support@ideia2001.com.br">support@ideia2001.com.br</a></li>
    </ul>
  </div>
</body>
</html>
    `,
  }

  return conteudos[lang as keyof typeof conteudos] || conteudos.pt
}
