import Link from "next/link"
import { Facebook, Instagram, Linkedin, Phone, MapPin } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <>
      <div className="w-full bg-zinc-800 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span>Fone: 55 11 2917-5277</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>Rua Amazonas, 363 - 09520-070 - São Caetano do Sul / SP - Brasil</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
            <select className="bg-zinc-700 text-white text-xs rounded px-2 py-1">
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </div>
      <header className="w-full bg-white dark:bg-zinc-900 border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="flex items-center">
              <div className="mr-2">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" stroke="#F59E0B" strokeWidth="4" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-semibold text-zinc-700 dark:text-white">ideia</span>
                <span className="text-2xl font-semibold text-amber-500">2001</span>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">catálogos inteligentes</div>
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="#"
              className="text-zinc-700 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 font-medium"
            >
              HOME
            </Link>
            <Link
              href="#"
              className="text-zinc-700 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 font-medium"
            >
              EMPRESA
            </Link>
            <Link
              href="#"
              className="text-zinc-700 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 font-medium"
            >
              PRODUTOS
            </Link>
            <Link
              href="#"
              className="text-zinc-700 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 font-medium"
            >
              DOWNLOADS
            </Link>
            <Link
              href="#"
              className="text-zinc-700 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 font-medium"
            >
              CLIENTES
            </Link>
            <Link
              href="#"
              className="text-zinc-700 dark:text-white hover:text-amber-500 dark:hover:text-amber-500 font-medium"
            >
              CONTATO
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="#"
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium hidden md:block"
            >
              TENHO INTERESSE
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
