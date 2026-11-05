"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DocumentoPreview } from "./documentos-preview"
import { DocumentoInfo } from "./documentos-info"
import { DocumentoLogs } from "./documentos-logs"
import { DocumentoActions } from "./documentos-actions"

export default function DetalheDocClient({
 documento,
 logs,
 error
}: any) {

 const [modoAssinatura, setModoAssinatura] = useState(false)

 useEffect(() => {

  if (error) {
   toast.error(error)
   return
  }

  if (!documento) {
   toast.warning("Documento não encontrado ou removido")
  }

 }, [error, documento])

 if (!documento) return null

 return (

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

   <div>
    <DocumentoPreview
      url={documento.id}
      modoAssinatura={modoAssinatura}
    />
   </div>

   <div className="space-y-4">
    <DocumentoInfo documento={documento} />

    <DocumentoActions
      documento={documento}
      setModoAssinatura={setModoAssinatura}
    />

    <DocumentoLogs logs={logs} />
   </div>

  </div>

 )
}