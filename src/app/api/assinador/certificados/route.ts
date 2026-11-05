import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {

  const res = await fetch(process.env.N8N_CERTIFICADOS_LISTAR_URL!, {
    headers: {
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!
    }
  })

  const data = await res.json()

  return NextResponse.json(data)
}

export async function POST(req: Request) {

  const formData = await req.formData()

  const response = await fetch(process.env.N8N_CERTIFICADOS_CRIAR_URL!, {
    method: "POST",
    headers: {
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!
    },
    body: formData
  })

  return new NextResponse(await response.text(), {
    status: response.status
  })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()

  const res = await fetch(process.env.N8N_CERTIFICADOS_DELETAR_URL!, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!
    },
    body: JSON.stringify({ id })
  })

  return new NextResponse(await res.text(), {
    status: res.status
  })
}