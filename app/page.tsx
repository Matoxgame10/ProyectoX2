import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileCheck, History, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Sistema de Validación de Certificados</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Plataforma segura para la emisión y validación de certificados y títulos utilizando la tecnología blockchain
          de Algorand.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
       

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Secretaría</CardTitle>
            <FileCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="min-h-[80px]">
              Genera y emite títulos oficiales con respaldo en blockchain para garantizar su autenticidad.
            </CardDescription>
            <Link href="/secretary">
              <Button className="w-full mt-4">
                Acceder <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Grupos</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="min-h-[80px]">
              Emite certificados para participantes de cursos, eventos y programas educativos.
            </CardDescription>
            <Link href="/groups">
              <Button className="w-full mt-4">
                Acceder <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Validación</CardTitle>
            <History className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="min-h-[80px]">
              Verifica la autenticidad de certificados y títulos mediante su hash en la blockchain.
            </CardDescription>
            <Link href="/validate">
              <Button className="w-full mt-4">
                Acceder <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
