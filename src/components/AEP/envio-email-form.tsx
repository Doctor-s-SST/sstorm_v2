"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2, MailOpen, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

/* =========================
   Types
========================= */
type Destinatario = {
  email: string;
  empresa: string;
  link: string;
};

export function EnvioEmailForm() {
  const { user, loading } = useAuth();

  const [emailsLidos, setEmailsLidos] = useState<Destinatario[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  /* =========================
     Guards
  ========================= */
  if (loading) return <p>Carregando...</p>;
  if (!user) return <p>Não autenticado</p>;

  const authUser = user;

  /* =========================
     Ler e-mails (n8n)
  ========================= */
  async function handleLerEmails() {
    if (!dataInicio || !dataFim) {
      toast.error("Informe a data de início e fim");
      return;
    }

    try {
      setIsLoadingEmails(true);

      const res = await fetch("https://doctors-n8n-editor.avrhe3.easypanel.host/webhook/ler-email-quest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": "fgy9c3a7b9a1e4c8db2h43hdj83a9d7",
        },
        body: JSON.stringify({
          dataInicio,
          dataFim,
        }),
      });

      const response = await res.json();

      if (!res.ok) {
        toast.error(response.message || "Erro ao buscar e-mails");
        return;
      }

      const emails: Destinatario[] = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : [];

      if (emails.length === 0) {
        toast.error("Nenhum e-mail válido retornado");
        return;
      }

      setEmailsLidos(emails);

      toast.success("E-mails carregados com sucesso");
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast.error("Tempo limite excedido. Tente um período menor.");
      } else {
        toast.error("Erro ao buscar e-mails");
      }
    } finally {
      setIsLoadingEmails(false);
    }
  }

  /* =========================
     Adicionar manualmente
  ========================= */
  function adicionarManual() {
    setEmailsLidos((prev) => [...prev, { email: "", empresa: "", link: "" }]);
  }

  /* =========================
     Editar item
  ========================= */
  function atualizarItem(
    index: number,
    campo: keyof Destinatario,
    valor: string
  ) {
    setEmailsLidos((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item))
    );
  }

  /* =========================
     Remover item
  ========================= */
  function removerItem(index: number) {
    setEmailsLidos((prev) => prev.filter((_, i) => i !== index));
  }

  /* =========================
     Enviar e-mails
  ========================= */
  async function handleEnviarEmails() {
    if (emailsLidos.length === 0) {
      toast.error("Nenhum destinatário para envio");
      return;
    }

    const invalido = emailsLidos.findIndex(
      (item) =>
        !item.email.trim() ||
        !item.empresa.trim() ||
        !item.link.trim()
    );

    if (invalido !== -1) {
      toast.error(
        `Preencha todos os campos (email, empresa e link) no destinatário #${invalido + 1}`
      );
      return;
    }

    const emailInvalido = emailsLidos.findIndex(
      (item) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)
    );

    if (emailInvalido !== -1) {
      toast.error(
        `E-mail inválido no destinatário #${emailInvalido + 1}`
      );
      return;
    }

    const confirmar = confirm(
      `Deseja enviar ${emailsLidos.length} e-mails?`
    );

    if (!confirmar) return;

    setIsSending(true);

    const payload = {
      remetente: {
        nome: authUser.first_name,
        sobrenome: authUser.last_name,
        cargo: authUser.cargo,
        email: authUser.email,
      },
      destinatarios: emailsLidos,
    };

    try {
      const res = await fetch("/api/envio-email-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success("E-mails enviados com sucesso!");
      setEmailsLidos([]);
    } catch {
      toast.error("Erro ao enviar e-mails");
    } finally {
      setIsSending(false);
    }
  }


  /* =========================
     UI (RETORNO CORRETO)
  ========================= */
  return (
    <div className="max-w-3xl w-full space-y-6 border p-4 sm:p-6 rounded-lg bg-card shadow-sm overflow-x-hidden">
      {/* Datas */}
      <h3 className="text-center mt-0 mb-3 font-medium">Selecione o Período dos E-mails</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="w-full max-w-full min-w-0"
        />

        <Input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="w-full max-w-full min-w-0"
        />
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleLerEmails}
          disabled={isLoadingEmails}
          className="w-full cursor-pointer"
        >
          {isLoadingEmails ? "Lendo e-mails..." : "Ler e-mails"}
          {!isLoadingEmails && <MailOpen className="ml-2 h-4 w-4" />}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={adicionarManual}
          className="w-full cursor-pointer dark:hover:bg-accent"
        >
          Adicionar manualmente
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {emailsLidos.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center border rounded-md p-3"
          >
            <Input
              placeholder="Email"
              value={item.email}
              onChange={(e) => atualizarItem(index, "email", e.target.value)}
            />
            <Input
              placeholder="Empresa"
              value={item.empresa}
              onChange={(e) => atualizarItem(index, "empresa", e.target.value)}
            />
            <Input
              placeholder="Link"
              value={item.link}
              onChange={(e) => atualizarItem(index, "link", e.target.value)}
            />
            <Button
              variant="destructive"
              onClick={() => removerItem(index)}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {emailsLidos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum destinatário carregado
          </p>
        )}
      </div>

      {/* Enviar */}
      <Button
        onClick={handleEnviarEmails}
        disabled={isSending}
        className="w-full cursor-pointer"
      >
        {isSending ? "Enviando..." : "Enviar e-mails"}
        {!isSending && <Send className="ml-2 h-4 w-4" />}
      </Button>

      {!isSending && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Assunto, corpo e CC são aplicados automaticamente
        </p>
      )}
    </div>
  );
}
