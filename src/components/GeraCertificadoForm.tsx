"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function GeraCertificadoForm() {

    const [funcionarios, setFuncionarios] = useState("");
    const [empresas, setEmpresas] = useState("");

    const [dataTreinamento, setDataTreinamento] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFim, setHoraFim] = useState("");
    const [empresaTreinamento, setEmpresaTreinamento] = useState("");
    const [endereco, setEndereco] = useState("");

    const [loading, setLoading] = useState(false);

    const treinamentos = [
        { label: "NR-06", payload: "certificado-nr06" },
        { label: "NR-18 Básico de Segurança no Trabalho", payload: "certificado-nr18-basico" },
        { label: "NR-35", payload: "certificado-nr35" },
    ];

    const [treinamento, setTreinamento] = useState("");


    function sanitizarNome(nome: string) {
        return nome
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\\\/:*?"<>|#@!$%\[\]\(\)\{\}]/g, "")
            .replace(/\s+/g, " ")
            .replace(/[\r\n]+/g, "")
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    function parseLista(texto: string) {
        return Array.from(
            new Set(
                texto
                    .split("\n")
                    .map(l => sanitizarNome(l))
                    .filter(Boolean)
            )
        );
    }

    const listaFuncionarios = useMemo(
        () => parseLista(funcionarios),
        [funcionarios]
    );

    const listaEmpresas = useMemo(
        () => parseLista(empresas),
        [empresas]
    );

    const totalCertificados =
        listaFuncionarios.length + listaEmpresas.length;

    function validarHorario() {
        if (!horaInicio || !horaFim) return false;
        return horaFim > horaInicio;
    }

    function camposInvalidos() {
        return (
            listaFuncionarios.length === 0 ||
            !treinamento ||
            !dataTreinamento ||
            !horaInicio ||
            !horaFim ||
            !empresaTreinamento.trim() ||
            !endereco.trim() ||
            !validarHorario()
        );
    }


    async function gerarCertificados() {

        if (camposInvalidos()) {
            toast.error("Preencha todos os campos obrigatórios corretamente");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch("/api/certificados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    treinamento,
                    funcionarios: listaFuncionarios,
                    empresas: listaEmpresas,
                    dataTreinamento,
                    horaInicio,
                    horaFim,
                    empresaTreinamento: sanitizarNome(empresaTreinamento),
                    endereco,
                }),
            });

            if (!res.ok) {
                toast.error("Erro ao gerar certificados");
                return;
            }

            const data = await res.json();

            if (data?.downloadUrl) {

                window.open(data.downloadUrl, "_blank");

                toast.success(`${totalCertificados} certificados gerados`);

            } else {

                toast.error("Arquivo não retornado");

            }

        } catch {
            toast.error("Erro na requisição");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md w-full space-y-4 border p-6 rounded-xl bg-card shadow-sm">

            <h3 className="text-center font-medium">
                Gerar Certificados de Treinamento
            </h3>

            <p className="text-xs text-muted-foreground text-center">
                Campos com * são obrigatórios
            </p>

            <div>
                <p className="text-sm mb-1">Treinamento *</p>
                <select
                    value={treinamento}
                    onChange={(e) => setTreinamento(e.target.value)}
                    className="w-full border rounded-md p-2 bg-background"
                >
                    <option value="">Selecione o treinamento</option>

                    {treinamentos.map((t) => (
                        <option key={t.payload} value={t.payload}>
                            {t.label}
                        </option>
                    ))}
                </select>

            </div>


            <div>
                <p className="text-sm mb-1">Funcionários *</p>
                <textarea
                    className="w-full border rounded-md p-2"
                    rows={5}
                    value={funcionarios}
                    onChange={(e) => setFuncionarios(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    {listaFuncionarios.length} válidos
                </p>
            </div>

            <div>
                <p className="text-sm mb-1">Empresas (opcional)</p>
                <textarea
                    className="w-full border rounded-md p-2"
                    rows={5}
                    value={empresas}
                    onChange={(e) => setEmpresas(e.target.value)}
                />
            </div>

            <Input type="date" value={dataTreinamento} onChange={(e) => setDataTreinamento(e.target.value)} />
            <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
            <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />

            <Input placeholder="Empresa do Treinamento *" value={empresaTreinamento} onChange={(e) => setEmpresaTreinamento(e.target.value)} />
            <Input placeholder="Endereço *" value={endereco} onChange={(e) => setEndereco(e.target.value)} />

            <div className="text-sm text-center font-medium">
                Total de certificados: {totalCertificados}
            </div>

            <Button
                onClick={gerarCertificados}
                disabled={loading || camposInvalidos()}
                className="w-full cursor-pointer"
            >
                {loading
                    ? <Loader2 className="animate-spin h-4 w-4" />
                    : "Gerar Certificados"}
            </Button>

        </div>
    );
}
