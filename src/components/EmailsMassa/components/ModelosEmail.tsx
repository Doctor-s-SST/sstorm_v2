"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { EmailEditorRef } from "@/components/EmailsMassa/components/EmailEditor"
import { EmailEditor } from "@/components/EmailsMassa/components/EmailEditor"
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion"

type TipoVariavel = "texto" | "lista"

type Variavel = {
    nome: string
    label: string
    tipo: TipoVariavel
}

type AnexoExistente = {
    nome: string
    fileId: string
}

type Modelo = {
    id: number
    nome: string
    assunto: string
    html_template: string
    variaveis_json: Variavel[]
    ativo: boolean
    departamento: "comercial" | "tecnico"
    copias?: string
    copias_ocultas?: string
    anexos_json?: AnexoExistente[]
}

export function ModelosEmail() {
    const editorRef = useRef<EmailEditorRef>(null)

    const [modelos, setModelos] = useState<Modelo[]>([])
    const [modeloSelecionado, setModeloSelecionado] = useState<Modelo | null>(null)
    const [departamento, setDepartamento] = useState<"comercial" | "tecnico">("comercial")
    const [copias, setCopias] = useState("")
    const [nome, setNome] = useState("")
    const [assunto, setAssunto] = useState("")
    const [html, setHtml] = useState("")
    const [variaveis, setVariaveis] = useState<Variavel[]>([])
    const [ativo, setAtivo] = useState(true)
    const [anexos, setAnexos] = useState<File[]>([])
    const [anexosExistentes, setAnexosExistentes] = useState<AnexoExistente[]>([])
    const [novaVarNome, setNovaVarNome] = useState("")
    const [novaVarLabel, setNovaVarLabel] = useState("")
    const [novaVarTipo, setNovaVarTipo] = useState<TipoVariavel>("texto")
    const [salvando, setSalvando] = useState(false)

    const MAX_FILES = 10

    useEffect(() => {
        carregarModelos()
    }, [])

    async function carregarModelos() {
        try {
            const res = await fetch("/api/emails_massa/modelos-email/listar", { method: "POST", body: JSON.stringify({}) })
            const data = await res.json()

            const lista = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : []

            const modelosNormalizados: Modelo[] = lista.map((modelo: any) => ({
                id: modelo.id,
                nome: modelo.nome,
                assunto: modelo.assunto,
                html_template: modelo.html_template || modelo.html || "",
                ativo: modelo.ativo,
                departamento: modelo.departamento,
                copias: modelo.email_copia || modelo.copias || "",
                anexos_json: Array.isArray(modelo.anexos_json)
                    ? modelo.anexos_json
                    : modelo.anexos_json?.anexos || [],
                variaveis_json: (() => {
                    const raw = modelo.variaveis_json

                    if (!raw) return []

                    if (Array.isArray(raw)) return raw

                    if (typeof raw === "string") {
                        try {
                            const parsed = JSON.parse(raw)
                            return Array.isArray(parsed) ? parsed : []
                        } catch {
                            return []
                        }
                    }

                    if (Array.isArray(raw?.variaveis)) return raw.variaveis

                    if (typeof raw?.variaveis === "string") {
                        try {
                            const parsed = JSON.parse(raw.variaveis)
                            return Array.isArray(parsed) ? parsed : []
                        } catch {
                            return []
                        }
                    }

                    return []
                })()
            }))

            const modelosUnicos = modelosNormalizados.filter(
                (modelo, index, self) =>
                    index === self.findIndex(m => m.id === modelo.id)
            )

            setModelos(modelosUnicos)

        } catch (error) {
            console.error("Erro ao carregar modelos:", error)
            setModelos([])
        }
    }

    function limparFormulario() {
        setModeloSelecionado(null)
        setNome("")
        setAssunto("")
        setHtml("")
        setVariaveis([])
        setAtivo(true)
        setDepartamento("comercial")
        setCopias("")
        setNovaVarTipo("texto")
        setAnexos([])
    }

    function adicionarVariavel() {
        if (!novaVarNome || !novaVarLabel) {
            toast.error("Preencha nome e label da variável")
            return
        }

        const nova: Variavel = {
            nome: novaVarNome.replace(/[^a-zA-Z0-9_]/g, ""),
            label: novaVarLabel,
            tipo: novaVarTipo
        }

        setVariaveis(prev => [...prev, nova])
        setNovaVarNome("")
        setNovaVarLabel("")
        setNovaVarTipo("texto")
    }

    function removerVariavel(nome: string) {
        setVariaveis(prev => prev.filter(v => v.nome !== nome))
    }

    async function salvarModelo() {

        if (!nome || !assunto) {
            toast.error("Nome e assunto são obrigatórios")
            return
        }

        setSalvando(true)

        const loadingToast = toast.loading("Salvando modelo...")

        try {

            const endpoint = modeloSelecionado
                ? "/api/emails_massa/modelos-email/atualizar"
                : "/api/emails_massa/modelos-email/criar"

            const formData = new FormData()

            formData.append("id", modeloSelecionado?.id?.toString() || "")
            formData.append("nome", nome)
            formData.append("assunto", assunto)
            formData.append("html_template", html)
            formData.append("variaveis_json", JSON.stringify(variaveis))
            formData.append("ativo", String(ativo))
            formData.append("departamento", departamento)
            formData.append("copias", copias)

            formData.append("anexos_existentes", JSON.stringify(anexosExistentes))

            anexos.forEach((file) => {
                formData.append("files", file)
            })

            const res = await fetch(endpoint, {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Erro ao salvar modelo")
                return
            }

            toast.success("Modelo salvo com sucesso")

            limparFormulario()
            setAnexos([])
            setAnexosExistentes([])

            carregarModelos()

        } catch (err) {

            toast.error("Erro ao salvar modelo")

        } finally {

            setSalvando(false)
            toast.dismiss(loadingToast)

        }
    }
    function normalizarVariaveis(v: any): Variavel[] {

        if (!v) return []

        if (Array.isArray(v)) return v

        if (typeof v === "string") {
            try {
                const parsed = JSON.parse(v)
                return Array.isArray(parsed) ? parsed : []
            } catch {
                return []
            }
        }

        if (Array.isArray(v?.variaveis)) return v.variaveis

        if (typeof v?.variaveis === "string") {
            try {
                const parsed = JSON.parse(v.variaveis)
                return Array.isArray(parsed) ? parsed : []
            } catch {
                return []
            }
        }

        return []
    }

    function removerAnexoExistente(fileId: string) {
        setAnexosExistentes(prev => prev.filter(a => a.fileId !== fileId))
    }

    function editarModelo(modelo: Modelo) {
        setModeloSelecionado(modelo)
        setNome(modelo.nome)
        setAssunto(modelo.assunto)
        setHtml(modelo.html_template)
        setVariaveis(normalizarVariaveis(modelo.variaveis_json))
        setAtivo(modelo.ativo)
        setDepartamento(modelo.departamento)
        setCopias(modelo.copias || "")

        let anexos: AnexoExistente[] = []

        if (modelo.anexos_json) {

            if (typeof modelo.anexos_json === "string") {
                try {
                    anexos = JSON.parse(modelo.anexos_json)
                } catch {
                    anexos = []
                }
            } else {
                anexos = modelo.anexos_json
            }

        }

        setAnexosExistentes(anexos)

        setAnexos([])
    }

    async function excluirModelo(id: number) {
        await fetch("/api/emails_massa/modelos-email/deletar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        })

        if (modeloSelecionado?.id === id) {
            limparFormulario()
        }

        toast.success("Modelo excluído")
        carregarModelos()
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-10">

            <h1 className="text-3xl font-bold">
                Modelos de Email
            </h1>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="modelos">
                    <AccordionTrigger className="cursor-pointer bg-muted-foreground/10 p-4">
                        <span className="font-semibold text-lg">
                            Modelos existentes
                        </span>
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-4 mt-4">
                            {modelos.map(modelo => (
                                <div key={`modelo-${modelo.id}`} className="border p-4 rounded flex justify-between">
                                    <div>
                                        <p className="font-semibold">{modelo.nome}</p>
                                        <p className="text-sm text-gray-500 capitalize">
                                            Departamento: {modelo.departamento}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={() => editarModelo(modelo)} className="cursor-pointer">
                                            Editar
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            onClick={() => excluirModelo(modelo.id)}
                                            className="cursor-pointer"
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="border p-6 rounded space-y-6">

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {modeloSelecionado ? "Editar Modelo" : "Novo Modelo"}
                    </h2>

                    {modeloSelecionado && (
                        <Button
                            variant="outline"
                            onClick={limparFormulario}
                            className="cursor-pointer"
                        >
                            + Novo Modelo
                        </Button>
                    )}
                </div>

                <Input
                    placeholder="Nome do modelo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <Input
                    placeholder="Assunto do email"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                />

                <div className="space-y-2">
                    <p className="font-medium">Departamento</p>
                    <select
                        className="w-full border rounded p-2"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value as any)}
                    >
                        <option value="comercial" className="bg-background text-foreground">Comercial</option>
                        <option value="tecnico" className="bg-background text-foreground">Técnico</option>
                    </select>
                </div>

                <Input
                    placeholder="Cópias (separar por vírgula)"
                    value={copias}
                    onChange={(e) => setCopias(e.target.value)}
                />

                <Alert>
                    <Info className="h-4 w-full" />
                    <AlertTitle>Como usar os campos automáticos?</AlertTitle>
                    <AlertDescription>
                        Para que o sistema preencha informações automaticamente no e-mail,
                        escreva o nome do campo entre chaves duplas, assim:<b> {"{{exemplo}}"}</b>

                        Quando o campo for do tipo lista, ele será exibido como vários itens
                        organizados um abaixo do outro automaticamente.
                    </AlertDescription>
                </Alert>

                <div>
                    <p className="font-medium mb-2">Corpo do Email</p>
                    <EmailEditor
                        key={modeloSelecionado?.id || "novo"}
                        ref={editorRef}
                        content={html}
                        onChange={setHtml}
                    />
                </div>

                <div className="border p-4 rounded space-y-4">
                    <h3 className="font-semibold">Variáveis</h3>

                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="nome da variável (ex: valor_pgr)"
                            value={novaVarNome}
                            onChange={(e) => setNovaVarNome(e.target.value)}
                        />

                        <Input
                            placeholder="nome do campo (ex: Valor do PGR:)"
                            value={novaVarLabel}
                            onChange={(e) => setNovaVarLabel(e.target.value)}
                        />

                        <select
                            className="border rounded p-2 cursor-pointer"
                            value={novaVarTipo}
                            onChange={(e) => setNovaVarTipo(e.target.value as TipoVariavel)}
                        >
                            <option value="texto" className="bg-background text-foreground">Texto</option>
                            <option value="lista" className="bg-background text-foreground">Lista</option>
                        </select>

                        <Button onClick={adicionarVariavel} className="cursor-pointer">
                            Adicionar
                        </Button>
                    </div>

                    {variaveis.map((v, index) => (
                        <div key={`${v.nome}-${index}`} className="flex justify-between items-center border p-2 rounded">
                            <div>
                                <p className="font-medium">{v.label}</p>
                                <p className="text-sm text-gray-500">
                                    Placeholder: {"{{" + v.nome + "}}"} | Tipo: {v.tipo}
                                </p>
                            </div>

                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removerVariavel(v.nome)}
                                className="cursor-pointer"
                            >
                                Remover
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <label className="font-medium">
                        Anexos do Email
                    </label>

                    <div className="border rounded-lg p-4 bg-muted/30">
                        <Input
                            type="file"
                            multiple
                            className="cursor-pointer"
                            onChange={(e) => {

                                if (!e.target.files) return

                                const novos = Array.from(e.target.files)
                                if (anexos.length + novos.length > MAX_FILES) {
                                    toast.error("Máximo de 10 anexos")
                                    return
                                }
                                setAnexos(prev => [...prev, ...novos])

                                e.target.value = ""
                            }}
                        />

                        <p className="text-xs text-muted-foreground mt-2">
                            Você pode selecionar mais de um arquivo.
                        </p>
                    </div>
                </div>

                {anexos.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-medium">Novos anexos</p>

                        {anexos.map((file, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center border rounded p-2"
                            >
                                <span className="text-sm">{file.name}</span>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setAnexos(prev => prev.filter((_, i) => i !== index))
                                    }
                                >
                                    Remover
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {anexosExistentes.length > 0 && (
                    <div className="space-y-2">
                        <p className="font-medium">Anexos já cadastrados</p>

                        {anexosExistentes.map((anexo) => (
                            <div
                                key={anexo.fileId}
                                className="flex justify-between items-center border rounded p-2"
                            >
                                <span className="text-sm">{anexo.nome}</span>

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="cursor-pointer"
                                    onClick={() => removerAnexoExistente(anexo.fileId)}
                                >
                                    Remover
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                    />
                    Modelo ativo
                </label>

                <Button
                    onClick={salvarModelo}
                    disabled={salvando}
                    className="cursor-pointer"
                >
                    {salvando ? "Salvando..." : "Salvar Modelo"}
                </Button>

            </div>
        </div>
    )
}