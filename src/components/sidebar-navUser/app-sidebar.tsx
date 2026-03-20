"use client"

import * as React from "react"
import {
  Signature, FileCog, FileArchive, CalendarCheck, IdCard, Mails, Building2, Brain 
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
      isActive: false,
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
      isActive: false,
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
      isActive: false,
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
      isActive: false,
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
      isActive: false,
      items: [
        {
          title: "Modelos de E-mail",
          url: "/emails_massa/modelos_email",
        },
        {
          title: "Depto. Técnico",
          url: "/emails_massa/depto_tecnico",
        },
        {
          title: "Depto. Comercial",
          url: "/emails_massa/depto_comercial",
        },
      ],
    },
    {
      title: "Administradoras",
      url: "#",
      icon: Building2,
      isActive: false,
      items: [
        {
          title: "Gerenciar Administradoras",
          url: "/adms",
        },
      ],
    },

    {
      title: "Assinar Documentos",
      url: "#",
      icon: Signature,
      isActive: false,
      items: [
        {
          title: "Dashboard",
          url: "/assinador/dashboard",
        },
        {
          title: "Documentos",
          url: "/assinador/documentos",
        },
        {
          title: "Upload de Documentos",
          url: "/assinador/upload",
        },
        {
          title: "Gerenciar Certificados",
          url: "/assinador/certificados",
        },
      ],
    },
    {
      title: "Heali",
      url: "#",
      icon: Brain,
      isActive: false,
      items: [
        {
          title: "Dashboard",
          url: "/heali/dashboard",
        },
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


