import { Card } from "@/components/ui/card"

export default function Dashboard() {
 return (
  <div className="grid grid-cols-3 gap-6">

   <Card className="p-6">
    <p className="text-sm text-muted-foreground">
     Documentos hoje
    </p>
    <h2 className="text-3xl font-bold">
     12
    </h2>
   </Card>

   <Card className="p-6">
    <p className="text-sm text-muted-foreground">
     Assinados
    </p>
    <h2 className="text-3xl font-bold">
     9
    </h2>
   </Card>

   <Card className="p-6">
    <p className="text-sm text-muted-foreground">
     Pendentes
    </p>
    <h2 className="text-3xl font-bold">
     3
    </h2>
   </Card>

  </div>
 )
}