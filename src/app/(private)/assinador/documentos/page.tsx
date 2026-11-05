import { cookies } from "next/headers"
import DocumentosClient from "@/components/Assinador/documentos/documentos-client"

export default async function DocumentosPage() {

  const cookieStore = await cookies()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/assinador/documentos`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore.toString(),
      },
      cache: "no-store"
    }
  )

  let documentos = []
  let error = null

  if (!res.ok) {
    error = "Erro ao listar documentos"
  } else {
    const data = await res.json()
    documentos = data ?? []
  }

  return <DocumentosClient documentos={documentos} error={error} />
}