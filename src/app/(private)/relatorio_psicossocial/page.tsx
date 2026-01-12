import { UploadForm } from "@/components/upload-form";

export default function RelatorioPsicossocial() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Gerar Relatório Psicossocial</h1>
      <UploadForm />
    </div>
  );
}
