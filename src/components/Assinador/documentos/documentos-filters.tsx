"use client"

import { Input } from "@/components/ui/input"

export function DocumentosFilters() {

 return (
  <div className="flex gap-4 mb-6">

   <Input
    placeholder="Buscar documento..."
    className="max-w-sm"
   />

  </div>
 )
}