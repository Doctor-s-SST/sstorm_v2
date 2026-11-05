"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type Adm = {
  id: number
  nome: string
  codigo: number
  ativo: boolean
}

type Email = {
  id: number
  email: string
  nome_contato?: string
  tipo?: string
}

export function AdmCrud() {

  const [adms, setAdms] = useState<Adm[]>([])
  const [admIdSelecionada, setAdmIdSelecionada] = useState<number | "">("")
  const [admSelecionada, setAdmSelecionada] = useState<Adm | null>(null)
  const [emails, setEmails] = useState<Email[]>([])

  const [novoNome, setNovoNome] = useState("")
  const [novoCodigo, setNovoCodigo] = useState<number | "">("")
  const [novoAtivo, setNovoAtivo] = useState(true)

  const [novoEmail, setNovoEmail] = useState("")
  const [novoTipo, setNovoTipo] = useState("")

  const [nomeNovaAdm, setNomeNovaAdm] = useState("")
  const [codigoNovaAdm, setCodigoNovaAdm] = useState<number | "">("")

  // ==========================
  // CARREGAR ADMS
  // ==========================
  async function carregarAdms() {
    const res = await fetch("/api/adms/listar", { method: "POST" })
    const data = await res.json()

    if (Array.isArray(data)) {
      setAdms(data)
    } else if (Array.isArray(data.data)) {
      setAdms(data.data)
    } else {
      setAdms([])
    }
  }

  // ==========================
  // Criar ADMS
  // =========================
  async function criarAdm() {

    if (!nomeNovaAdm || !codigoNovaAdm) {
      toast.error("Informe nome e código")
      return
    }

    await fetch("/api/adms/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeNovaAdm,
        codigo: codigoNovaAdm
      })
    })

    toast.success("Administradora criada")

    setNomeNovaAdm("")
    setCodigoNovaAdm("")
    carregarAdms()
  }

  useEffect(() => {
    carregarAdms()
  }, [])

  // ==========================
  // SELECIONAR ADM
  // ==========================
  async function selecionarAdm(id: number) {

    setAdmIdSelecionada(id)

    // limpa imediatamente
    setEmails([])
    setAdmSelecionada(null)

    const adm = adms.find(a => a.id === id) || null

    if (!adm) return

    setAdmSelecionada(adm)
    setNovoNome(adm.nome)
    setNovoCodigo(adm.codigo)
    setNovoAtivo(adm.ativo)

    await carregarEmails(id)
  }
  // ==========================
  // CARREGAR EMAILS
  // ==========================
  async function carregarEmails(admId: number) {
    const res = await fetch("/api/adms/emails/listar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adm_id: admId })
    })

    const data = await res.json()

    if (Array.isArray(data)) {
      setEmails(data)
    } else if (Array.isArray(data.data)) {
      setEmails(data.data)
    } else {
      setEmails([])
    }
  }

  // ==========================
  // ATUALIZAR ADM
  // ==========================
  async function atualizarAdm() {
    if (!admSelecionada) return

    await fetch("/api/adms/atualizar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: admSelecionada.id,
        nome: novoNome,
        codigo: novoCodigo,
        ativo: novoAtivo
      })
    })

    toast.success("Administradora atualizada")
    carregarAdms()
  }

  // ==========================
  // EXCLUIR ADM
  // ==========================
  async function deletarAdm() {
    if (!admSelecionada) return

    await fetch("/api/adms/deletar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: admSelecionada.id })
    })

    toast.success("Administradora removida")

    setAdmSelecionada(null)
    setAdmIdSelecionada("")
    setEmails([])
    carregarAdms()
  }

  // ==========================
  // ADICIONAR EMAIL
  // ==========================
  async function adicionarEmail() {
    if (!admSelecionada) return
    if (!novoEmail) {
      toast.error("Informe o email")
      return
    }

    await fetch("/api/adms/emails/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adm_id: admSelecionada.id,
        email: novoEmail,
        tipo: novoTipo
      })
    })

    toast.success("Email adicionado")
    setNovoEmail("")
    setNovoTipo("")
    carregarEmails(admSelecionada.id)
  }

  // ==========================
  // REMOVER EMAIL
  // ==========================
  async function removerEmail(id: number) {
    await fetch("/api/adms/emails/deletar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })

    toast.success("Email removido")
    if (admSelecionada) carregarEmails(admSelecionada.id)
  }

  return (
    <div className="p-0 max-w-4xl mx-auto space-y-8">

      {/* SELECT ADM */}
      <div>

        <div className="space-y-2 flex flex-col items-center gap-2">

          <label className="block font-medium">
            Selecionar Administradora
          </label>

          <div className="flex flex-row gap-2 justify-center items-center">

            <select
              className="
        border p-2 rounded w-full
        bg-background text-foreground cursor-pointer
      "
              value={admIdSelecionada}
              onChange={(e) => selecionarAdm(Number(e.target.value))}
            >
              <option value="">Selecione</option>
              {adms.map(adm => (
                <option key={adm.id} value={adm.id}>
                  {adm.codigo} - {adm.nome}
                </option>
              ))}
            </select>

            {/* DIALOG CRIAR ADM */}
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="default" className="cursor-pointer">
                  Nova Adm +
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Administradora</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">

                  <Input
                    placeholder="Nome"
                    value={nomeNovaAdm}
                    onChange={(e) => setNomeNovaAdm(e.target.value)}
                  />

                  <Input
                    type="number"
                    placeholder="Código"
                    value={codigoNovaAdm}
                    onChange={(e) => setCodigoNovaAdm(Number(e.target.value))}
                  />

                </div>

                <DialogFooter>
                  <Button
                    onClick={async () => {
                      await criarAdm()
                    }}
                    className="cursor-pointer"
                  >
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>
      </div>

      {/* FORM EDITAR ADM */}
      {admSelecionada && (
        <div className="border p-6 rounded space-y-4">

          <h2 className="font-semibold text-lg">
            Editar Administradora
          </h2>

          <input
            className="border p-2 rounded w-full"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
          />

          <input
            type="number"
            className="border p-2 rounded w-full"
            value={novoCodigo}
            onChange={e => setNovoCodigo(Number(e.target.value))}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={novoAtivo}
              onChange={e => setNovoAtivo(e.target.checked)}
            />
            Ativo
          </label>

          <div className="flex gap-4">
            <button
              onClick={atualizarAdm}
              className="bg-black text-white px-4 py-2 rounded cursor-pointer"
            >
              Salvar
            </button>

            <button
              onClick={deletarAdm}
              className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Excluir
            </button>
          </div>

        </div>
      )}

      {/* EMAILS */}
      {admSelecionada && (
        <div className="border p-6 rounded space-y-4">

          <h2 className="font-semibold text-lg">
            Emails Vinculados
          </h2>

          {emails.map(email => (
            <div key={email.id} className="flex justify-between border p-2 rounded">
              <span>
                {email.email} {email.tipo && `(${email.tipo})`}
              </span>
              <button
                onClick={() => removerEmail(email.id)}
                className="text-red-600 cursor-pointer"
              >
                Remover
              </button>
            </div>
          ))}

          <div className="pt-4 border-t space-y-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Novo email"
              value={novoEmail}
              onChange={e => setNovoEmail(e.target.value)}
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Tipo (proposta, renovação...)"
              value={novoTipo}
              onChange={e => setNovoTipo(e.target.value)}
            />

            <button
              onClick={adicionarEmail}
              className="bg-black text-white px-4 py-2 rounded w-full cursor-pointer"
            >
              Adicionar Email
            </button>
          </div>

        </div>
      )}

    </div>
  )
}