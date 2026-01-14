"use client";

import {
  LogOut,
  CircleUserRound,
  ChevronsUpDown,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { ProfileDialog } from "./ProfileDialog";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    cargo: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <SidebarMenuButton size="lg" className="hover:bg-gray-300 dark:hover:bg-gray-800">
                <div className="grid flex-1 text-left text-sm">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
                className="group focus:bg-primary/70 hover:bg-primary/70 hover:text-white"
              >
                <CircleUserRound className="mr-2 h-4 w-4 group-hover:text-white" />
                <ProfileDialog />
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer group data-[state=open]:bg-secondary/80 focus:bg-secondary/80 focus:text-white">
                  <Laptop className="mr-2 h-4 w-4 group-hover:text-white dark:group-hover:text-white" />
                  Tema
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer group focus:bg-secondary/80 focus:text-white">
                    <Sun className="mr-2 h-4 w-4 group-hover:text-white" />
                    Claro
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer group focus:bg-secondary/80 focus:text-white">
                    <Moon className="mr-2 h-4 w-4 group-hover:text-white" />
                    Escuro
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer group focus:bg-secondary/80 focus:text-white">
                    <Laptop className="mr-2 h-4 w-4 group-hover:text-white" />
                    Sistema
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive font-semibold cursor-pointer group focus:bg-destructive/80 focus:text-white"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4 group-hover:text-white" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
