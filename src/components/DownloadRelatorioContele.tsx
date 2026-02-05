"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, Search, Loader2 } from "lucide-react";

type DriveFile = {
  id: string;
  name: string;
};

const pastas = [
  "Todos",
  "Felipe Mathias dos Santos Silva",
  "João Paulo dos Santos",
  "Liliani Gonçalves Lima Souza",
  "Marcos Roberto Barbosa Junior",
  "Nizio José Cabral Filho",
];

export function DownloadRelatorioContele() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pasta, setPasta] = useState("Todos");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [buscou, setBuscou] = useState(false);


  async function buscarArquivos() {
    if (!dataInicio || !dataFim) {
      toast.error("Informe o período");
      return;
    }

    try {
      setLoading(true);
      setBuscou(true); // 👈 adiciona aqui

      const res = await fetch("/api/drive-relat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list",
          dataInicio,
          dataFim,
          folderName: pasta !== "Todos" ? pasta : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao buscar arquivos");
        return;
      }

      if (!Array.isArray(data)) {
        setFiles([]);
        return;
      }

      const arquivosValidos = data.filter(
        (f: any) =>
          f &&
          typeof f.id === "string" &&
          f.id.trim() !== "" &&
          typeof f.name === "string" &&
          f.name.trim() !== ""
      );

      setFiles(arquivosValidos);

    } catch {
      toast.error("Erro ao buscar arquivos");
    } finally {
      setLoading(false);
    }
  }

  async function baixarArquivo(file: DriveFile) {
    try {
      setDownloadingId(file.id);

      const res = await fetch("/api/drive-relat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "download",
          fileId: file.id,
        }),
      });

      if (!res.ok) {
        toast.error("Erro ao baixar arquivo");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar arquivo");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="max-w-md w-full space-y-6 border p-6 rounded-xl bg-card shadow-sm">
      <h3 className="text-center mt-0 mb-3 font-medium">
        Selecione o Período das Visitas
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="cursor-pointer"
        />
        <Input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="cursor-pointer"
        />
      </div>
      
      {/* SELECT PASTA */}
      <p className="text-left ml-1 mb-1 font-small">
        Filtro por Técnico:
      </p>
      <select
        value={pasta}
        onChange={(e) => setPasta(e.target.value)}
        className="w-full border rounded-md p-2 bg-background"
      >
        {pastas.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <Button
        onClick={buscarArquivos}
        disabled={loading}
        className="w-full cursor-pointer"
      >
        {loading ? "Buscando..." : "Buscar arquivos"}
        {!loading && <Search className="ml-2 h-4 w-4" />}
      </Button>

      <div className="space-y-3">
        {files
          .filter((f) => f.id && f.name)
          .map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 border rounded-lg p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm break-words">
                  {file.name}
                </p>
              </div>

              <Button
                size="sm"
                disabled={downloadingId === file.id}
                onClick={() => baixarArquivo(file)}
                className="cursor-pointer shrink-0"
              >
                {downloadingId === file.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
