import { Card } from "@/components/ui/card"

export function DocumentoLogs({ logs }: any) {

 return (
  <Card className="p-4">

   <h3 className="font-semibold mb-3">
    Histórico
   </h3>

   <div className="space-y-2 text-sm">

    {logs.map((log: any) => (
     <div key={log.id}>

      <strong>{log.evento}</strong>
      <p className="text-muted-foreground">
       {log.data}
      </p>

     </div>
    ))}

   </div>

  </Card>
 )
}