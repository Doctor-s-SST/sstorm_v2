"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { FileDown, FileUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// 1. Alterado para aceitar 1 ou mais arquivos
const formSchema = z.object({
  texto: z.string().min(2, "O texto é obrigatório."),
  arquivo: z.any().refine((files) => files?.length >= 1, "Selecione ao menos um arquivo Excel."),
});

type DownloadItem = { url: string; filename: string };

export function UploadForm() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { texto: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDownloads([]);
    setIsProcessing(true);

    const arquivos = Array.from(values.arquivo as FileList);

    const processarArquivos = async () => {
      const resultados: DownloadItem[] = [];

      for (const arquivo of arquivos) {
        const formData = new FormData();
        formData.append("texto", values.texto);
        formData.append("data", arquivo);

        const response = await fetch("/api/upload-pdf", { method: "POST", body: formData });
        
        if (!response.ok) throw new Error(`Erro ao processar ${arquivo.name}`);

        const rawHeaderFilename = response.headers.get('filename') || "relatorio.pdf";
        const filename = decodeURIComponent(rawHeaderFilename);
        const buffer = await response.arrayBuffer();
        const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
        
        resultados.push({
          url: window.URL.createObjectURL(pdfBlob),
          filename: filename
        });
      }
      
      setDownloads(resultados);
      setIsProcessing(false);
      return `${resultados.length} arquivos prontos!`;
    };

    toast.promise(processarArquivos(), {
      loading: 'Processando arquivos...',
      success: (msg) => msg,
      error: 'Erro no processamento.',
    });
  }

  return (
    <div className="space-y-4 max-w-md w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border p-6 rounded-lg bg-card shadow-sm">
          <FormField
            control={form.control}
            name="texto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês/Ano de emissão</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ago/2025" {...field} disabled={isProcessing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arquivo"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <FormItem>
                <FormLabel>Arquivo Excel do SOC (Selecione um ou vários)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple // 3. IMPORTANTE: Permite selecionar vários no explorador de arquivos
                    accept=".xlsx, .xls"
                    disabled={isProcessing}
                    onChange={(e) => onChange(e.target.files)}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full cursor-pointer" disabled={isProcessing}>
            {isProcessing ? "Processando Massa..." : "Gerar PDFs"}
            {!isProcessing && <FileUp className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </Form>

      {/* 4. Lista de botões para download */}
      {downloads.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> 
            Arquivos Gerados:
          </p>
          {downloads.map((dl, index) => (
            <div key={index} className="p-3 border rounded-md bg-accent/70 flex items-center justify-between gap-4">
              <span className="text-xs truncate font-medium flex-1">{dl.filename}</span>
              <Button asChild size="sm" variant="outline" className="h-8 hover:bg-accent/90">
                <a href={dl.url} download={dl.filename}>
                  <FileDown className="h-3 w-3 mr-1" />
                  Baixar
                </a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}