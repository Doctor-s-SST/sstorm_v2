"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export function DocumentoActions({ documento, setModoAssinatura }: any) {

    const [baixando, setBaixando] = useState(false)

    function assinarDocumento() {
        setModoAssinatura(true)
    }

    async function baixarPDF() {
        try {
            setBaixando(true)

            const res = await fetch(`/api/assinador/documentos/preview/${documento.id}`)

            if (!res.ok) throw new Error()

            const blob = await res.blob()

            const url = window.URL.createObjectURL(blob)

            const link = document.createElement("a")
            link.href = url
            link.download = `${documento.nome}.pdf`

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            window.URL.revokeObjectURL(url)

        } catch {
            alert("Erro ao baixar PDF")
        } finally {
            setBaixando(false)
        }
    }

    return (
        <div className="flex gap-3 flex-wrap">

            {documento.status === "pendente" && (
                <Button onClick={assinarDocumento} className="cursor-pointer">
                    Assinar documento
                </Button>
            )}

            <Button
                variant="secondary"
                disabled={baixando}
                onClick={baixarPDF}
                className="cursor-pointer flex items-center gap-2"
            >
                {baixando && <Loader2 className="h-4 w-4 animate-spin" />}
                {baixando ? "Baixando..." : "Baixar PDF (sem assinatura)"}
            </Button>

        </div>
    )
}