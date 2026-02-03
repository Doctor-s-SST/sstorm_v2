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

export function DownloadDocsPeriodo() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function buscarArquivos() {
    if (!dataInicio || !dataFim) {
      toast.error("Informe o período");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/drive-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list",
          dataInicio,
          dataFim,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao buscar arquivos");
        return;
      }

      setFiles(data);
    } catch {
      toast.error("Erro ao buscar arquivos");
    } finally {
      setLoading(false);
    }
  }

  async function baixarArquivo(file: DriveFile) {
    try {
      setDownloadingId(file.id);

      const res = await fetch("/api/drive-docs", {
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

      <Button
        onClick={buscarArquivos}
        disabled={loading}
        className="w-full cursor-pointer"
      >
        {loading ? "Buscando..." : "Buscar arquivos"}
        {!loading && <Search className="ml-2 h-4 w-4" />}
      </Button>

      <div className="space-y-3">
        {files.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum arquivo encontrado
          </p>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex justify-between items-center border rounded-lg p-3"
          >
            <div>
              <p className="font-medium text-sm">{file.name}</p>
            </div>

            <Button
              size="sm"
              disabled={downloadingId === file.id}
              onClick={() => baixarArquivo(file)}
              className="cursor-pointer"
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
