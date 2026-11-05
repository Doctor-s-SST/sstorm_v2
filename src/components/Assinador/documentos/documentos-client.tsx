"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DocumentosTable } from "./documentos-table"
import { DocumentosFilters } from "./documentos-filters"

export default function DocumentosClient({ documentos: initialDocs, error }: any) {

  const [documentos, setDocumentos] = useState(initialDocs || [])

  useEffect(() => {
    if (error) {
      toast.error(error)
      return
    }

    if (!initialDocs || initialDocs.length === 0) {
      toast.warning("Nenhum documento encontrado")
    }
  }, [])

  return (
    <div>

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Documentos
        </h1>
      </div>

      <DocumentosFilters />

      <DocumentosTable
        documentos={documentos}
        setDocumentos={setDocumentos}
      />

    </div>
  )
}