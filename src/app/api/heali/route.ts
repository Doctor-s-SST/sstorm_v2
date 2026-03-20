export async function POST(req: Request) {
  const { token } = await req.json()

  const res = await fetch(process.env.N8N_HEALI_DASHBOARD_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": process.env.N8N_INTERNAL_TOKEN!
    },
    body: JSON.stringify({ token })
  })

  const data = await res.json()

  return Response.json(data)
}