"use client"

import TemplateEnvioDepartamento from "@/components/EmailsMassa/components/TemplateEnvioDepartamento"

export default function EmailsTecnico() {

  return (
    <div className="w-full px-4 md:px-8 py-6">
      <TemplateEnvioDepartamento
        departamento="tecnico"
        titulo="E-mails em Massa - Depto. Técnico"
      />
    </div>
  )
}