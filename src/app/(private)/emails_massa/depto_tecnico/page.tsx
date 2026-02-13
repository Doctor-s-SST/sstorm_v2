"use client"

import { useState } from "react"
import { MODELOS_TECNICO } from "@/components/EmailsMassa/config/depto_tecnico"
import ModeloSelector from "@/components/EmailsMassa/components/ModeloSelector"
import DynamicFormRenderer from "@/components/EmailsMassa/components/DynamicFormRenderer"

export default function Page() {

  const [modelo, setModelo] = useState<any>(null)

  return (
    <div className="flex flex-col items-center justify-center p-8">

      <div className="flex flex-col items-center justify-center pt-8 pb-3">
        <h1 className="text-3xl font-bold mb-3">
          E-mails em Massa - Depto. Técnico
        </h1>

        <h4 className="mb-2">Modelo de E-mail:</h4>
        <ModeloSelector
          modelos={MODELOS_TECNICO}
          onChange={setModelo}
        />
      </div>

      {modelo && (
        <DynamicFormRenderer modelo={modelo} />
      )}

    </div>
  )
}
