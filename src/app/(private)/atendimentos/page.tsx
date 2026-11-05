"use client"

import { useState, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LabelList, Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, UploadCloud, Search, Calendar, TrendingUp, BarChart3, ChevronUp, ChevronDown, Clock, Filter, Users } from "lucide-react"

export default function DashboardRelatorio() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [viewAtiva, setViewAtiva] = useState("geral")
  const [busca, setBusca] = useState("")
  const [dataSelecionada, setDataSelecionada] = useState<string>("todas")
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState<string>("todas")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const gerarMapaCores = (especialidades: string[]) => {
    const mapa: Record<string, string> = {}

    especialidades.forEach((esp, index) => {
      mapa[esp.toUpperCase()] = COLORS_ARRAY[index % COLORS_ARRAY.length]
    })

    return mapa
  }
  const COLORS_ARRAY = [
    "oklch(0.57 0.16 248)", "oklch(0.72 0.18 55)", "oklch(0.66 0.19 135)",
    "oklch(0.62 0.22 25)", "oklch(0.45 0.1 260)", "oklch(0.7 0.15 248)"
  ]

  const formatarTempo = (minutos: number) => {
    const h = Math.floor(minutos / 60)
    const m = minutos % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const formatarParaHora = (minutos: number) => {
    const h = Math.floor(minutos / 60).toString().padStart(2, '0')
    const m = (minutos % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-popover-foreground">
          <p className="font-bold text-xs mb-2 border-b border-border pb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] font-mono mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span>{item.name}:</span>
              <span className="font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/atendimentos/upload-relatorio", { method: "POST", body: formData })
      const json = await res.json()
      setData(json[0])
      toast.success("Relatório processado!")
    } catch (err) {
      toast.error("Erro ao carregar PDF")
    } finally {
      setLoading(false)
    }
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const processedData = useMemo(() => {
    if (!data?.pacientes) return { pacientes: [], salas: [], atendentes: [], comparativoSalas: [], listaEspecialidades: [], maxQtd: 0 }

    const EXP_INICIO = 8 * 60
    const EXP_FIM = 16 * 60 + 30
    const ALMOCO_LIMITE = 13 * 60
    const FIM_MANHA = 12 * 60

    let pacientesBase = data.pacientes.filter((p: any) => {
      return dataSelecionada === "todas" || p.data === dataSelecionada
    })

    let pacientesFiltrados = pacientesBase.filter((p: any) => {
      return (
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.empresa?.toLowerCase().includes(busca.toLowerCase())
      )
    })

    const salasMap: any = {}
    const atendentesMap: any = {}

    const ociosidadeMap: any = {}

    data.summary.salas?.forEach((s: any) => {
      ociosidadeMap[String(s.sala)] = s.ociosidade_min
    })
    console.log("Ociosidade Map:", ociosidadeMap)

    pacientesBase.forEach((p: any) => {
      const primeiroNome = (p.atendimento?.atendente || "N/I").split(' ')[0]
      atendentesMap[primeiroNome] = (atendentesMap[primeiroNome] || 0) + 1

      p.exames?.forEach((ex: any) => {
        const salaKey = String(ex.sala_numero)

        if (!salasMap[salaKey]) {
          salasMap[salaKey] = {
            numero: salaKey,
            esp: ex.especializacao,
            eventos: [],
            totalDuracao: 0,
            ociosidade: ociosidadeMap[salaKey] ?? 0
          }
        }

        salasMap[salaKey].eventos.push({
          inicio: ex.inicio_min,
          fim: ex.fim_min
        })

        salasMap[salaKey].totalDuracao += ex.duracao_min
      })
    })

    let maxQtd = 0
    let salasFinal = Object.values(salasMap).map((s: any) => {
      const ordenados = s.eventos.sort((a: any, b: any) => a.inicio - b.inicio)

      const primeiroAtendimento = ordenados[0]?.inicio || 0
      const ultimoAtendimento = ordenados[ordenados.length - 1]?.fim || 0

      let manhaQtd = 0
      let tardeQtd = 0

      ordenados.forEach((ev: any) => {
        if (ev.inicio < ALMOCO_LIMITE) manhaQtd++
        else tardeQtd++
      })

      if (ordenados.length > maxQtd) maxQtd = ordenados.length

      return {
        label: `${s.numero} - ${s.esp}`,
        sala: s.numero,
        especialidade: s.esp,
        qtd: s.eventos.length,
        manha: manhaQtd,
        tarde: tardeQtd,
        media: Math.round(s.totalDuracao / s.eventos.length),
        ociosidade: s.ociosidade,

        primeiro_h: formatarParaHora(primeiroAtendimento),
        ultimo_h: formatarParaHora(ultimoAtendimento),
        primeiro_min: primeiroAtendimento,
        ultimo_min: ultimoAtendimento
      }
    })

    const listaEspecialidades = Array.from(
      new Set(salasFinal.map(s => s.especialidade.toUpperCase()))
    ).sort()

    const ESPECIALIDADE_COLORS = gerarMapaCores(listaEspecialidades)

    salasFinal = salasFinal.map((s: any) => ({
      ...s,
      corFundo: ESPECIALIDADE_COLORS[s.especialidade.toUpperCase()] ?? COLORS_ARRAY[0]
    }))

    const sortData = (arr: any[]) => {
      if (!sortConfig) return arr
      return [...arr].sort((a: any, b: any) => {
        let valA, valB
        if (sortConfig.key === 'hora_entrada' || sortConfig.key === 'permanencia_total_min') {
          valA = a.atendimento?.[sortConfig.key] ?? 0
          valB = b.atendimento?.[sortConfig.key] ?? 0
        } else {
          valA = a[sortConfig.key] ?? ""
          valB = b[sortConfig.key] ?? ""
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    const salasOrdenadasBase = [...salasFinal].sort((a, b) =>
      a.especialidade.localeCompare(b.especialidade)
    )

    const salasOrdenadas = sortConfig
      ? sortData(salasOrdenadasBase)
      : salasOrdenadasBase

    const comparativoSalas = salasOrdenadas
      .filter(s => especialidadeFiltro === "todas" || s.especialidade === especialidadeFiltro)
      .map(s => ({
        name: `${s.especialidade} | ${s.sala}`,
        manha: s.manha,
        tarde: s.tarde,
        cor: s.corFundo
      }))

    return {
      pacientes: sortData(pacientesFiltrados),
      salas: salasOrdenadas,
      atendentes: Object.entries(atendentesMap).map(([name, value]) => ({ name, value })),
      comparativoSalas,
      listaEspecialidades,
      maxQtd
    }
  }, [data, busca, dataSelecionada, especialidadeFiltro, sortConfig])

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="font-medium text-muted-foreground italic">Sincronizando métricas de atendimento...</p>
    </div>
  )

  const SortIcon = ({ column }: { column: string }) => {
    const active = sortConfig?.key === column

    return (
      <span className="flex flex-col leading-none">
        <ChevronUp
          className={`h-3 w-3 ${active && sortConfig.direction === "asc"
            ? "text-primary"
            : "opacity-20"
            }`}
        />
        <ChevronDown
          className={`h-3 w-3 -mt-1 ${active && sortConfig.direction === "desc"
            ? "text-primary"
            : "opacity-20"
            }`}
        />
      </span>
    )
  }

  // Estilos comuns para eixos no Tema Dark/Light
  const axisStyle = {
    fontSize: 11,
    fill: "hsl(var(--muted-foreground))",
    fontWeight: 500
  }

  const ThSortable = ({ label, column, align = "left" }: any) => (
    <TableHead
      onClick={() => requestSort(column)}
      className={`cursor-pointer select-none ${align === "center" ? "text-center" : align === "right" ? "text-right" : ""
        }`}
    >
      <div className={`flex items-center gap-1 ${align === "center"
        ? "justify-center"
        : align === "right"
          ? "justify-end"
          : ""
        }`}>
        <span className="hover:text-primary transition-colors">
          {label}
        </span>
        <SortIcon column={column} />
      </div>
    </TableHead>
  )



  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-screen text-foreground">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Gestão de Atendimentos</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Performance de Atendimento da Clínica
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data && (
            <Select value={dataSelecionada} onValueChange={setDataSelecionada}>
              <SelectTrigger className="w-[160px] font-semibold bg-background border-border">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Datas</SelectItem>
                {Array.from(new Set(data.pacientes.map((p: any) => p.data))).sort().map(d => (
                  <SelectItem key={String(d)} value={String(d)}>{String(d)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input type="file" onChange={handleFileUpload} className="hidden" id="pdf-upload" accept=".pdf" />
          <Button asChild variant="default" className="shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground">
            <label htmlFor="pdf-upload" className="cursor-pointer flex items-center gap-2 font-bold">
              <UploadCloud size={16} /> Importar PDF
            </label>
          </Button>
        </div>
      </div>

      <Tabs value={viewAtiva} onValueChange={setViewAtiva} className="w-full flex items-center">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1">
          <TabsTrigger value="geral" className="gap-2 cursor-pointer"><BarChart3 size={14} /> Dashboard</TabsTrigger>
          <TabsTrigger value="salas" className="gap-2 cursor-pointer"><Clock size={14} /> Salas</TabsTrigger>
          <TabsTrigger value="pacientes" className="gap-2 cursor-pointer"><Users size={14} /> Fila</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* VIEW GERAL */}
      {viewAtiva === "geral" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 text-primary">
                  <TrendingUp size={18} /> Volume por Sala
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedData.salas} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="label"
                      {...axisStyle}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={80}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value: string) =>
                        value.length > 18 ? value.slice(0, 18) + "..." : value
                      }
                    />
                    <YAxis {...axisStyle} domain={[0, (data: any) => data + 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="qtd" name="Atendimentos" radius={[4, 4, 0, 0]}>
                      {processedData.salas.map((s, i) => (
                        <Cell key={i} fill={s.corFundo} fillOpacity={0.8} />
                      ))}
                      <LabelList
                        dataKey="qtd"
                        position="top"
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          fill: '--foreground',
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader><CardTitle className="text-sm font-bold uppercase text-primary">Distribuição Recepção</CardTitle></CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedData.atendentes}
                      innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={5}
                      stroke="hsl(var(--card))"
                      label={({ name, value, percent }) => `${name} - ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                    >
                      {processedData.atendentes.map((_, i) => <Cell key={i} fill={COLORS_ARRAY[i % COLORS_ARRAY.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-sm font-bold uppercase text-primary">Eficiência de Atendimento (minutos)</CardTitle></CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData.salas} layout="vertical" margin={{ left: 40, right: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" {...axisStyle} width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="media" radius={[0, 4, 4, 0]}>
                    {processedData.salas.map((s, i) => (
                      <Cell key={i} fill={s.corFundo} fillOpacity={0.8} />
                    ))}
                    <LabelList
                      dataKey="media"
                      position="right"
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        fill: '--foreground',
                      }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW SALAS */}
      {viewAtiva === "salas" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="border-border shadow-xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} /> Monitor de Produtividade de Salas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-muted/50 transition-colors">
                    <ThSortable label="Sala / Especialidade" column="label" />

                    <ThSortable label="Atendimentos" column="qtd" align="center" />

                    <ThSortable label="Primeiro Atend." column="primeiro_min" align="center" />

                    <ThSortable label="Último Atend." column="ultimo_min" align="center" />

                    <ThSortable label="Média" column="media" align="center" />

                    <ThSortable label="Ociosidade" column="ociosidade" align="right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.salas.map((s: any) => (
                    <TableRow key={s.sala} className="hover:bg-muted/50 border-b border-border transition-colors group">
                      <TableCell className="font-bold">{s.label}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-muted text-foreground px-2 py-1 rounded-md font-mono font-bold text-xs">{s.qtd}</span>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-sm">{s.primeiro_h}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">{s.ultimo_h}</TableCell>
                      <TableCell className="text-center font-semibold text-sm">{s.media}m</TableCell>
                      <TableCell className={`text-right font-semibold text-sm ${s.ociosidade > 60 ? 'text-destructive' : 'text-accent'}`}>
                        {formatarTempo(s.ociosidade)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border">
              <div>
                <CardTitle className="text-base uppercase tracking-wider text-muted-foreground">Filtro de Especialidade</CardTitle>
                <CardDescription>Compare o desempenho entre salas do mesmo setor.</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-muted p-1.5 rounded-lg">
                <Filter size={14} className="text-muted-foreground ml-2" />
                <Select value={especialidadeFiltro} onValueChange={setEspecialidadeFiltro}>
                  <SelectTrigger className="w-[200px] border-none bg-transparent shadow-none focus:ring-0 font-bold h-8">
                    <SelectValue placeholder="Especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {processedData.listaEspecialidades.map(esp => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedData.comparativoSalas}
                  barCategoryGap="30%"
                  margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    {...axisStyle}
                    tick={{ fontSize: 11, fontWeight: 'bold' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis {...axisStyle} domain={[0, (data: any) => data + 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="manha" name="Manhã" radius={[4, 4, 0, 0]} barSize={30}>
                    {processedData.comparativoSalas.map((entry, index) => (
                      <Cell key={`manha-${index}`} fill={entry.cor} />
                    ))}
                    <LabelList
                      dataKey="manha"
                      position="top"
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        fill: '--foreground',
                      }} />
                  </Bar>

                  <Bar dataKey="tarde" name="Tarde" radius={[4, 4, 0, 0]} barSize={30}>
                    {processedData.comparativoSalas.map((entry, index) => (
                      <Cell key={`tarde-${index}`} fill={entry.cor} fillOpacity={0.6} />
                    ))}
                    <LabelList
                      dataKey="tarde"
                      position="top"
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        fill: '--foreground',
                      }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW PACIENTES */}
      {viewAtiva === "pacientes" && (
        <Card className="animate-in slide-in-from-bottom-4 duration-700 shadow-xl border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/10">
            <CardTitle className="text-lg">Fila de Atendimento</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <ThSortable label="Paciente" column="nome" />

                  <ThSortable label="Empresa" column="empresa" />

                  <ThSortable label="Entrada" column="hora_entrada" align="center" />

                  <ThSortable label="Permanência" column="permanencia_total_min" align="right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.pacientes.map((p: any, i: number) => (
                  <TableRow
                    key={i}
                    className="hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <TableCell className="font-medium text-sm">
                      {p.nome}
                    </TableCell>

                    <TableCell className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
                      {p.empresa}
                    </TableCell>

                    <TableCell className="text-center font-mono text-sm tabular-nums">
                      {p.atendimento?.hora_entrada}
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-bold text-xs tabular-nums">
                        {formatarTempo(p.atendimento?.permanencia_total_min || 0)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}