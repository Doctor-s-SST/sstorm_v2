import { DownloadDocsPeriodo } from "@/components/DownloadDocsPeriodo";

export default function DowloadDocsCond() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">
        Geração de Documentos de Condomínio
      </h1>
      <DownloadDocsPeriodo />
    </div>
  );
}
