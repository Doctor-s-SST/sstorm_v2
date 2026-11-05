import { ModelosEmail } from "@/components/EmailsMassa/components/ModelosEmail"

export default function Administradoras() {
  return (
    <div className="w-full px-4 md:px-8 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Criar Modelos de E-mail
      </h1>
      <ModelosEmail />
    </div>
  );
}
