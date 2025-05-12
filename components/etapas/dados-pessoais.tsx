"use client"

import type React from "react"

import { useState } from "react"
import { useFormContext, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, ExternalLink } from "lucide-react"
import { TermosPrivacidade } from "@/components/termos-privacidade"
import { useLanguage } from "@/contexts/language-context"

export function DadosPessoais() {
  const { t, language } = useLanguage()
  const {
    control,
    register,
    formState: { errors, touchedFields },
  } = useFormContext()

  const [termosAbertos, setTermosAbertos] = useState(false)

  const {
    fields: participantesFields,
    append: appendParticipante,
    remove: removeParticipante,
  } = useFieldArray({
    control,
    name: "participantes",
  })

  const {
    fields: telefonesFields,
    append: appendTelefone,
    remove: removeTelefone,
  } = useFieldArray({
    control,
    name: "telefones",
  })

  const {
    fields: emailsFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: "emails",
  })

  // Função para permitir apenas números e limitar o comprimento
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remover qualquer caractere que não seja número
    e.target.value = e.target.value.replace(/[^\d]/g, "")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">{t("personal.title")}</h2>

        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">{t("personal.participants")}</Label>
            {participantesFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mt-2">
                <Input
                  {...register(`participantes.${index}.nome` as const)}
                  placeholder={t("personal.participant_name")}
                  className="flex-1 border-gray-300 dark:border-black dark:bg-zinc-700 focus:ring-amber-500 focus:border-amber-500 input-field"
                />
                {participantesFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParticipante(index)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.participantes && (
              <p className="text-sm text-red-500 mt-1">
                {Array.isArray(errors.participantes)
                  ? t("personal.add_at_least_one")
                  : (errors.participantes as any).message}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-800"
              onClick={() => appendParticipante({ nome: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> {t("personal.add_participant")}
            </Button>
          </div>

          <div>
            <Label htmlFor="empresa" className="text-base font-medium">
              {t("personal.company")}
            </Label>
            <Input
              id="empresa"
              {...register("empresa")}
              placeholder={t("personal.company_placeholder")}
              className="mt-2 border-gray-300 dark:border-black dark:bg-zinc-700 focus:ring-amber-500 focus:border-amber-500 input-field"
            />
            {errors.empresa && <p className="text-sm text-red-500 mt-1">{(errors.empresa as any).message}</p>}
          </div>

          <div>
            <Label className="text-base font-medium">{t("personal.phone")}</Label>
            {telefonesFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mt-2">
                <Input
                  {...register(`telefones.${index}.numero` as const, {
                    validate: {
                      length: (value) => {
                        const numericValue = value.replace(/[^\d]/g, "")
                        return (
                          (numericValue.length >= 8 && numericValue.length <= 14) ||
                          "Número de telefone inválido. Confirme se o número tem DDD e está completo."
                        )
                      },
                    },
                  })}
                  placeholder={t("personal.phone_placeholder")}
                  className="flex-1 border-gray-300 dark:border-black dark:bg-zinc-700 focus:ring-amber-500 focus:border-amber-500 input-field"
                  onInput={handlePhoneInput}
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTelefone(index)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.telefones && errors.telefones[0]?.numero && (
              <p className="text-sm text-red-500 mt-1">{errors.telefones[0].numero.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-800"
              onClick={() => appendTelefone({ numero: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> {t("personal.add_phone")}
            </Button>
          </div>

          <div>
            <Label className="text-base font-medium">{t("personal.email")}</Label>
            {emailsFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mt-2">
                <Input
                  {...register(`emails.${index}.email` as const, {
                    validate: {
                      email: (value) => {
                        // Regex para validação básica de e-mail
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        return (
                          emailRegex.test(value) || "Endereço de e-mail inválido. Preencha corretamente para continuar."
                        )
                      },
                    },
                  })}
                  placeholder={t("personal.email_placeholder")}
                  type="email"
                  className="flex-1 border-gray-300 dark:border-black dark:bg-zinc-700 focus:ring-amber-500 focus:border-amber-500 input-field"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmail(index)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.emails && errors.emails[0]?.email && (
              <p className="text-sm text-red-500 mt-1">{errors.emails[0].email.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-800"
              onClick={() => appendEmail({ email: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> {t("personal.add_email")}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-medium text-zinc-800 dark:text-white">{t("personal.training_type")}</h3>
        <FormField
          control={control}
          name="tipoTreinamento"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="completo" className="text-amber-500 border-amber-500" />
                    </FormControl>
                    <FormLabel className="font-normal">{t("personal.complete_training")}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="personalizado" className="text-amber-500 border-amber-500" />
                    </FormControl>
                    <FormLabel className="font-normal">{t("personal.custom_training")}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-medium text-zinc-800 dark:text-white">{t("personal.recording")}</h3>
        <FormField
          control={control}
          name="autorizaGravacao"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sim" className="text-amber-500 border-amber-500" />
                    </FormControl>
                    <FormLabel className="font-normal">{t("personal.yes_authorize")}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="nao" className="text-amber-500 border-amber-500" />
                    </FormControl>
                    <FormLabel className="font-normal">{t("personal.no_authorize")}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
        <FormField
          control={control}
          name="aceitouTermos"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm">
                  {t("personal.terms")}{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-amber-500 font-medium"
                    onClick={() => setTermosAbertos(true)}
                  >
                    {t("personal.privacy_terms")}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  .
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      <Dialog open={termosAbertos} onOpenChange={setTermosAbertos}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#404040]">
          <DialogHeader>
            <DialogTitle>{t("personal.privacy_terms")}</DialogTitle>
          </DialogHeader>
          <TermosPrivacidade language={language} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
