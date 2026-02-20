"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Send } from "lucide-react"

type Adm = {
    id: number
    nome: string
}

type Modelo = {
    id: number
    nome: string
}

type Props = {
    modelo: string
}

export default function PropostaAdms({ modelo }: Props) {
    const { user, loading } = useAuth()

    const [adms, setAdms] = useState<Adm[]>([])
    const [modelos, setModelos] = useState<Modelo[]>([])

    const [admSelecionada, setAdmSelecionada] = useState<number | null>(null)
    const [modeloSelecionado, setModeloSelecionado] = useState<number | null>(null)

    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        fetch("SEU_WEBHOOK_N8N/adms_listar", { method: "POST" })
            .then(res => res.json())
            .then(setAdms)
            .catch(() => toast.error("Erro ao carregar administradoras"))
    }, [])

    useEffect(() => {
        if (!admSelecionada) return

        fetch("SEU_WEBHOOK_N8N/adms_modelos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adm_id: admSelecionada })
        })
            .then(res => res.json())
            .then(setModelos)
            .catch(() => toast.error("Erro ao carregar modelos"))
    }, [admSelecionada])

    async function enviar() {
        if (!admSelecionada || !modeloSelecionado) {
            toast.error("Selecione ADM e Modelo")
            return
        }

        setIsSending(true)

        try {
            const res = await fetch("SEU_WEBHOOK_N8N/email_enviar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adm_id: admSelecionada,
                    modelo_id: modeloSelecionado,
                    user
                })
            })

            if (!res.ok) throw new Error()

            toast.success("Emails enviados")
        } catch {
            toast.error("Erro ao enviar")
        } finally {
            setIsSending(false)
        }
    }

    if (loading) return <p>Carregando...</p>
    if (!user) return <p>Não autenticado</p>

    return (
        <div className="space-y-4 border rounded-lg p-6 w-full max-w-2xl">

            <select
                onChange={(e) => setAdmSelecionada(Number(e.target.value))}
                className="w-full border p-2 rounded"
            >
                <option value="">Selecione a administradora</option>
                {adms.map(adm => (
                    <option key={adm.id} value={adm.id}>
                        {adm.nome}
                    </option>
                ))}
            </select>

            <select
                onChange={(e) => setModeloSelecionado(Number(e.target.value))}
                className="w-full border p-2 rounded"
            >
                <option value="">Selecione o modelo</option>
                {modelos.map(m => (
                    <option key={m.id} value={m.id}>
                        {m.nome}
                    </option>
                ))}
            </select>

            <Button
                onClick={enviar}
                disabled={isSending}
                className="w-full"
            >
                {isSending ? "Enviando..." : "Enviar"}
                {!isSending && <Send className="ml-2 h-4 w-4" />}
            </Button>

        </div>
    )
}
