"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "pt" | "es" | "en"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Traduções completas
const translations: Record<Language, Record<string, string>> = {
  pt: {
    "form.title": "Formulário de Treinamento",
    "form.description":
      "Preencha o formulário abaixo para agendar um treinamento. Nossa equipe de suporte está pronta para atender às suas necessidades.",
    "form.step": "Etapa",
    "form.of": "de",
    "form.next": "Avançar",
    "form.back": "Voltar",
    "form.finish": "Concluir",
    "form.processing": "Processando...",
    "personal.title": "Dados do Treinamento",
    "personal.participants": "Participantes",
    "personal.participant_name": "Nome do participante",
    "personal.add_at_least_one": "Adicione pelo menos um participante",
    "personal.company": "Nome da Empresa",
    "personal.company_placeholder": "Nome da empresa",
    "personal.phone": "Telefone/WhatsApp",
    "personal.phone_placeholder": "(00) 00000-0000",
    "personal.email": "E-mail",
    "personal.email_placeholder": "email@exemplo.com",
    "personal.add_participant": "Adicionar participante",
    "personal.add_phone": "Adicionar telefone",
    "personal.add_email": "Adicionar e-mail",
    "personal.training_type": "Desejo receber um:",
    "personal.complete_training": "Treinamento Completo",
    "personal.custom_training": "Treinamento Personalizado",
    "personal.recording":
      "Você autoriza a gravação do treinamento (áudio e/ou vídeo) para envio posterior e registro interno?",
    "personal.yes_authorize": "Sim, autorizo",
    "personal.no_authorize": "Não autorizo",
    "personal.terms": "Ao enviar, você concorda com o uso dos seus dados conforme nossos",
    "personal.privacy_terms": "Termos de Privacidade",
    "options.title": "Escolha as opções de treinamento",
    "options.product_admin": "Administração de Produtos",
    "options.price_admin": "Administração de Preços",
    "options.photo_admin": "Administração de Fotos",
    "options.data_update": "Atualização de Dados em Massa",
    "options.send_update": "Enviar uma Atualização para o Catálogo",
    "options.figure_admin": "Administração de Figura Vista Explodida",
    "options.user_admin": "Administração de Usuários da Manutenção",
    "options.client_admin": "Administração de Clientes do Catálogo",
    "options.catalog_config": "Configurações do Catálogo",
    "options.dont_need": "Não preciso",
    "options.brief": "Breve Explicação",
    "options.complete": "Explicação Completa",
    "options.all_dont_need": "Não é possível continuar sem selecionar a explicação de algum recurso.",
    "schedule.title": "Agende seu Treinamento",
    "schedule.description": "Selecione a data e horário para o seu treinamento.",
    "schedule.date": "Data",
    "schedule.time": "Horário",
    "schedule.select_date": "Selecione uma data",
    "schedule.select_time": "Selecione um horário",
    "schedule.confirmation": "Confirmação do Agendamento",
    "schedule.confirmation_text": "Seu treinamento será agendado para",
    "schedule.at": "às",
    "schedule.error_loading": "Não foi possível carregar as datas disponíveis. Por favor, tente novamente mais tarde.",
    "success.title": "Formulário Enviado",
    "success.heading": "Formulário enviado com sucesso!",
    "success.message1": "Em breve você receberá o link do treinamento por E-mail.",
    "success.message2": "A Ideia 2001 agradece seu contato!",
    "success.back": "Voltar ao início",
    "personal.phone_invalid": "Número de telefone inválido. Confirme se o número tem DDD e está completo.",
    "personal.email_invalid": "Endereço de e-mail inválido. Preencha corretamente para continuar.",
    "options.error_title": "Opções não selecionadas",
    "options.error_message": "Selecione pelo menos uma opção de treinamento",
    "schedule.error_title": "Data não selecionada",
    "schedule.error_message": "Selecione uma data e horário para o treinamento",
    "personal.error_title": "Erro de validação",
  },
  es: {
    "form.title": "Formulario de Entrenamiento",
    "form.description":
      "Complete el formulario a continuación para programar un entrenamiento. Nuestro equipo de soporte está listo para atender sus necesidades.",
    "form.step": "Paso",
    "form.of": "de",
    "form.next": "Siguiente",
    "form.back": "Atrás",
    "form.finish": "Finalizar",
    "form.processing": "Procesando...",
    "personal.title": "Datos del Entrenamiento",
    "personal.participants": "Participantes",
    "personal.participant_name": "Nombre del participante",
    "personal.add_at_least_one": "Añada al menos un participante",
    "personal.company": "Nombre de la Empresa",
    "personal.company_placeholder": "Nombre de la empresa",
    "personal.phone": "Teléfono/WhatsApp",
    "personal.phone_placeholder": "(00) 00000-0000",
    "personal.email": "Correo electrónico",
    "personal.email_placeholder": "correo@ejemplo.com",
    "personal.add_participant": "Añadir participante",
    "personal.add_phone": "Añadir teléfono",
    "personal.add_email": "Añadir correo electrónico",
    "personal.training_type": "Deseo recibir un:",
    "personal.complete_training": "Entrenamiento Completo",
    "personal.custom_training": "Entrenamiento Personalizado",
    "personal.recording":
      "¿Autoriza la grabación del entrenamiento (audio y/o video) para envío posterior y registro interno?",
    "personal.yes_authorize": "Sí, autorizo",
    "personal.no_authorize": "No autorizo",
    "personal.terms": "Al enviar, acepta el uso de sus datos según nuestros",
    "personal.privacy_terms": "Términos de Privacidad",
    "options.title": "Elija las opciones de entrenamiento",
    "options.product_admin": "Administración de Productos",
    "options.price_admin": "Administración de Precios",
    "options.photo_admin": "Administración de Fotos",
    "options.data_update": "Actualización de Datos en Masa",
    "options.send_update": "Enviar una Actualización al Catálogo",
    "options.figure_admin": "Administración de Figura Vista Explotada",
    "options.user_admin": "Administración de Usuarios del Mantenimiento",
    "options.client_admin": "Administración de Clientes del Catálogo",
    "options.catalog_config": "Configuraciones del Catálogo",
    "options.dont_need": "No necesito",
    "options.brief": "Breve Explicación",
    "options.complete": "Explicación Completa",
    "options.all_dont_need": "No es posible continuar sin seleccionar la explicación de algún recurso.",
    "schedule.title": "Programe su Entrenamiento",
    "schedule.description": "Seleccione la fecha y hora para su entrenamiento.",
    "schedule.date": "Fecha",
    "schedule.time": "Hora",
    "schedule.select_date": "Seleccione una fecha",
    "schedule.select_time": "Seleccione una hora",
    "schedule.confirmation": "Confirmación de la Programación",
    "schedule.confirmation_text": "Su entrenamiento será programado para",
    "schedule.at": "a las",
    "schedule.error_loading": "No se pudieron cargar las fechas disponibles. Por favor, inténtelo de nuevo más tarde.",
    "success.title": "Formulario Enviado",
    "success.heading": "¡Formulario enviado con éxito!",
    "success.message1": "Pronto recibirá el enlace del entrenamiento por correo electrónico.",
    "success.message2": "¡Ideia 2001 agradece su contacto!",
    "success.back": "Volver al inicio",
    "personal.phone_invalid":
      "Número de teléfono inválido. Confirme que el número tiene código de área y está completo.",
    "personal.email_invalid": "Dirección de correo electrónico inválida. Complete correctamente para continuar.",
    "options.error_title": "Opciones no seleccionadas",
    "options.error_message": "Seleccione al menos una opción de entrenamiento",
    "schedule.error_title": "Fecha no seleccionada",
    "schedule.error_message": "Seleccione una fecha y hora para el entrenamiento",
    "personal.error_title": "Error de validación",
  },
  en: {
    "form.title": "Training Form",
    "form.description": "Fill out the form below to schedule a training. Our support team is ready to meet your needs.",
    "form.step": "Step",
    "form.of": "of",
    "form.next": "Next",
    "form.back": "Back",
    "form.finish": "Finish",
    "form.processing": "Processing...",
    "personal.title": "Training Data",
    "personal.participants": "Participants",
    "personal.participant_name": "Participant name",
    "personal.add_at_least_one": "Add at least one participant",
    "personal.company": "Company Name",
    "personal.company_placeholder": "Company name",
    "personal.phone": "Phone/WhatsApp",
    "personal.phone_placeholder": "(00) 00000-0000",
    "personal.email": "Email",
    "personal.email_placeholder": "email@example.com",
    "personal.add_participant": "Add participant",
    "personal.add_phone": "Add phone",
    "personal.add_email": "Add email",
    "personal.training_type": "I want to receive a:",
    "personal.complete_training": "Complete Training",
    "personal.custom_training": "Custom Training",
    "personal.recording":
      "Do you authorize the recording of the training (audio and/or video) for later sending and internal registration?",
    "personal.yes_authorize": "Yes, I authorize",
    "personal.no_authorize": "I do not authorize",
    "personal.terms": "By submitting, you agree to the use of your data according to our",
    "personal.privacy_terms": "Privacy Terms",
    "options.title": "Choose training options",
    "options.product_admin": "Product Administration",
    "options.price_admin": "Price Administration",
    "options.photo_admin": "Photo Administration",
    "options.data_update": "Mass Data Update",
    "options.send_update": "Send an Update to the Catalog",
    "options.figure_admin": "Exploded View Figure Administration",
    "options.user_admin": "Maintenance User Administration",
    "options.client_admin": "Catalog Client Administration",
    "options.catalog_config": "Catalog Settings",
    "options.dont_need": "Don't need",
    "options.brief": "Brief Explanation",
    "options.complete": "Complete Explanation",
    "options.all_dont_need": "It is not possible to continue without selecting the explanation of some resource.",
    "schedule.title": "Schedule Your Training",
    "schedule.description": "Select the date and time for your training.",
    "schedule.date": "Date",
    "schedule.time": "Time",
    "schedule.select_date": "Select a date",
    "schedule.select_time": "Select a time",
    "schedule.confirmation": "Scheduling Confirmation",
    "schedule.confirmation_text": "Your training will be scheduled for",
    "schedule.at": "at",
    "schedule.error_loading": "Could not load available dates. Please try again later.",
    "success.title": "Form Submitted",
    "success.heading": "Form successfully submitted!",
    "success.message1": "You will soon receive the training link by email.",
    "success.message2": "Ideia 2001 appreciates your contact!",
    "success.back": "Back to start",
    "personal.phone_invalid": "Invalid phone number. Confirm that the number has area code and is complete.",
    "personal.email_invalid": "Invalid email address. Fill in correctly to continue.",
    "options.error_title": "Options not selected",
    "options.error_message": "Select at least one training option",
    "schedule.error_title": "Date not selected",
    "schedule.error_message": "Select a date and time for the training",
    "personal.error_title": "Validation error",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")

  // Função para obter a tradução de uma chave
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  // Efeito para carregar o idioma salvo no localStorage (apenas no cliente)
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && ["pt", "es", "en"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Efeito para salvar o idioma no localStorage quando ele mudar
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

// Hook personalizado para usar o contexto de idioma
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
