"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRef, useState } from "react"

export function CertificadoForm({ onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.name.endsWith(".pfx")) {
      toast.error("Apenas arquivos .pfx")
      return
    }
    setFile(file)
  }

  function handleDrop(e: any) {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleSubmit(e: any) {
    e.preventDefault()

    if (!file || !senha) {
      toast.error("Envie o certificado e a senha")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("senha", senha)

    setLoading(true)

    fetch("/api/assinador/certificados", {
      method: "POST",
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error()
        toast.success("Certificado importado")
        setFile(null)
        setSenha("")

        // 🔥 limpa input REAL
        if (inputRef.current) {
          inputRef.current.value = ""
        }

        onSuccess()
      })
      .catch(() => toast.error("Erro ao importar"))
      .finally(() => setLoading(false))
  }

  return (
    <Card className="p-6 space-y-4">

      <h2 className="text-lg font-semibold">
        Importar certificado
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* UPLOAD */}
        <div>
          <label className="text-sm font-medium">
            Arquivo (.pfx)
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
              ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
            `}
          >

            <input
              ref={inputRef}
              type="file"
              accept=".pfx"
              className="hidden cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />

            {!file ? (
              <p className="text-sm text-gray-600">
                Arraste o certificado ou clique para selecionar
              </p>
            ) : (
              <div className="text-sm text-blue-600">
                {file.name}
              </div>
            )}

          </div>
        </div>

        {/* SENHA */}
        <div>
          <label className="text-sm font-medium">
            Senha do certificado
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end cursor-pointer">
          <Button type="submit" disabled={loading}>
            {loading ? "Processando..." : "Importar"}
          </Button>
        </div>

      </form>
    </Card>
  )
}