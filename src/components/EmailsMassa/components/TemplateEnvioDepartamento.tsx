"use client"

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useMemo, useState } from "react"
import ModeloSelector from "./ModeloSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ModeloEmail } from "../types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { useAuth } from "@/components/providers/auth-provider";


interface Props {
  departamento: string
  titulo: string
}

interface Administradora {
  id: number
  nome: string
  ativo: boolean
}

export default function TemplateEnvioDepartamento({
  departamento,
  titulo
}: Props) {

  const { user, loading } = useAuth();

  const [administradoras, setAdministradoras] = useState<Administradora[]>([])
  const [emailsDestino, setEmailsDestino] = useState("")
  const [emailsSelecionados, setEmailsSelecionados] = useState<
    { admId: number; email: string }[]
  >([])
  const [admEmailsMap, setAdmEmailsMap] = useState<Record<number, any[]>>({})
  const [emailsExtras, setEmailsExtras] = useState("")
  const [admAbertaId, setAdmAbertaId] = useState<number | null>(null)
  const [modelos, setModelos] = useState<ModeloEmail[]>([])
  const [modeloSelecionado, setModeloSelecionado] =
    useState<ModeloEmail | null>(null)

  const [valores, setValores] = useState<Record<string, string>>({})
  const [loadingEmail, setLoadingEmail] = useState(false)

  const [assuntoEmail, setAssuntoEmail] = useState("")

  if (loading) return <p>Carregando...</p>;
  if (!user) return <p>Não autenticado</p>;

  const authUser = user;

  const variaveisModelo = useMemo(() => {
    if (!modeloSelecionado) return []

    const raw = (modeloSelecionado as any)?.variaveis_json

    if (!raw) return []

    // já é array
    if (Array.isArray(raw)) return raw

    // string JSON
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch (err) {
        console.error("Erro ao parsear variaveis_json:", err)
        return []
      }
    }

    return []
  }, [modeloSelecionado])

  const anexosModelo = useMemo(() => {
    const raw = (modeloSelecionado as any)?.anexos_json?.anexos

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

    return []
  }, [modeloSelecionado])

  // Carrega modelos
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("/api/emails_massa/modelos-email/listar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ departamento })
        })

        const data = await res.json()
        const listaNormalizada = Array.isArray(data)
          ? data.map((m: any) => ({
            ...m,
            variaveis_json: Array.isArray(m.variaveis_json)
              ? m.variaveis_json
              : m.variaveis_json?.variaveis || []
          }))
          : []

        setModelos(listaNormalizada)
      } catch (err) {
        console.error(err)
        toast.error("Erro ao carregar modelos")
      }
    }

    carregar()
  }, [departamento])

  // Atualiza campo final de destinatários automaticamente
  useEffect(() => {
    const emailsUnicos = [
      ...new Set([
        ...emailsSelecionados.map(e => e.email),
        ...emailsExtras
          .split(";")
          .map(e => e.trim())
          .filter(Boolean)
      ])
    ]

    setEmailsDestino(emailsUnicos.join("; "))
  }, [emailsSelecionados, emailsExtras])

  // Reseta valores ao trocar modelo
  useEffect(() => {
    setValores({})
    setAssuntoEmail(modeloSelecionado?.assunto || "")
  }, [modeloSelecionado])

  // Carrega administradoras
  useEffect(() => {
    async function carregarAdministradoras() {
      try {
        const res = await fetch("/api/adms/listar", { method: "POST" })
        const data = await res.json()

        setAdministradoras(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        toast.error("Erro ao carregar administradoras")
      }
    }

    carregarAdministradoras()
  }, [])

  async function carregarEmailsDaAdm(admId: number) {

    if (admEmailsMap[admId]) return // já carregado

    const res = await fetch("/api/adms/emails/listar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adm_id: admId })
    })

    const data = await res.json()

    let lista = []

    if (Array.isArray(data)) {
      lista = data
    } else if (Array.isArray(data?.data)) {
      lista = data.data
    }

    setAdmEmailsMap(prev => ({
      ...prev,
      [admId]: lista
    }))
  }

  // Gera preview dinâmico
  const previewHtml = useMemo(() => {
    if (!modeloSelecionado?.html) return ""
    let html = modeloSelecionado.html

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    const variaveis = variaveisModelo

    variaveis.forEach((variavel: { nome: string | number; tipo: string }) => {

      const valorBruto = valores[variavel.nome]

      if (!valorBruto) return

      if (variavel.tipo === "lista") {

        const itens = valorBruto
          .split("\n")
          .map(i => i.trim())
          .filter(Boolean)

        const regexVariavel = new RegExp(`{{\\s*${variavel.nome}\\s*}}`)

        const elementoComVariavel = Array.from(doc.body.querySelectorAll("*"))
          .find(el => regexVariavel.test(el.innerHTML))

        if (!elementoComVariavel) return

        const parent = elementoComVariavel.parentElement
        if (!parent) return

        // cria UL
        const ul = doc.createElement("ul")

        itens.forEach(item => {

          const clone = elementoComVariavel.cloneNode(true) as HTMLElement

          clone.innerHTML = clone.innerHTML.replace(regexVariavel, item)

          const li = doc.createElement("li")

          li.innerHTML = clone.innerHTML

          ul.appendChild(li)

        })

        parent.insertBefore(ul, elementoComVariavel)

        elementoComVariavel.remove()

      } else {

        doc.body.innerHTML = doc.body.innerHTML.replace(
          new RegExp(`{{\\s*${variavel.nome}\\s*}}`, "g"),
          valorBruto
        )
      }
    })

    // remove li vazios
    doc.querySelectorAll("li").forEach(li => {
      if (!li.textContent?.trim()) {
        li.remove()
      }
    })

    // remove p vazios
    doc.querySelectorAll("p").forEach(p => {
      if (!p.textContent?.trim()) {
        p.remove()
      }
    })

    const finalHtml = doc.body.innerHTML

    return `
<html>
<head>
<style>
body {
  font-family: Calibri, Arial, sans-serif;
}
</style>
</head>
<body>
${finalHtml}
</body>
</html>
`

  }, [modeloSelecionado, valores])
  async function enviar() {

    if (!modeloSelecionado) return

    for (const variavel of variaveisModelo) {
      if (!valores[variavel.nome]) {
        toast.error(`Preencha o campo: ${variavel.label}`)
        return
      }
    }

    if (!emailsDestino.trim()) {
      toast.error("Selecione ao menos um destinatário")
      return
    }

    try {
      setLoadingEmail(true)

      const res = await fetch("/api/emails_massa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelo: {
            email_copia: modeloSelecionado.email_copia,
            html: previewHtml,
            anexos: anexosModelo
          },
          assunto: assuntoEmail,
          destinatarios: emailsDestino,
          remetente: {
            nome: authUser.first_name,
            sobrenome: authUser.last_name,
            cargo: authUser.cargo,
            email: authUser.email,
          },
        })
      })

      if (!res.ok) throw new Error()

      toast.success("Envio iniciado com sucesso")
      setValores({})

    } catch {
      toast.error("Erro ao enviar e-mails")
    } finally {
      setLoadingEmail(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-5">

      <h1 className="text-3xl font-bold text-center">{titulo}</h1>

      <ModeloSelector
        modelos={modelos}
        onChange={setModeloSelecionado}
      />

      {!modeloSelecionado && (
        <div className="text-muted-foreground text-sm text-center">
          Selecione um modelo para continuar.
        </div>
      )}

      {modeloSelecionado && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Informações básicas */}
            <div className="rounded-xl border p-6 bg-card space-y-5">

              <h2 className="text-xl font-semibold">
                Modelo: {modeloSelecionado.nome}
              </h2>

              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Assunto:
                  </label>

                  <Input
                    value={assuntoEmail}
                    onChange={(e) => setAssuntoEmail(e.target.value)}
                  />
                </div>

                <p className="text-muted-foreground text-sm">
                  Cópia: {modeloSelecionado.email_copia}
                </p>

                {anexosModelo.length > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span className="font-medium">Anexos:</span>

                    {anexosModelo.map((anexo: any, i: number) => (
                      <span
                        key={i}
                        className="bg-muted px-2 py-1 rounded text-xs"
                      >
                        📎 {anexo.nome}
                      </span>
                    ))}
                  </div>
                )}

              </div>

              {/* DESTINATÁRIOS */}
              <div className="space-y-4">

                <label className="text-sm font-medium ">
                  Destinatários:
                </label>

                {/* Emails externos */}
                <div className="space-y-2">
                  <Input
                    placeholder="email@empresa.com; outro@empresa.com"
                    value={emailsExtras}
                    onChange={(e) => {
                      const novo = e.target.value
                      setEmailsExtras(novo)
                    }}
                  />
                </div>


                {/* Botão que abre dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full cursor-pointer">
                      Selecionar Administradoras
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>
                        Selecionar E-mails das Administradoras
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2">

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                          // carregar todas as adms que ainda não foram carregadas
                          for (const adm of administradoras) {
                            if (!admEmailsMap[adm.id]) {
                              await carregarEmailsDaAdm(adm.id)
                            }
                          }

                          // depois pegar todos emails
                          const todos = Object.entries(admEmailsMap)
                            .flatMap(([admId, lista]) =>
                              lista.map((e: any) => ({
                                admId: Number(admId),
                                email: e.email
                              }))
                            )

                          setEmailsSelecionados(todos)
                        }}
                        className="cursor-pointer"
                      >
                        Selecionar todas
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setEmailsSelecionados([])
                        }}
                        className="cursor-pointer hover:opacity-80"
                      >
                        Remover selecionadas
                      </Button>

                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto">

                      {administradoras.map(adm => {

                        const emails = admEmailsMap[adm.id] || []

                        return (
                          <div
                            key={adm.id}
                            className="border rounded-lg"
                          >

                            {/* Cabeçalho ADM */}
                            <div
                              onClick={async () => {
                                if (admAbertaId === adm.id) {
                                  setAdmAbertaId(null) // fecha se já estiver aberta
                                } else {
                                  setAdmAbertaId(adm.id)
                                  await carregarEmailsDaAdm(adm.id)
                                }
                              }}
                              className="p-3 font-medium bg-muted cursor-pointer hover:bg-muted/70"
                            >
                              {adm.id} - {adm.nome}
                            </div>

                            {/* Accordion */}
                            {admAbertaId === adm.id && emails.length > 0 && (
                              <div className="p-3 space-y-2">

                                {emails.map((emailObj: any) => {

                                  const email = emailObj.email
                                  const tipo = emailObj.tipo

                                  const checked = emailsSelecionados.some(
                                    e => e.email === email && e.admId === adm.id
                                  )

                                  return (
                                    <label
                                      key={email}
                                      className="flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEmailsSelecionados(prev => [
                                              ...prev,
                                              { admId: adm.id, email }
                                            ])
                                          } else {
                                            setEmailsSelecionados(prev =>
                                              prev.filter(
                                                item => !(item.admId === adm.id && item.email === email)
                                              )
                                            )
                                          }
                                        }}
                                      />

                                      <span>
                                        {email}
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ({tipo})
                                        </span>
                                      </span>

                                    </label>
                                  )
                                })}

                              </div>
                            )}

                          </div>
                        )
                      })}

                    </div>
                  </DialogContent>
                </Dialog>

                {/* Campo final mostrando todos os emails */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    E-mails que receberão:
                  </label>

                  <textarea
                    className="w-full border rounded p-2 bg-muted text-foreground text-sm min-h-[100px]"
                    value={emailsDestino}
                    readOnly
                  />
                </div>

              </div>

            </div>

            {/* Variáveis */}
            <div className="rounded-xl border p-6 bg-card space-y-6">

              <h3 className="font-semibold text-lg">
                Variáveis do Modelo
              </h3>

              {variaveisModelo.map((variavel: { nome: Key | null | undefined; label: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; tipo: string }) => (
                <div key={variavel.nome} className="space-y-2">

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {variavel.label}
                    </span>

                    <span className="text-muted-foreground font-mono text-xs">
                      {"{{" + variavel.nome + "}}"}
                    </span>
                  </div>

                  {variavel.tipo === "lista" ? (
                    <textarea
                      className="w-full border rounded p-2 bg-background text-foreground min-h-[120px]"
                      placeholder={`Digite um item por linha`}
                      value={valores[String(variavel.nome)] || ""}
                      onChange={(e) =>
                        setValores(prev => ({
                          ...prev,
                          [String(variavel.nome)]: e.target.value
                        }))
                      }
                    />
                  ) : (
                    <Input
                      placeholder={`Valor para ${variavel.label}`}
                      value={valores[String(variavel.nome)] || ""}
                      onChange={(e) =>
                        setValores(prev => ({
                          ...prev,
                          [String(variavel.nome)]: e.target.value
                        }))
                      }
                    />
                  )}

                </div>
              ))}
            </div>

          </div>

          {/* Preview */}
          <div className="rounded-xl border p-6 bg-card space-y-4">
            <h3 className="font-semibold text-lg">
              Prévia do E-mail
            </h3>

            <iframe
              className="w-full min-h-[400px] border rounded-lg bg-white"
              srcDoc={previewHtml}
            />
          </div>

          <Button
            className="w-full cursor-pointer"
            onClick={enviar}
            disabled={loadingEmail}
          >
            {loadingEmail ? "Enviando..." : "Enviar E-mails"}
          </Button>

        </div>
      )}
    </div>
  )
}