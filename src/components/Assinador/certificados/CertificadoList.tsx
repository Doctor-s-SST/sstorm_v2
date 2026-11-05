"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { useEffect } from "react"

export function CertificadoList({ certificados, onDelete }: any) {

    async function excluir(id: string) {

        if (!confirm("Deseja excluir este certificado?")) return

        const res = await fetch(`/api/assinador/certificados`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id })
        })

        if (!res.ok) {
            toast.error("Erro ao excluir")
            return
        }

        toast.success("Certificado removido")
        onDelete()
    }

    function formatDate(date?: string) {
        if (!date) return "-"

        try {
            const [year, month, day] = date.split("T")[0].split("-")
            return `${day}/${month}/${year}`
        } catch {
            return "-"
        }
    }

    function status(validade_fim?: string) {
        if (!validade_fim) return "Indefinido"

        const hoje = new Date()
        const fim = new Date(validade_fim)

        if (isNaN(fim.getTime())) return "Indefinido"

        if (fim < hoje) return "Vencido"
        return "Válido"
    }

    useEffect(() => {
        if (!Array.isArray(certificados) || certificados.length === 0) {
            toast.info("Nenhum certificado cadastrado")
        }
    }, [certificados])

    const lista = Array.isArray(certificados)
        ? certificados.filter(c => c && c.validade_inicio && c.validade_fim)
        : []

    return (
        <Card className="p-6 space-y-4">

            <h2 className="font-semibold text-lg">
                Certificados cadastrados
            </h2>

            <div className="space-y-3">

                {lista.map((c: any) => (
                    <div
                        key={`certificado-${c.id}`}
                        className="border rounded-xl p-4 flex justify-between items-center transition
      bg-white dark:bg-zinc-900
      border-gray-200 dark:border-zinc-800
      hover:shadow-sm dark:hover:bg-zinc-800"
                    >

                        {/* INFO */}
                        <div className="flex flex-col gap-1">

                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {c.nome}
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Registro: {c.registro}
                            </div>

                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDate(c.validade_inicio)} até {formatDate(c.validade_fim)}
                            </div>

                            {/* STATUS BADGE */}
                            <div>
                                <span className={`text-xs px-2 py-1 rounded-full ${status(c.validade_fim) === "Válido"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                    {status(c.validade_fim)}
                                </span>
                            </div>

                        </div>

                        {/* ACTIONS */}
                        <div>
                            <Button
                                variant="outline"
                                className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50
          dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
                                onClick={() => excluir(c.id)}
                            >
                                Excluir
                            </Button>
                        </div>

                    </div>
                ))}

                {certificados.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Nenhum certificado cadastrado
                    </p>
                )}

            </div>

        </Card>
    )
}