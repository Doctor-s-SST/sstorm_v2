import { GeraCertificadoForm } from "@/components/GeraCertificadoForm";

export default function GeraCertificado() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">
        Gerar Certificados
      </h1>
      <GeraCertificadoForm />
    </div>
  );
}
