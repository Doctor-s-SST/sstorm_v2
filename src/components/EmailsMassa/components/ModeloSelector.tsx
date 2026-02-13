import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ModeloSelector({ modelos, onChange }: any) {

  return (
    <Select onValueChange={(id)=>{
      const modelo = modelos.find((m:any)=>m.id===id)
      onChange(modelo)
    }}>
      <SelectTrigger className="cursor-pointer">
        <SelectValue placeholder="Selecione o modelo" className="cursor-pointer"/>
      </SelectTrigger>

      <SelectContent>
        {modelos.map((m:any)=>(
          <SelectItem key={m.id} value={m.id} className="cursor-pointer">
            {m.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
