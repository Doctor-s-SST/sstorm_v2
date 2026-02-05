import { DownloadRelatorioContele } from "@/components/DownloadRelatorioContele";

export default function DownloadRelatContele() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">
        Baixar Relatório Contele
      </h1>
      <DownloadRelatorioContele />
    </div>
  );
}
