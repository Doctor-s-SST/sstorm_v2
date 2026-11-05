import { Card } from "@/components/ui/card"

export function DocumentoInfo({ documento }: any) {

 return (
  <Card className="p-4 space-y-2">

   <div>
    <strong>Nome:</strong> {documento.nome}
   </div>

   <div>
    <strong>Tipo:</strong> {documento.tipo}
   </div>

   <div>
    <strong>Status:</strong> {documento.status}
   </div>

   <div>
    <strong>Data de Upload:</strong> {documento.data}
   </div>

  </Card>
 )
}