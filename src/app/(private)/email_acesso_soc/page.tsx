import { EnvioEmailForm } from "@/components/envio-email-form";

export default function EnvioEmailMassa() {
  

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">
        Envio de Acesso ao Questionário SOC
      </h1>
      <EnvioEmailForm />
    </div>
  );
}
