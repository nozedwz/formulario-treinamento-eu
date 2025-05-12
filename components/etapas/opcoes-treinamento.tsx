"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormItem, FormLabel, FormControl, FormField } from "@/components/ui/form"
import { Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { opcoesRecursos } from "@/data/opcoes-recursos"
import { useLanguage } from "@/contexts/language-context"

interface OpcoesTreinamentoProps {
  grupo: 1 | 2
}

export function OpcoesTreinamento({ grupo }: OpcoesTreinamentoProps) {
  const { control, setValue, getValues } = useFormContext()
  const { t, language } = useLanguage()
  const [infoAberto, setInfoAberto] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Definir as opções para cada grupo
  const opcoesGrupo1 = ["cadastroProdutos", "cadastroPrecos", "cadastroFotos", "atualizacaoDados", "enviarAtualizacao"]

  const opcoesGrupo2 = ["cadastroFigura", "administracaoUsuarios", "administracaoClientes", "configuracoesCatalogo"]

  const opcoesAtuais = grupo === 1 ? opcoesGrupo1 : opcoesGrupo2

  // Pré-selecionar "Explicação Completa" para todas as opções ao montar o componente
  useEffect(() => {
    console.log("Inicializando opções de treinamento para o grupo:", grupo)
    console.log("Estado de inicialização:", initialized)

    // Verificar se já foi inicializado para evitar redefinir valores
    if (!initialized) {
      // Definir valor padrão para cada opção
      opcoesAtuais.forEach((opcao) => {
        const valorAtual = getValues(`opcoesTreinamento.${opcao}`)
        console.log(`Opção ${opcao}, valor atual: ${valorAtual}`)

        // Só definir se não tiver valor
        if (!valorAtual) {
          // Verificar se a opção aceita "explicacaoCompleta"
          if (opcao === "cadastroPrecos" || opcao === "enviarAtualizacao" || opcao === "configuracoesCatalogo") {
            setValue(`opcoesTreinamento.${opcao}`, "explicacaoCompleta", { shouldDirty: true })
          } else {
            setValue(`opcoesTreinamento.${opcao}`, "explicacaoCompleta", { shouldDirty: true })
          }
          console.log(`Definindo opção ${opcao} como "explicacaoCompleta"`)
        }
      })

      setInitialized(true)
    }
  }, [grupo, setValue, getValues, opcoesAtuais, initialized])

  // Função para obter o texto traduzido das informações
  const getTextoTraduzido = (id: string, campo: "titulo" | "descricao") => {
    // Verificar se existe uma tradução para o idioma atual
    if (opcoesRecursos[id]?.[`${campo}_${language}`]) {
      return opcoesRecursos[id][`${campo}_${language}`]
    }

    // Se não existir, retornar o texto padrão em português
    return opcoesRecursos[id]?.[campo] || (campo === "titulo" ? id : "Informação não disponível.")
  }

  const opcoesGrupo1UI = [
    {
      id: "cadastroProdutos",
      label: t("options.product_admin"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "breveExplicacao", label: t("options.brief") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "cadastroPrecos",
      label: t("options.price_admin"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "cadastroFotos",
      label: t("options.photo_admin"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "breveExplicacao", label: t("options.brief") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "atualizacaoDados",
      label: t("options.data_update"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "breveExplicacao", label: t("options.brief") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "enviarAtualizacao",
      label: t("options.send_update"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
  ]

  const opcoesGrupo2UI = [
    {
      id: "cadastroFigura",
      label: t("options.figure_admin"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "breveExplicacao", label: t("options.brief") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "administracaoUsuarios",
      label: t("options.user_admin"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "breveExplicacao", label: t("options.brief") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "administracaoClientes",
      label: t("options.client_admin"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "breveExplicacao", label: t("options.brief") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
    {
      id: "configuracoesCatalogo",
      label: t("options.catalog_config"),
      opcoes: [
        { value: "naoPreciso", label: t("options.dont_need") },
        { value: "explicacaoCompleta", label: t("options.complete") },
      ],
    },
  ]

  const opcoesAtuaisUI = grupo === 1 ? opcoesGrupo1UI : opcoesGrupo2UI

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">{t("options.title")}</h2>

      <div className="space-y-6">
        {opcoesAtuaisUI.map((opcao) => (
          <div key={opcao.id} className="space-y-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg relative">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-zinc-800 dark:text-white">{opcao.label}</h3>

              <Popover open={infoAberto === opcao.id} onOpenChange={(open) => setInfoAberto(open ? opcao.id : null)}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-amber-500 hover:text-amber-600 focus:outline-none"
                    aria-label={`Informações sobre ${opcao.label}`}
                    onClick={(e) => {
                      e.preventDefault()
                      setInfoAberto(infoAberto === opcao.id ? null : opcao.id)
                    }}
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-4 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-lg"
                  side="left"
                  align="start"
                >
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-500">{getTextoTraduzido(opcao.id, "titulo")}</h4>
                    <p className="text-sm">{getTextoTraduzido(opcao.id, "descricao")}</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <FormField
              control={control}
              name={`opcoesTreinamento.${opcao.id}` as any}
              defaultValue="explicacaoCompleta"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue="explicacaoCompleta"
                      value={field.value || "explicacaoCompleta"}
                      className="flex flex-col space-y-1"
                    >
                      {opcao.opcoes.map((item) => (
                        <FormItem key={item.value} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={item.value} className="text-amber-500 border-amber-500" />
                          </FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
