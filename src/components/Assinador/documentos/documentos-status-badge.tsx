import { Badge } from "@/components/ui/badge"

export function DocumentoStatusBadge({ status }: { status: string }) {

 if (status === "assinado") {
  return <Badge className="bg-green-600">Assinado</Badge>
 }

 if (status === "pendente") {
  return <Badge className="bg-yellow-500">Pendente</Badge>
 }

 if (status === "cancelado") {
  return <Badge variant="destructive">Cancelado</Badge>
 }

 return <Badge>{status}</Badge>
}