"use client"

import * as React from "react"
import {
  FileCog, FileArchive, CalendarCheck, IdCard, Mails
} from "lucide-react"

import { NavMain } from "@/components/sidebar-navUser/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/sidebar-navUser/nav-user"
import { useAuth } from "@/components/providers/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import LogoDoctors from "../LogoDoctors"



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
          url: "/aep/relatorio_psicossocial",
        },
        {
          title: "E-mail de Acesso - SOC",
          url: "/aep/email_acesso_soc",
        },
      ],
    },
    {
      title: "Docs Condomínio",
      url: "#",
      icon: FileArchive,
      isActive: true,
      items: [
        {
          title: "Baixar Docs Gerados",
          url: "/download_docs_cond",
        },
      ],
    },
    {
      title: "Contele",
      url: "#",
      icon: CalendarCheck,
      isActive: true,
      items: [
        {
          title: "Baixar Relatório Contele",
          url: "/download_relat_contele",
        },
      ],
    },
    {
      title: "Certificados",
      url: "#",
      icon: IdCard,
      isActive: true,
      items: [
        {
          title: "Gerar Certificado",
          url: "/gerar_certificado",
        },
      ],
    },
    {
      title: "E-mail em Massa",
      url: "#",
      icon: Mails,
      isActive: true,
      items: [
        {
          title: "Depto. Técnico",
          url: "/emails_massa/depto_tecnico",
        },
        // {
        //   title: "Depto. Comercial",
        //   url: "/emails_massa/depto_comercial",
        // },
      ],
    },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()

  //  NÃO renderiza sidebar se não estiver logado
  if (loading || !user) return null

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center h-16">
        <LogoDoctors />
      </SidebarHeader>

      <SidebarContent className="mt-5">
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>

      <SidebarFooter>
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


