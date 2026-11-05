"use client"

import TemplateEnvioDepartamento from "@/components/EmailsMassa/components/TemplateEnvioDepartamento"

export default function EmailsComercial() {

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-6">
      <TemplateEnvioDepartamento
        departamento="comercial"
        titulo="E-mails em Massa - Depto. Comercial"
      />
    </div>
  )
}