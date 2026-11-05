"use client"

import { useEffect, useState } from "react"
import { CertificadoForm } from "@/components/Assinador/certificados/CertificadoForm"
import { CertificadoList } from "@/components/Assinador/certificados/CertificadoList"
import { toast } from "sonner"

export default function CertificadosPage() {

    const [certificados, setCertificados] = useState<any[]>([])

    async function carregarCertificados() {
        try {
            const res = await fetch("/api/assinador/certificados")

            if (!res.ok) throw new Error("Erro na API")

            const data = await res.json()

            let lista: any[] = []
            
            if (Array.isArray(data)) {
                lista = data
            } else if (Array.isArray(data.data)) {
                lista = data.data
            } else if (data && typeof data === "object") {
                lista = [data]
            }

            
            setCertificados(lista)

        } catch (err) {
            console.error(err)
            toast.error("Erro ao carregar certificados")
            setCertificados([])
        }
    }

    useEffect(() => {
        carregarCertificados()

    }, [])

    return (
        <div className="space-y-6 p-6">

            <h1 className="text-2xl font-bold">
                Certificados Digitais
            </h1>

            <CertificadoForm onSuccess={carregarCertificados} />

            <CertificadoList
                certificados={certificados}
                onDelete={carregarCertificados}
            />

        </div>
    )
}