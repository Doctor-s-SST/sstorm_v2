import { cookies } from "next/headers"
import DetalheDocsClient from "@/components/Assinador/documentos/documentos-detalhe-client"

async function buscarDocumento(id: string) {

 const cookieStore = await cookies()

 const res = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL}/api/assinador/documentos/${id}`,
  {
   method: "GET",
   headers: {
    "Content-Type": "application/json",
    Cookie: cookieStore.toString(),
   },
   cache: "no-store"
  }
 )

 if (!res.ok) {
  return { error: true }
 }
 const data = await res.json()
 return data
}

export default async function DocumentoDetalhe({
 params
}: {
 params: Promise<{ id: string }>
}) {

 const { id } = await params

 if (!id) {
  return <DetalheDocsClient error="Documento não encontrado" />
 }

 const data = await buscarDocumento(id)

 if (!data || data.error) {
  return <DetalheDocsClient error="Documento não encontrado" />
 }

 return (
  <DetalheDocsClient
   documento={data.select.documento}
   logs={data.select.logs || []}
  />
 )
}