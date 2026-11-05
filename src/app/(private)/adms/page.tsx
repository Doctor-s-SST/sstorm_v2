import { AdmCrud } from "@/components/Adms/AdmCrud"

export default function Administradoras() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">
        Administradoras de Condomínio
      </h1>
      <AdmCrud />
    </div>
  );
}
