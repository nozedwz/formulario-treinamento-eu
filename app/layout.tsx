import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/language-selector"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Formulário de Treinamento | Ideia2001",
  description: "Formulário para agendamento de treinamentos da Ideia2001",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <header className="flex justify-between items-center p-4 border-b">
              <Link href="/" className="flex items-center">
                <div className="relative h-12 w-48">
                  <Image
                    src="/images/logo-ideia2001.png"
                    alt="Ideia2001"
                    fill
                    className="object-contain dark:hidden"
                    priority
                  />
                  <Image
                    src="/images/logo-ideia2001-dark.png"
                    alt="Ideia2001"
                    fill
                    className="object-contain hidden dark:block"
                    priority
                  />
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <LanguageSelector />
                <ModeToggle />
              </div>
            </header>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
