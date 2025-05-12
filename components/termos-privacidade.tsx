"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"

interface TermosPrivacidadeProps {
  language?: string
}

export function TermosPrivacidade({ language }: TermosPrivacidadeProps) {
  const { language: contextLanguage } = useLanguage()
  const currentLanguage = language || contextLanguage
  const [conteudo, setConteudo] = useState<string>("")
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarTermos() {
      try {
        setCarregando(true)
        const resposta = await fetch(`/api/termos?lang=${currentLanguage}`)
        if (resposta.ok) {
          const dados = await resposta.json()
          setConteudo(dados.conteudo)
        } else {
          // Fallback para conteúdo padrão em caso de erro
          setConteudo(getConteudoFallback(currentLanguage))
        }
      } catch (error) {
        console.error("Erro ao carregar termos:", error)
        setConteudo(getConteudoFallback(currentLanguage))
      } finally {
        setCarregando(false)
      }
    }

    carregarTermos()
  }, [currentLanguage])

  if (carregando) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: conteudo }} />
    </div>
  )
}

// Função para obter conteúdo fallback em diferentes idiomas (versão simplificada)
function getConteudoFallback(lang: string): string {
  const conteudos: Record<string, string> = {
    pt: `
      <div class="dark:text-white">
        <h2 class="text-center text-blue-700 dark:text-blue-400">Política de Privacidade da Ideia2001</h2>
        <p class="text-center text-gray-600 dark:text-gray-400"><strong>Última atualização:</strong> 30 de abril de 2025</p>
        <h3 class="text-blue-800 dark:text-blue-300">1. Introdução</h3>
        <p>A Ideia2001 está comprometida com a proteção da sua privacidade.</p>
        <h3 class="text-blue-800 dark:text-blue-300">2. Informações que Coletamos</h3>
        <p>Coletamos dados como nome, empresa, contatos e preferências de treinamento.</p>
        <h3 class="text-blue-800 dark:text-blue-300">3. Como Usamos Suas Informações</h3>
        <p>Utilizamos para agendamentos, suporte e envio de materiais de treinamento.</p>
        <h3 class="text-blue-800 dark:text-blue-300">9. Contato</h3>
        <p>Para dúvidas: (11) 2917-5277 ou suporte@ideia2001.com.br</p>
      </div>
    `,
    es: `
      <div class="dark:text-white">
        <h2 class="text-center text-blue-700 dark:text-blue-400">Política de Privacidad de Ideia2001</h2>
        <p class="text-center text-gray-600 dark:text-gray-400"><strong>Última actualización:</strong> 30 de abril de 2025</p>
        <h3 class="text-blue-800 dark:text-blue-300">1. Introducción</h3>
        <p>Ideia2001 está comprometida con la protección de su privacidad.</p>
        <h3 class="text-blue-800 dark:text-blue-300">2. Información que Recopilamos</h3>
        <p>Recopilamos datos como nombre, empresa, contactos y preferencias de capacitación.</p>
        <h3 class="text-blue-800 dark:text-blue-300">3. Cómo Usamos Su Información</h3>
        <p>Utilizamos para programaciones, soporte y envío de materiales de capacitación.</p>
        <h3 class="text-blue-800 dark:text-blue-300">9. Contacto</h3>
        <p>Para preguntas: (11) 2917-5277 o soporte@ideia2001.com.br</p>
      </div>
    `,
    en: `
      <div class="dark:text-white">
        <h2 class="text-center text-blue-700 dark:text-blue-400">Ideia2001 Privacy Policy</h2>
        <p class="text-center text-gray-600 dark:text-gray-400"><strong>Last updated:</strong> April 30, 2025</p>
        <h3 class="text-blue-800 dark:text-blue-300">1. Introduction</h3>
        <p>Ideia2001 is committed to protecting your privacy.</p>
        <h3 class="text-blue-800 dark:text-blue-300">2. Information We Collect</h3>
        <p>We collect data such as name, company, contacts, and training preferences.</p>
        <h3 class="text-blue-800 dark:text-blue-300">3. How We Use Your Information</h3>
        <p>We use it for scheduling, support, and sending training materials.</p>
        <h3 class="text-blue-800 dark:text-blue-300">9. Contact</h3>
        <p>For questions: (11) 2917-5277 or support@ideia2001.com.br</p>
      </div>
    `,
  }

  return conteudos[lang as keyof typeof conteudos] || conteudos.pt
}
