"use client"
import { useFormContext, useFieldArray } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react"
import { useTranslation } from "react-i18next"

interface DadosPessoaisForm {
  participantes: { nome: string }[]
  telefones: { numero: string }[]
  emails: { email: string }[]
}

const DadosPessoais = () => {
  const { t } = useTranslation()
  const { register, control } = useFormContext<DadosPessoaisForm>()

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t("personal.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("personal.subtitle")}</p>
      </div>

      <div>
        <Label htmlFor="participantes">{t("personal.participants")}</Label>
        {participantesFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-2">
            <Input
              type="text"
              id={`participantes[${index}].nome`}
              {...register(`participantes.${index}.nome`)}
              placeholder={t("personal.participant_name")}
              className="flex-1"
            />
            <Button type="button" variant="destructive" size="sm" onClick={() => removeParticipante(index)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-[#404040] dark:bg-[#404040]"
          onClick={() => appendParticipante({ nome: "" })}
        >
          <Plus className="h-4 w-4 mr-2" /> {t("personal.add_participant")}
        </Button>
      </div>

      <div>
        <Label htmlFor="telefones">{t("personal.phones")}</Label>
        {telefonesFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-2">
            <Input
              type="tel"
              id={`telefones[${index}].numero`}
              {...register(`telefones.${index}.numero`)}
              placeholder={t("personal.phone_number")}
              className="flex-1"
            />
            <Button type="button" variant="destructive" size="sm" onClick={() => removeTelefone(index)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-[#404040] dark:bg-[#404040]"
          onClick={() => appendTelefone({ numero: "" })}
        >
          <Plus className="h-4 w-4 mr-2" /> {t("personal.add_phone")}
        </Button>
      </div>

      <div>
        <Label htmlFor="emails">{t("personal.emails")}</Label>
        {emailsFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-2">
            <Input
              type="email"
              id={`emails[${index}].email`}
              {...register(`emails.${index}.email`)}
              placeholder={t("personal.email_address")}
              className="flex-1"
            />
            <Button type="button" variant="destructive" size="sm" onClick={() => removeEmail(index)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 text-amber-500 border-amber-500 hover:bg-amber-50 dark:hover:bg-[#404040] dark:bg-[#404040]"
          onClick={() => appendEmail({ email: "" })}
        >
          <Plus className="h-4 w-4 mr-2" /> {t("personal.add_email")}
        </Button>
      </div>
    </div>
  )
}

export default DadosPessoais
