import { FormularioTreinamento } from "@/components/formulario-treinamento"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <FormularioTreinamento />
        </div>
      </div>
    </main>
  )
}
