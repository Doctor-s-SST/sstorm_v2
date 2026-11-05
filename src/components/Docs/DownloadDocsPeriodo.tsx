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
  // const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [relatId, setRelatId] = useState("");

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

  // function fileToBase64(file: File): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();

  //     reader.readAsDataURL(file);

  //     reader.onload = () => {
  //       const result = reader.result as string;

  //       // remove prefixo "data:application/pdf;base64,"
  //       const base64 = result.split(",")[1];

  //       resolve(base64);
  //     };

  //     reader.onerror = reject;
  //   });
  // }

  // async function enviarPDF() {
  //   if (!pdfFile) {
  //     toast.error("Selecione um PDF");
  //     return;
  //   }

  //   try {
  //     setUploading(true);

  //     const base64 = await fileToBase64(pdfFile);

  //     const res = await fetch("/api/upload-relat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         fileName: pdfFile.name,
  //         mimeType: pdfFile.type,
  //         fileBase64: base64,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       toast.error(data.error || "Erro ao enviar PDF");
  //       return;
  //     }

  //     toast.success("PDF enviado com sucesso");
  //     setPdfFile(null);

  //   } catch {
  //     toast.error("Erro ao enviar PDF");
  //   } finally {
  //     setUploading(false);
  //   }
  // }

  async function enviarPDF() {
  if (!relatId) {
    toast.error("Informe o ID");
    return;
  }

  try {
    setUploading(true);

    const res = await fetch("/api/upload-relat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: relatId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erro ao enviar");
      return;
    }

    toast.success("Processamento iniciado 🚀");

  } catch {
    toast.error("Erro ao enviar");
  } finally {
    setUploading(false);
  }
}

  return (
    <div className="max-w-md w-full space-y-6 border p-6 rounded-xl bg-card shadow-sm">
      <h3 className="text-center mt-0 mb-3 font-medium">Selecione o Período das Visitas</h3>
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

      <div className="border-t pt-4 space-y-3">
        <p className="text-sm font-medium">Importar PDF para processamento</p>

        <Input
          type="text"
          placeholder="ID do relatório / arquivo"
          value={relatId}
          onChange={(e) => setRelatId(e.target.value)}
        />

        <Button
          onClick={enviarPDF}
          disabled={uploading}
          className="w-full cursor-pointer"
        >
          {uploading ? "Enviando..." : "Enviar PDF"}
        </Button>
      </div>

      <div className="space-y-3">
        {files.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum arquivo encontrado
          </p>
        )}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 border rounded-lg p-3"
          >
            {/* TEXTO */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm break-words">
                {file.name}
              </p>
            </div>

            {/* BOTÃO */}
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
