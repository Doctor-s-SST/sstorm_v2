"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/providers/auth-provider"
import { Send, CheckCircle2 } from "lucide-react"

type Props = {
    modelo: string
}

export default function InformeTecnico({ modelo }: Props) {
    const { user, loading } = useAuth()
    const [emailsRaw, setEmailsRaw] = useState("")
    const [isSending, setIsSending] = useState(false)

    if (loading) return <p>Carregando...</p>
    if (!user) return <p>Não autenticado</p>

    function parseEmails(texto: string) {
        return texto
            .split(/[\n,; \t]+/)
            .map(e => e.trim().toLowerCase())
            .filter(Boolean)
    }

    function isEmailValido(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }


    async function enviar() {
        const emails = parseEmails(emailsRaw)
        const emailsValidos = emails.filter(isEmailValido)

        if (emailsValidos.length === 0) {
            toast.error("Nenhum e-mail válido encontrado")
            return
        }

        const lista = emailsValidos.map(email => ({ email }))

        setIsSending(true)

        try {
            const res = await fetch("/api/emails_massa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destinatarios: lista,
                    modelo,
                    user
                })
            })

            if (!res.ok) throw new Error()

            toast.success(`Enviado para ${emails.length} destinatários`)
            setEmailsRaw("")
        } catch {
            toast.error("Erro ao enviar")
        } finally {
            setIsSending(false)
        }
    }

    const emailsDetectados = parseEmails(emailsRaw)
    const emailsValidos = emailsDetectados.filter(isEmailValido)

    return (
        <div className="space-y-4 border rounded-lg p-6 w-full max-w-2xl">

            <div className="space-y-1">
                <label className="text-sm font-medium">
                    Lista de destinatários
                </label>
                <p className="text-xs text-muted-foreground">
                    Cole aqui e-mails separados por quebra de linha, vírgula, espaço ou ponto e vírgula.
                </p>
            </div>

            <Textarea
                placeholder={`exemplo:
email1@empresa.com
email2@empresa.com, email3@empresa.com`}
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                className="min-h-[180px]"
            />

            <p className="text-xs text-muted-foreground">
                {emailsValidos.length} e-mails válidos detectados
                {emailsDetectados.length !== emailsValidos.length && (
                    <> • {emailsDetectados.length - emailsValidos.length} inválidos ignorados</>
                )}
            </p>

            <Button
                onClick={enviar}
                disabled={isSending}
                className="w-full cursor-pointer"
            >
                {isSending ? "Enviando..." : "Enviar"}
                {!isSending && <Send className="ml-2 h-4 w-4" />}
            </Button>

            {!isSending && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Assunto, corpo e CC são aplicados automaticamente
                </p>
            )}

        </div>

    )
}
