"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { format, addDays, isMonday, isWednesday, isFriday } from "date-fns"
import { ptBR, es, enUS } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { obterDatasDisponiveis } from "@/actions/datas-disponiveis"
import { useLanguage } from "@/contexts/language-context"

// Interface para datas disponíveis
interface DataDisponivel {
  data: string
  horarios: string[]
}

// Modificar o componente Agendamento para destacar a obrigatoriedade da data
export function Agendamento() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()
  const { t, language } = useLanguage()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [datasDisponiveis, setDatasDisponiveis] = useState<DataDisponivel[]>([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [datasDisponiveisMap, setDatasDisponiveisMap] = useState<Map<string, string[]>>(new Map())

  // Selecionar o locale correto com base no idioma
  const getLocale = () => {
    switch (language) {
      case "es":
        return es
      case "en":
        return enUS
      default:
        return ptBR
    }
  }

  // Data limite (hoje + 30 dias)
  const dataLimite = addDays(new Date(), 30)

  // Carregar datas disponíveis
  useEffect(() => {
    let isMounted = true

    async function carregarDatas() {
      try {
        setCarregando(true)
        setErro(null)

        console.log("Carregando datas disponíveis...")
        const datas = await obterDatasDisponiveis()
        console.log("Datas disponíveis recebidas:", datas)

        if (isMounted) {
          setDatasDisponiveis(datas)

          // Criar um mapa para acesso mais rápido
          const mapaData = new Map<string, string[]>()
          datas.forEach((data) => {
            mapaData.set(data.data, data.horarios)
          })
          setDatasDisponiveisMap(mapaData)
          console.log(
            "Mapa de datas disponíveis criado:",
            Array.from(mapaData.entries())
              .map(([data, horarios]) => `${data}: ${horarios.join(", ")}`)
              .join("; "),
          )
          setCarregando(false)
        }
      } catch (error) {
        console.error("Erro ao carregar datas disponíveis:", error)
        if (isMounted) {
          setErro(t("schedule.error_loading"))
          setCarregando(false)
        }
      }
    }

    carregarDatas()

    return () => {
      isMounted = false
    }
  }, [t])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime("")

    if (date) {
      // Formatar a data para o formato ISO (YYYY-MM-DD)
      const dataFormatada = format(date, "yyyy-MM-dd")
      console.log(`Data selecionada: ${dataFormatada}`)

      // Obter horários disponíveis do mapa
      const horarios = datasDisponiveisMap.get(dataFormatada) || []
      console.log(`Horários disponíveis para ${dataFormatada}: ${horarios.join(", ")}`)
      setHorariosDisponiveis(horarios)
    } else {
      // Se a data for desmarcada, limpar o valor no formulário
      setValue("dataHora", undefined)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)

    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const dateTime = new Date(selectedDate)
      dateTime.setHours(hours, minutes)
      setValue("dataHora", dateTime, { shouldValidate: true })
      console.log(`Data e hora selecionadas: ${dateTime.toISOString()}`)
    } else {
      // Se o horário for desmarcado, limpar o valor no formulário
      setValue("dataHora", undefined)
    }
  }

  // Verificar se uma data está disponível
  const isDateAvailable = (date: Date) => {
    // Se não temos dados ainda, permitir datas que são segunda, quarta ou sexta
    if (datasDisponiveisMap.size === 0) {
      return isMonday(date) || isWednesday(date) || isFriday(date)
    }

    const dataFormatada = format(date, "yyyy-MM-dd")
    const disponivel = datasDisponiveisMap.has(dataFormatada)
    console.log(`Verificando disponibilidade da data ${dataFormatada}: ${disponivel ? "Disponível" : "Indisponível"}`)
    return disponivel
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">{t("schedule.title")}</h2>
      <p className="text-zinc-600 dark:text-zinc-400">{t("schedule.description")}</p>

      {erro && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("schedule.date")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300 dark:border-black dark:bg-zinc-700",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: getLocale() }) : t("schedule.select_date")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={getLocale()}
                  disabled={(date) => {
                    // Desabilita datas passadas, finais de semana e dias não permitidos (terça e quinta)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    // Verificar se a data está além do limite de 30 dias
                    const excedeLimite = date > dataLimite

                    // Verificar se é um dia não permitido (2=terça, 4=quinta, 0=domingo, 6=sábado)
                    const diaDaSemana = date.getDay()
                    const diaProibido = diaDaSemana === 2 || diaDaSemana === 4 || diaDaSemana === 0 || diaDaSemana === 6

                    // Verificar se a data está disponível
                    const naoDisponivel = !isDateAvailable(date)

                    return date < today || diaProibido || excedeLimite || naoDisponivel
                  }}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("schedule.time")}</label>
            <Select
              value={selectedTime}
              onValueChange={handleTimeSelect}
              disabled={!selectedDate || horariosDisponiveis.length === 0}
            >
              <SelectTrigger className="w-full border-gray-300 dark:border-black dark:bg-zinc-700 input-field">
                <SelectValue placeholder={t("schedule.select_time")} />
              </SelectTrigger>
              <SelectContent>
                {horariosDisponiveis.map((horario) => (
                  <SelectItem key={horario} value={horario}>
                    {horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {!selectedDate && !carregando && (
        <div className="mt-2 text-amber-600 dark:text-amber-400 text-sm font-medium">{t("schedule.error_message")}</div>
      )}

      {selectedDate && selectedTime && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <h3 className="font-medium text-amber-800 dark:text-amber-300">{t("schedule.confirmation")}</h3>
          <p className="mt-2 text-amber-700 dark:text-amber-400">
            {t("schedule.confirmation_text")}{" "}
            <span className="font-medium">{format(selectedDate, "PPP", { locale: getLocale() })}</span>{" "}
            {t("schedule.at")} <span className="font-medium">{selectedTime}</span>.
          </p>
        </div>
      )}
    </div>
  )
}
