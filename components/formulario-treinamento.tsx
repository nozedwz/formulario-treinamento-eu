"use client"

import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DadosPessoais } from "@/components/etapas/dados-pessoais"
import { OpcoesTreinamento } from "@/components/etapas/opcoes-treinamento"
import { Agendamento } from "@/components/etapas/agendamento"
import { FormularioSucesso } from "@/components/etapas/formulario-sucesso"
import { enviarFormulario } from "@/actions/formulario-actions"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"

// Modificar o schema para validar corretamente o telefone com mensagens personalizadas
const formSchema = z.object({
  participantes: z
    .array(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
      }),
    )
    .min(1, "Adicione pelo menos um participante"),
  empresa: z.string().min(1, "Nome da empresa é obrigatório"),
  telefones: z.array(
    z.object({
      numero: z.string().refine((value) => {
        const numericValue = value.replace(/[^\d]/g, "")
        return numericValue.length >= 8 && numericValue.length <= 14
      }, "Número de telefone inválido. Confirme se o número tem DDD e está completo."),
    }),
  ),
  emails: z.array(
    z.object({
      email: z
        .string()
        .email("Endereço de e-mail inválido. Preencha corretamente para continuar.")
        .min(1, "E-mail é obrigatório"),
    }),
  ),
  tipoTreinamento: z.enum(["completo", "personalizado"]),
  autorizaGravacao: z.enum(["sim", "nao"]),
  aceitouTermos: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos de privacidade para continuar.",
  }),
  opcoesTreinamento: z
    .object({
      cadastroProdutos: z.enum(["naoPreciso", "breveExplicacao", "explicacaoCompleta"]).optional(),
      cadastroPrecos: z.enum(["naoPreciso", "explicacaoCompleta"]).optional(),
      cadastroFotos: z.enum(["naoPreciso", "breveExplicacao", "explicacaoCompleta"]).optional(),
      atualizacaoDados: z.enum(["naoPreciso", "breveExplicacao", "explicacaoCompleta"]).optional(),
      enviarAtualizacao: z.enum(["naoPreciso", "explicacaoCompleta"]).optional(),
      cadastroFigura: z.enum(["naoPreciso", "breveExplicacao", "explicacaoCompleta"]).optional(),
      administracaoUsuarios: z.enum(["naoPreciso", "breveExplicacao", "explicacaoCompleta"]).optional(),
      administracaoClientes: z.enum(["naoPreciso", "breveExplicacao", "explicacaoCompleta"]).optional(),
      configuracoesCatalogo: z.enum(["naoPreciso", "explicacaoCompleta"]).optional(),
    })
    .refine(
      (opcoes) => {
        // Se não houver opções selecionadas, retornar false
        const temOpcaoSelecionada = Object.values(opcoes).length > 0
        return temOpcaoSelecionada
      },
      {
        message: "Selecione pelo menos uma opção de treinamento",
        path: ["opcoesTreinamento"], // Caminho para o erro
      },
    ),
  dataHora: z
    .date({
      required_error: "Selecione uma data e horário para o treinamento",
      invalid_type_error: "Data e horário inválidos",
    })
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function FormularioTreinamento() {
  const { t } = useLanguage()
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [formularioEnviado, setFormularioEnviado] = useState(false)

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participantes: [{ nome: "" }],
      empresa: "",
      telefones: [{ numero: "" }],
      emails: [{ email: "" }],
      tipoTreinamento: "completo",
      autorizaGravacao: "nao",
      aceitouTermos: false,
      opcoesTreinamento: {},
    },
    mode: "onBlur", // Alterado para onBlur conforme solicitado
  })

  const tipoTreinamento = methods.watch("tipoTreinamento")
  const dataHora = methods.watch("dataHora")
  const selectedDate = methods.watch("dataHora")
  const opcoesTreinamento = methods.watch("opcoesTreinamento")

  // Corrigido: 3 etapas para treinamento personalizado (dados, grupo1, grupo2, agendamento)
  const totalEtapas = tipoTreinamento === "completo" ? 2 : 4

  const avancarEtapa = async () => {
    const camposEtapaAtual = await validarEtapaAtual()
    if (!camposEtapaAtual) return

    if (etapaAtual < totalEtapas - 1) {
      // Limpar a data e hora ao avançar para a próxima etapa
      if (
        (tipoTreinamento === "completo" && etapaAtual === 0) ||
        (tipoTreinamento === "personalizado" && etapaAtual === 2)
      ) {
        methods.setValue("dataHora", undefined)
      }

      setEtapaAtual(etapaAtual + 1)
    } else {
      await finalizarFormulario()
    }
  }

  const voltarEtapa = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1)
    }
  }

  // Verificar se todas as opções estão como "Não preciso"
  const todasOpcoesNaoPreciso = () => {
    if (!opcoesTreinamento || Object.keys(opcoesTreinamento).length === 0) {
      return false
    }

    // Verificar quais opções pertencem ao grupo atual
    const grupo = etapaAtual === 1 ? 1 : 2

    // Definir quais opções pertencem a cada grupo
    const opcoesGrupo1 = [
      "cadastroProdutos",
      "cadastroPrecos",
      "cadastroFotos",
      "atualizacaoDados",
      "enviarAtualizacao",
    ]
    const opcoesGrupo2 = ["cadastroFigura", "administracaoUsuarios", "administracaoClientes", "configuracoesCatalogo"]

    const opcoesGrupo = grupo === 1 ? opcoesGrupo1 : opcoesGrupo2

    // Verificar se todas as opções do grupo atual estão como "naoPreciso"
    let todasNaoPreciso = true
    let temAlgumaOpcao = false

    for (const opcao of opcoesGrupo) {
      if (opcoesTreinamento[opcao]) {
        temAlgumaOpcao = true
        if (opcoesTreinamento[opcao] !== "naoPreciso") {
          todasNaoPreciso = false
          break
        }
      }
    }

    // Se não tiver nenhuma opção selecionada, não considerar como "todas não preciso"
    return temAlgumaOpcao && todasNaoPreciso
  }

  // Modificar a função validarEtapaAtual para garantir validação correta
  const validarEtapaAtual = async () => {
    let camposParaValidar: string[] = []

    if (etapaAtual === 0) {
      camposParaValidar = [
        "participantes",
        "empresa",
        "telefones",
        "emails",
        "tipoTreinamento",
        "autorizaGravacao",
        "aceitouTermos",
      ]

      // Validar todos os campos de uma vez
      const resultado = await methods.trigger(camposParaValidar as any)

      if (!resultado) {
        // Verificar quais campos estão com erro e mostrar mensagens específicas
        const erros = methods.formState.errors
        const mensagensErro = []

        if (erros.participantes) {
          mensagensErro.push("Adicione pelo menos um participante")
        }

        if (erros.empresa) {
          mensagensErro.push("Nome da empresa é obrigatório")
        }

        if (erros.telefones && erros.telefones[0]?.numero) {
          mensagensErro.push("Número de telefone inválido. Confirme se o número tem DDD e está completo.")
        }

        if (erros.emails && erros.emails[0]?.email) {
          mensagensErro.push("Endereço de e-mail inválido. Preencha corretamente para continuar.")
        }

        if (erros.aceitouTermos) {
          mensagensErro.push("Você precisa aceitar os termos de privacidade para continuar.")
        }

        // Mostrar toast com todos os erros
        if (mensagensErro.length > 0) {
          toast({
            title: t("personal.error_title"),
            description: mensagensErro.join("\n"),
            variant: "destructive",
          })
        }

        return false
      }

      return true
    } else if (tipoTreinamento === "personalizado") {
      if (etapaAtual === 1 || etapaAtual === 2) {
        // Validar opções do grupo 1 ou 2
        camposParaValidar = ["opcoesTreinamento"]

        // Verificar se há pelo menos uma opção selecionada no grupo atual
        const valores = methods.getValues("opcoesTreinamento")
        const grupo = etapaAtual === 1 ? 1 : 2

        // Definir quais opções pertencem a cada grupo
        const opcoesGrupo1 = [
          "cadastroProdutos",
          "cadastroPrecos",
          "cadastroFotos",
          "atualizacaoDados",
          "enviarAtualizacao",
        ]
        const opcoesGrupo2 = [
          "cadastroFigura",
          "administracaoUsuarios",
          "administracaoClientes",
          "configuracoesCatalogo",
        ]

        // Verificar se há pelo menos uma opção selecionada no grupo atual
        const opcoesGrupo = grupo === 1 ? opcoesGrupo1 : opcoesGrupo2
        let temOpcaoSelecionada = false

        for (const opcao of opcoesGrupo) {
          if (valores[opcao]) {
            temOpcaoSelecionada = true
            break
          }
        }

        if (!temOpcaoSelecionada) {
          toast({
            title: t("options.error_title"),
            description: t("options.error_message"),
            variant: "destructive",
          })
          return false
        }

        // Verificar se todas as opções estão como "Não preciso"
        if (todasOpcoesNaoPreciso()) {
          toast({
            title: t("options.error_title"),
            description: t("options.all_dont_need"),
            variant: "destructive",
          })
          return false
        }
      }
    }

    const resultado = await methods.trigger(camposParaValidar as any)
    return resultado
  }

  const finalizarFormulario = async () => {
    try {
      setEnviando(true)
      console.log("Iniciando finalização do formulário...")

      // Verificar se a data e hora foram selecionadas
      const dataHora = methods.getValues("dataHora")
      console.log("Data e hora selecionadas:", dataHora)

      // Obter os dados do formulário
      const dados = methods.getValues()
      console.log("Dados do formulário:", dados)

      // Enviar os dados para o servidor
      console.log("Enviando formulário para o servidor...")
      const resultado = await enviarFormulario(dados)
      console.log("Resposta do servidor:", resultado)

      if (resultado.sucesso) {
        console.log("Formulário enviado com sucesso, exibindo tela de sucesso")
        // Mostrar tela de sucesso
        setFormularioEnviado(true)
        methods.reset()
      } else {
        console.log("Erro ao enviar formulário:", resultado.mensagem)
        toast({
          title: "Erro ao enviar",
          description: resultado.mensagem || "Ocorreu um erro ao enviar o formulário. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const reiniciarFormulario = () => {
    setFormularioEnviado(false)
    setEtapaAtual(0)
  }

  // Se o formulário foi enviado com sucesso, mostrar a tela de sucesso
  if (formularioEnviado) {
    return <FormularioSucesso onReiniciar={reiniciarFormulario} />
  }

  const renderizarEtapa = () => {
    if (etapaAtual === 0) {
      return <DadosPessoais />
    } else if (tipoTreinamento === "personalizado") {
      if (etapaAtual === 1) {
        return <OpcoesTreinamento grupo={1} />
      } else if (etapaAtual === 2) {
        return <OpcoesTreinamento grupo={2} />
      } else if (etapaAtual === 3) {
        return <Agendamento />
      }
    } else if (tipoTreinamento === "completo" && etapaAtual === 1) {
      return <Agendamento />
    }
  }

  const nomeBotaoAvancar = () => {
    if (
      etapaAtual === totalEtapas - 1 ||
      (tipoTreinamento === "completo" && etapaAtual === 1) ||
      (tipoTreinamento === "personalizado" && etapaAtual === 3)
    ) {
      return t("form.finish")
    }
    return t("form.next")
  }

  // Verificar se deve mostrar o botão de concluir
  const mostrarBotaoConcluir = () => {
    const estaNoAgendamento =
      (tipoTreinamento === "completo" && etapaAtual === 1) || (tipoTreinamento === "personalizado" && etapaAtual === 3)

    // Se não estiver na etapa de agendamento, sempre mostrar o botão
    if (!estaNoAgendamento) {
      return true
    }

    // Se estiver na etapa de agendamento, mostrar apenas se tiver data e hora selecionadas
    return !!selectedDate
  }

  return (
    <FormProvider {...methods}>
      <Card className="w-full border border-gray-200 dark:border-zinc-600 shadow-lg rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-amber-500 text-white py-4 px-6">
            <h2 className="text-xl font-semibold">{t("form.title")}</h2>
            <div className="flex justify-between mt-4 mb-2">
              {Array.from({ length: totalEtapas }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 mx-1 rounded-full ${index <= etapaAtual ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>
            <p className="text-sm">
              {t("form.step")} {etapaAtual + 1} {t("form.of")} {totalEtapas}
            </p>
          </div>

          <div className="p-6">
            <form>
              {renderizarEtapa()}

              <div className="flex justify-between mt-8">
                {etapaAtual > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={voltarEtapa}
                    disabled={enviando}
                    className="border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-700"
                  >
                    {t("form.back")}
                  </Button>
                )}
                {mostrarBotaoConcluir() && (
                  <Button
                    type="button"
                    className={`bg-amber-500 hover:bg-amber-600 text-white ${etapaAtual === 0 ? "ml-auto" : ""}`}
                    onClick={avancarEtapa}
                    disabled={enviando}
                  >
                    {enviando ? t("form.processing") : nomeBotaoAvancar()}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  )
}
