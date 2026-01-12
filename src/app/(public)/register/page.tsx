"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  first_name: z.string().min(2, "Informe seu nome"),
  last_name: z.string().min(2, "Informe seu sobrenome"),
  email: z.string().email("Email inválido"),
  cargo: z.string().min(2, "Informe seu cargo"),
  password: z.string().min(6, "Senha mínima de 6 caracteres"),
})

export default function RegisterPage() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      cargo: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const registerPromise = async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (res.status === 409) {
        const data = await res.json()
        throw new Error(data.error)
      }

      if (!res.ok) throw new Error("Erro no cadastro")
    }

    toast.promise(registerPromise(), {
      loading: "Criando conta...",
      success: () => {
        setTimeout(() => {
          router.push("/login")
        }, 2000)

        return "Cadastro realizado com sucesso! Redirecionando para tela de login"
      },
      error: (err) => err.message || "Erro ao cadastrar usuário",
    })
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-muted/10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-6 border p-6 rounded-lg bg-card shadow-sm"
        >
          <h1 className="text-2xl font-bold text-center">Cadastro</h1>

          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrenome (igual na assinatura do e-mail)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail corporativo</FormLabel>
                <FormControl>
                  <Input placeholder="nome@doctorspraiagrande.com.br" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo (igual na assinatura do e-mail)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Auxiliar Administrativo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full cursor-pointer" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Criando..." : "Cadastrar"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-primary underline hover:opacity-80 cursor-pointer"
            >
              Faça Login
            </button>
          </div>

        </form>
      </Form>
    </div>
  )
}
