"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha mínima de 6 caracteres"),
});

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const loginPromise = async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao realizar login");
      }
    };

    toast.promise(loginPromise(), {
      loading: "Entrando...",
      success: () => {
        router.replace("/");
        return "Login realizado com sucesso!";
      },
      error: (err) => err.message || "Erro no login",
    });
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-screen h-screen">
      <div className="flex flex-row gap-10 items-center justify-center">
        <Image
          src="/email-assets/logo-cropped.svg"
          alt="Logo Doctor's SST"
          width={100}
          height={40}
          priority
          className="object-contain"
        />
        <div className="h-10 w-px bg-border" />
        <Image
          src="/email-assets/doctors-svg.svg"
          alt="Logo Doctor's SST"
          width={100}
          height={40}
          priority
          className="object-contain"
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-6 border p-6 rounded-lg bg-card shadow-sm"
        >
          <h1 className="text-2xl font-bold text-center">Entrar</h1>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
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

          <Button
            className="w-full cursor-pointer bg-accent hover:bg-chart-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-secondary underline hover:opacity-80 cursor-pointer"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
