"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface FormularioSucessoProps {
  onReiniciar: () => void
}

export function FormularioSucesso({ onReiniciar }: FormularioSucessoProps) {
  const { t } = useLanguage()

  return (
    <Card className="w-full border border-gray-200 dark:border-zinc-600 shadow-lg rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-amber-500 text-white py-4 px-6">
          <h2 className="text-xl font-semibold">{t("success.title")}</h2>
        </div>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h3 className="text-xl font-semibold mb-4">{t("success.heading")}</h3>

          <div className="space-y-4 text-zinc-700 dark:text-zinc-300 max-w-md mx-auto">
            <p>{t("success.message1")}</p>
            <p>{t("success.message2")}</p>
          </div>

          <Button onClick={onReiniciar} className="mt-8 bg-amber-500 hover:bg-amber-600 text-white">
            {t("success.back")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
