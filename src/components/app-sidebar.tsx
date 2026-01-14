"use client"

import * as React from "react"
import {
    FileCog,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/components/providers/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import SidebarLogoDoctors from "./SidebarLogoDoctors"
 


const data = {
    navMain: [
    {
      title: "AEP",
      url: "#",
      icon: FileCog,
      isActive: true,
      items: [
        {
          title: "Gerar Relatório Psicossocial",
          url: "/relatorio_psicossocial",
        },
        {
          title: "E-mail de Acesso - SOC",
          url: "/email_acesso_soc",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  // ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()

  //  NÃO renderiza sidebar se não estiver logado
  if (loading || !user) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center h-16">
         <SidebarLogoDoctors />
      </SidebarHeader>

      <SidebarContent className="mt-5">
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>

      <SidebarFooter >
        <NavUser
          user={{
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            cargo: user.cargo,
          }}
          
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}


