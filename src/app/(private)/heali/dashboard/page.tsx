"use client"

import { useState, useMemo } from "react"
import { Loader2, Check, LayoutDashboard, ClipboardList, FileText, CheckCircle2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils" // Certifique-se de ter essa utilitária padrão do shadcn

export default function DashboardHeali() {
    const [token, setToken] = useState("")
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [busca, setBusca] = useState("")
    const [filtroPercentual, setFiltroPercentual] = useState("todos")

    async function carregar() {
        if (!token) return
        setLoading(true)

        try {
            // 🔹 1. busca dados da Heali
            const res = await fetch("/api/heali", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token })
            })

            const json = await res.json()

            let lista: any[] = []

            if (Array.isArray(json)) {
                const first = json[0]
                lista = first?.allData || first?.data || []
            } else {
                lista = json?.allData || json?.data || []
            }

            // 🔹 2. busca executados do banco
            const resExec = await fetch("/api/heali/executados")

            let executados = []

            if (resExec.ok) {
                const text = await resExec.text()
                executados = text ? JSON.parse(text) : []
            } else {
                console.error("Erro ao buscar executados")
            }

            // 🔥 3. transforma em SET (super importante pra performance)
            const executadosSet = new Set(
                executados.map((e: any) => e.program_id)
            )

            // 🔥 4. cruza os dados
            const formatado = lista.map((item: any) => {
                const inscritos = item.inscritos || 0
                const execucoes = item.execucoes || 0

                const isExecutado = executadosSet.has(item.id)

                return {
                    id: item.id,
                    nome: item.company?.name?.trim() || "-",
                    inscritos,
                    execucoes,
                    percentual: inscritos > 0 ? (execucoes / inscritos) * 100 : 0,
                    executadoManual: isExecutado
                }
            })

            setData(formatado)

        } catch (err) {
            console.error("Erro:", err)
        } finally {
            setLoading(false)
        }
    }

    function getStatus(item: any) {
        if (item.executadoManual) return "executado"
        if (item.percentual < 30) return "pendente questionario"
        return "pendente documentação"
    }

    const dataFiltrada = useMemo(() => {
        return data.filter((item) => {
            const matchNome = item.nome.toLowerCase().includes(busca.toLowerCase())
            const status = getStatus(item)
            if (filtroPercentual === "baixo") return item.percentual < 30 && matchNome
            if (filtroPercentual === "medio") return item.percentual >= 30 && item.percentual < 100 && matchNome
            if (filtroPercentual === "executado") return status === "executado" && matchNome
            if (filtroPercentual === "pendenteQ") return status === "pendente questionario" && matchNome
            if (filtroPercentual === "pendenteD") return status === "pendente documentação" && matchNome
            return matchNome
        })
    }, [data, busca, filtroPercentual])

    const resumo = useMemo(() => {
        return {
            total: data.length,
            questionario: data.filter(d => getStatus(d) === "pendente questionario").length,
            doc: data.filter(d => getStatus(d) === "pendente documentação").length,
            executado: data.filter(d => getStatus(d) === "executado").length
        }
    }, [data])

    async function marcarExecutado(item: any) {
        try {
            // salva no backend
            await fetch("/api/heali/executado", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: item.id, nome_empresa: item.nome, })
            })

            // atualiza tela
            setData(prev =>
                prev.map(i =>
                    i.id === item.id
                        ? { ...i, executadoManual: true }
                        : i
                )
            )

        } catch (err) {
            console.error("Erro ao salvar:", err)
        }
    }

    // Componente de Card de Filtro Otimizado
    const FilterCard = ({ title, value, icon: Icon, colorClass, filterKey }: any) => {
        const isActive = filtroPercentual === filterKey
        return (
            <Card
                className={cn(
                    "relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1 border-l-4",
                    colorClass,
                    isActive ? "ring-2 ring-primary ring-offset-2 bg-muted/50" : "opacity-80 hover:opacity-100"
                )}
                onClick={() => setFiltroPercentual(filterKey)}
            >
                <CardContent className="p-5 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold break-words">{value}</p>
                    </div>
                    <Icon className={cn("w-8 h-8 opacity-20", isActive && "opacity-100")} />
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="p-6 w-full max-w-full space-y-8 overflow-hidden">
            {/* HEADER & TOKEN */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestão AEP - HEALI</h1>
                    <p className="text-muted-foreground text-sm">Monitore o progresso das empresas em tempo real.</p>
                </div>
               <div className="flex flex-col sm:flex-row gap-2 w-full md:w-96">
                    <Input
                        placeholder="Token de acesso"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && carregar()}
                        className="bg-background"
                    />
                    <Button onClick={carregar} disabled={loading} className="shrink-0 cursor-pointer">
                        {loading ? <Loader2 className="animate-spin" /> : "Carregar"}
                    </Button>
                </div>
            </div>

            {/* 📊 GRID DE CARDS COM FILTRO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FilterCard
                    title="Total Geral"
                    value={resumo.total}
                    icon={LayoutDashboard}
                    colorClass="border-blue-500"
                    filterKey="todos"
                />
                <FilterCard
                    title="Pendente Questionário"
                    value={resumo.questionario}
                    icon={ClipboardList}
                    colorClass="border-yellow-500"
                    filterKey="pendenteQ"
                />
                <FilterCard
                    title="Pendente Documentos"
                    value={resumo.doc}
                    icon={FileText}
                    colorClass="border-orange-500"
                    filterKey="pendenteD"
                />
                <FilterCard
                    title="Executados"
                    value={resumo.executado}
                    icon={CheckCircle2}
                    colorClass="border-green-500"
                    filterKey="executado"
                />
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-6 space-y-6">
                    {/* BUSCA REFINADA */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-md">
                            <Input
                                placeholder="Filtrar por nome da empresa..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="pl-4 h-10"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                            Exibindo <span className="text-foreground">{dataFiltrada.length}</span> resultados
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto rounded-md border">
                        <Table className="w-full">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold">Empresa</TableHead>
                                    <TableHead className="font-bold hidden sm:table-cell">Inscritos</TableHead>
                                    <TableHead className="text-center font-bold hidden sm:table-cell">Executados</TableHead>
                                    <TableHead className="text-center font-bold hidden md:table-cell">Progresso</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataFiltrada.length > 0 ? (
                                    dataFiltrada.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium max-w-[250px] truncate">{item.nome}</TableCell>
                                            <TableCell className="text-center hidden sm:table-cell">{item.inscritos}</TableCell>
                                            <TableCell className="text-center hidden sm:table-cell">{item.execucoes}</TableCell>
                                            <TableCell className="text-center hidden md:table-cell">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 bg-secondary h-2 rounded-full overflow-hidden hidden sm:block">
                                                        <div
                                                            className="bg-primary h-full"
                                                            style={{ width: `${Math.min(item.percentual, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-mono">{item.percentual.toFixed(1)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={getStatus(item)} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {getStatus(item) !== "executado" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="cursor-pointer h-8 hover:bg-primary hover:text-primary-foreground transition-all"
                                                        onClick={() => marcarExecutado(item)}
                                                    >
                                                        <Check className="w-3.5 h-3.5 mr-1" />
                                                        Concluir
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Nenhum registro encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        "pendente questionario": "bg-yellow-500/10 text-yellow-600 border-yellow-200",
        "pendente documentação": "bg-orange-500/10 text-orange-600 border-orange-200",
        "executado": "bg-green-500/10 text-green-600 border-green-200"
    }

    return (
        <span className={cn("px-2.5 py-0.5 text-[11px] font-semibold uppercase rounded-full border", styles[status])}>
            {status}
        </span>
    )
}