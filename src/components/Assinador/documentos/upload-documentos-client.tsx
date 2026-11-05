"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function UploadDocumentoClient() {

 const [file, setFile] = useState<File | null>(null)
 const [loading, setLoading] = useState(false)

 async function fileToBase64(file: File) {

  return new Promise<string>((resolve, reject) => {

   const reader = new FileReader()

   reader.readAsDataURL(file)

   reader.onload = () => {
    const base64 = (reader.result as string).split(",")[1]
    resolve(base64)
   }

   reader.onerror = reject
  })
 }

 async function handleUpload() {

  if (!file) {
   toast.warning("Selecione um arquivo")
   return
  }

  try {

   setLoading(true)

   const base64 = await fileToBase64(file)

   const res = await fetch("/api/assinador/documentos/upload", {
    method: "POST",
    headers: {
     "Content-Type": "application/json"
    },
    body: JSON.stringify({
     nome: file.name,
     tipo: "documento",
     arquivo_base64: base64
    })
   })

   if (!res.ok) {
    throw new Error()
   }

   toast.success("Documento enviado com sucesso")

   setFile(null)

  } catch {

   toast.error("Erro ao enviar documento")

  } finally {

   setLoading(false)

  }

 }

 return (

  <div className="max-w-md">

   <h1 className="text-2xl font-bold mb-6">
    Upload de documento
   </h1>

   <Input
    type="file"
    accept="application/pdf"
    className="cursor-pointer"
    onChange={(e) =>
     setFile(e.target.files?.[0] || null)
    }
   />

   <Button
    className="mt-4 cursor-pointer"
    onClick={handleUpload}
    disabled={loading}
   >
    {loading ? "Enviando..." : "Enviar"}
   </Button>

  </div>

 )
}