"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

type Language = {
  code: "pt" | "es" | "en"
  name: string
  flag: string
}

const languages: Language[] = [
  {
    code: "pt",
    name: "Português",
    flag: "/images/flags/brasil.png",
  },
  {
    code: "es",
    name: "Español",
    flag: "/images/flags/espanha.png",
  },
  {
    code: "en",
    name: "English",
    flag: "/images/flags/reino-unido.png",
  },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage.code)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3 flex items-center gap-2">
          <div className="relative w-5 h-3.5 overflow-hidden">
            <Image
              src={currentLanguage.flag || "/placeholder.svg"}
              alt={currentLanguage.name}
              fill
              className="object-cover"
              sizes="20px"
            />
          </div>
          <span className="text-sm">{currentLanguage.name}</span>
          <Globe className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className="cursor-pointer flex items-center gap-2 px-3 py-2"
          >
            <div className="relative w-5 h-3.5 overflow-hidden">
              <Image src={lang.flag || "/placeholder.svg"} alt={lang.name} fill className="object-cover" sizes="20px" />
            </div>
            <span className="text-sm">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
