import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { DocumentoStatusBadge } from "./documentos-status-badge"
import { toast } from "sonner"
import { useEffect } from "react"

export function DocumentosTable({ documentos, setDocumentos }: any) {

    async function excluir(id: string) {

        if (!confirm("Deseja excluir este documento?")) return

        const res = await fetch(`/api/assinador/documentos`, {
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

        toast.success("Documento removido")

        // 🔥 REMOVE DA LISTA (sem refetch)
        setDocumentos((prev: any[]) =>
            prev.filter(doc => doc.id !== id)
        )
    }

    useEffect(() => {
            if (!Array.isArray(documentos) || documentos.length === 0) {
                toast.info("Nenhum certificado cadastrado")
            }
        }, [documentos])

    return (
        <Table>

            <TableHeader>
                <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>

                {documentos.map((doc: any) => (
                    <TableRow key={'doc-' + doc.id}>

                        <TableCell className="font-medium">
                            {doc.nome}
                        </TableCell>

                        <TableCell>
                            {doc.tipo}
                        </TableCell>

                        <TableCell>
                            <DocumentoStatusBadge status={doc.status} />
                        </TableCell>

                        <TableCell>
                            {doc.data}
                        </TableCell>

                        <TableCell className="flex gap-2">

                            <Button size="sm" className="cursor-pointer" onClick={() => window.open(`/assinador/documentos/${doc.id}`, "_blank")}>
                                Ver
                            </Button>

                            <Button
                                size="sm"
                                variant="outline"
                                className="cursor-pointer text-red-600 hover:bg-red-50
          dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
                                onClick={() => excluir(doc.id)}
                            >
                                Excluir
                            </Button>

                        </TableCell>

                    </TableRow>
                ))}

            </TableBody>

        </Table>
    )
}