"use client"

import { useState, useEffect } from "react"
import { format, addDays, isMonday, isWednesday, isFriday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { obterDatasBloqueadasAction, bloquearDataAction, desbloquearDataAction } from "@/actions/datas-disponiveis"
import { toast } from "@/hooks/use-toast"

// Interface para datas bloqueadas
interface DataBloqueada {
  data: string
  motivo?: string
}

export default function GerenciarDatasPage() {
  const [datasBloqueadas, setDatasBloqueadas] = useState<DataBloqueada[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [motivo, setMotivo] = useState<string>("")
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [datasBloqueadasMap, setDatasBloqueadasMap] = useState<Map<string, string>>(new Map())

  // Data limite (hoje + 60 dias)
  const dataLimite = addDays(new Date(), 60)

  // Carregar datas bloqueadas
  useEffect(() => {
    async function carregarDatasBloqueadas() {
      try {
        setCarregando(true)
        setErro(null)
        const datas = await obterDatasBloqueadasAction()
        setDatasBloqueadas(datas)

        // Criar um mapa para acesso mais rápido
        const mapaData = new Map<string, string>()
        datas.forEach((data) => {
          mapaData.set(data.data, data.motivo || "")
        })
        setDatasBloqueadasMap(mapaData)
      } catch (error) {
        console.error("Erro ao carregar datas bloqueadas:", error)
        setErro("Não foi possível carregar as datas bloqueadas. Por favor, tente novamente mais tarde.")
      } finally {
        setCarregando(false)
      }
    }

    carregarDatasBloqueadas()
  }, [])

  // Verificar se uma data está bloqueada
  const isDateBlocked = (date: Date) => {
    const dataFormatada = format(date, "yyyy-MM-dd")
    return datasBloqueadasMap.has(dataFormatada)
  }

  // Manipular seleção de data
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)

    if (date) {
      const dataFormatada = format(date, "yyyy-MM-dd")
      const motivoBloqueio = datasBloqueadasMap.get(dataFormatada)
      setMotivo(motivoBloqueio || "")
    } else {
      setMotivo("")
    }
  }

  // Bloquear ou desbloquear data
  const toggleBloqueioData = async () => {
    if (!selectedDate) return

    try {
      setSalvando(true)
      setErro(null)
      const dataFormatada = format(selectedDate, "yyyy-MM-dd")

      if (isDateBlocked(selectedDate)) {
        // Desbloquear data
        const sucesso = await desbloquearDataAction(dataFormatada)

        if (sucesso) {
          toast({
            title: "Sucesso",
            description: "Data desbloqueada com sucesso",
            variant: "default",
          })

          // Atualizar estado local
          const novoMapa = new Map(datasBloqueadasMap)
          novoMapa.delete(dataFormatada)
          setDatasBloqueadasMap(novoMapa)

          const novasDatasBloqueadas = datasBloqueadas.filter((d) => d.data !== dataFormatada)
          setDatasBloqueadas(novasDatasBloqueadas)

          setMotivo("")
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível desbloquear a data",
            variant: "destructive",
          })
        }
      } else {
        // Bloquear data
        if (!motivo) {
          toast({
            title: "Aviso",
            description: "Informe um motivo para bloquear a data",
            variant: "default",
          })
          return
        }

        const sucesso = await bloquearDataAction(dataFormatada, motivo)

        if (sucesso) {
          toast({
            title: "Sucesso",
            description: "Data bloqueada com sucesso",
            variant: "default",
          })

          // Atualizar estado local
          const novoMapa = new Map(datasBloqueadasMap)
          novoMapa.set(dataFormatada, motivo)
          setDatasBloqueadasMap(novoMapa)

          const novasDatasBloqueadas = [...datasBloqueadas, { data: dataFormatada, motivo }]
          setDatasBloqueadas(novasDatasBloqueadas)
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível bloquear a data",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao alterar bloqueio de data:", error)
      setErro("Ocorreu um erro ao processar a solicitação. Por favor, tente novamente mais tarde.")
    } finally {
      setSalvando(false)
    }
  }

  // Verificar se a data é válida para bloqueio (segunda, quarta ou sexta)
  const isValidDate = (date: Date) => {
    return isMonday(date) || isWednesday(date) || isFriday(date)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Datas Bloqueadas</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Use esta página para bloquear datas que não estarão disponíveis para agendamento de treinamentos. Por padrão,
        todas as segundas, quartas e sextas-feiras estão disponíveis nos horários 10h e 14h.
      </p>

      {erro && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
          {erro}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selecione uma data</CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                locale={ptBR}
                modifiers={{
                  blocked: (date) => isDateBlocked(date),
                }}
                modifiersClassNames={{
                  blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                }}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)

                  // Desabilita datas passadas e além do limite
                  const passada = date < today
                  const excedeLimite = date > dataLimite

                  // Desabilita dias que não são segunda, quarta ou sexta
                  const naoEhDiaValido = !isValidDate(date)

                  return passada || excedeLimite || naoEhDiaValido
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? isDateBlocked(selectedDate)
                  ? `Desbloquear data: ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                  : `Bloquear data: ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
                : "Selecione uma data primeiro"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {!isDateBlocked(selectedDate) && (
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo do bloqueio</Label>
                    <Input
                      id="motivo"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ex: Feriado, Manutenção, etc."
                      className="border-gray-300 dark:border-black dark:bg-zinc-700 input-field"
                    />
                  </div>
                )}

                <Button
                  onClick={toggleBloqueioData}
                  disabled={salvando || (!isDateBlocked(selectedDate) && !motivo)}
                  className={`w-full ${
                    isDateBlocked(selectedDate) ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {salvando ? "Processando..." : isDateBlocked(selectedDate) ? "Desbloquear data" : "Bloquear data"}
                </Button>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Selecione uma data para gerenciar sua disponibilidade
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Datas bloqueadas</CardTitle>
        </CardHeader>
        <CardContent>
          {datasBloqueadas.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Não há datas bloqueadas no momento</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {datasBloqueadas.map((data) => (
                <div
                  key={data.data}
                  className="p-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20"
                >
                  <p className="font-medium">
                    {format(new Date(data.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.motivo || "Sem motivo"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
