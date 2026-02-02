"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, FileArchive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Documento = {
  id: string;
  name: string;
  modifiedTime: string;
  size: string;
};

export default function DownloadDocsPeriodo() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [docs, setDocs] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);

  async function buscarArquivos() {
    if (!dataInicio || !dataFim) {
      toast.error("Informe a data de início e fim");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/listar-docs-periodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataInicio, dataFim }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Erro ao buscar arquivos");
        return;
      }

      setDocs(json);
      toast.success(`${json.length} arquivo(s) encontrado(s)`);
    } catch {
      toast.error("Erro ao buscar arquivos");
    } finally {
      setLoading(false);
    }
  }

  async function baixarArquivo(id: string, name: string) {
    try {
      const res = await fetch(`/api/download-doc/${id}`);

      if (!res.ok) {
        toast.error("Erro ao baixar arquivo");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("Erro no download");
    }
  }

  return (
    <div className="max-w-3xl w-full space-y-6 border p-6 rounded-lg bg-card shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      <Button onClick={buscarArquivos} disabled={loading} className="w-full">
        {loading ? "Buscando..." : "Buscar documentos"}
      </Button>

      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between border p-3 rounded-md"
          >
            <div className="flex items-center gap-3">
              <FileArchive className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  Modificado em:{" "}
                  {new Date(doc.modifiedTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => baixarArquivo(doc.id, doc.name)}
            >
              <Download className="h-4 w-4 mr-1" />
              Baixar
            </Button>
          </div>
        ))}

        {docs.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">
            Nenhum documento encontrado
          </p>
        )}
      </div>
    </div>
  );
}
