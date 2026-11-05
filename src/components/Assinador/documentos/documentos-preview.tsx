"use client"

import { useState, useRef, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js"

export function DocumentoPreview({
    url,
    modoAssinatura
}: {
    url: string
    modoAssinatura: boolean
}) {

    const [numPages, setNumPages] = useState<number>(0)
    const [page, setPage] = useState(1)
    const [width, setWidth] = useState(800)

    const [isDragging, setIsDragging] = useState(false)
    const [start, setStart] = useState<any>(null)
    const [end, setEnd] = useState<any>(null)

    const [showModal, setShowModal] = useState(false)
    const [certificados, setCertificados] = useState<any[]>([])
    const [certSelecionado, setCertSelecionado] = useState("")

    const startRef = useRef<any>(null)
    const endRef = useRef<any>(null)

    const containerRef = useRef<HTMLDivElement>(null)

    // responsivo
    useEffect(() => {
        function resize() {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth - 32)
            }
        }

        resize()
        window.addEventListener("resize", resize)

        return () => window.removeEventListener("resize", resize)
    }, [])

    // auto scroll
    useEffect(() => {
        if (modoAssinatura) {
            setTimeout(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth"
                })
            }, 300)
        }
    }, [modoAssinatura])

    function onLoadSuccess({ numPages }: any) {
        setNumPages(numPages)
    }

    function handleMouseDown(e: any, pagina: number) {
        const rect = e.currentTarget.getBoundingClientRect()

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const pos = { x, y, pagina }

        startRef.current = pos
        endRef.current = pos

        setStart(pos)
        setEnd(pos)
        setIsDragging(true)
    }

    function handleMouseMove(e: any, pagina: number) {
        if (!isDragging) return

        const rect = e.currentTarget.getBoundingClientRect()

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const pos = { x, y, pagina }

        endRef.current = pos
        setEnd(pos)
    }

    async function handleMouseUp() {

        const start = startRef.current
        const end = endRef.current

        setIsDragging(false)

        if (!start || !end) return

        // 🔥 trava os valores antes do React mexer
        setStart(start)
        setEnd(end)

        setShowModal(true)

        const certs = await fetch("/api/assinador/certificados")
            .then(res => res.json())
            .catch(() => [])

        let data = certs
        let lista: any[] = []

        if (Array.isArray(data)) {
            lista = data
        } else if (Array.isArray(data.data)) {
            lista = data.data
        } else if (data && typeof data === "object") {
            lista = [data]
        }

        setCertificados(lista)
    }

    function resetSelection() {
        setStart(null)
        setEnd(null)

        startRef.current = null
        endRef.current = null

        setCertSelecionado("")
        setShowModal(false)
    }

    async function confirmarAssinatura() {

        const start = startRef.current
        const end = endRef.current

        if (!start || !end) return

        const payload = {
            documento_id: url,
            pagina: start.pagina,
            x: Math.min(start.x, end.x),
            y: Math.min(start.y, end.y),
            largura: Math.abs(end.x - start.x),
            altura: Math.abs(end.y - start.y),
            certificado: certSelecionado
        }

        console.log("ENVIANDO:", payload)

        await fetch("/api/assinador/documentos/assinar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        resetSelection()
    }
    const selectionBox =
        start && end
            ? {
                left: Math.min(start.x, end.x),
                top: Math.min(start.y, end.y),
                width: Math.abs(end.x - start.x),
                height: Math.abs(end.y - start.y)
            }
            : null

    return (
        <div
            ref={containerRef}
            className="border rounded-lg p-4 bg-white 
h-[90vh] overflow-auto flex flex-col items-center"
        >

            {modoAssinatura && (
                <div className="mb-4 px-4 py-2 bg-black text-white rounded">
                    Clique e arraste para posicionar a assinatura
                </div>
            )}

            <Document
                file={`/api/assinador/documentos/preview/${url}`}
                onLoadSuccess={onLoadSuccess}
                loading={<p className="text-gray-800">Carregando PDF...</p>}
                error={<p className="text-red-600">Erro ao carregar documento</p>}
            >

                {modoAssinatura ? (

                    Array.from(new Array(numPages), (_, index) => (
                        <div key={index} className="mb-4 relative">

                            <Page
                                pageNumber={index + 1}
                                width={width}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="cursor-crosshair"
                                onMouseDown={(e) => handleMouseDown(e, index + 1)}
                                onMouseMove={(e) => handleMouseMove(e, index + 1)}
                                onMouseUp={handleMouseUp}
                            />

                            {/* 🔥 caixa visual */}
                            {isDragging && selectionBox && start?.pagina === index + 1 && (
                                <div
                                    className="absolute border-2 border-blue-500 bg-blue-300/30 pointer-events-none"
                                    style={selectionBox}
                                />
                            )}

                        </div>
                    ))

                ) : (

                    <Page
                        pageNumber={page}
                        width={width}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />

                )}

            </Document>

            {/* 🔥 MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white p-6 rounded-lg w-[400px] space-y-4">

                        <h2 className="text-lg font-bold">
                            Confirmar assinatura
                        </h2>

                        <div>
                            <label className="text-sm">Certificado</label>

                            <select
                                className="w-full border p-2 rounded"
                                value={certSelecionado}
                                onChange={(e) => setCertSelecionado(e.target.value)}
                            >
                                <option value="">Selecione</option>

                                {certificados.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nome}
                                    </option>
                                ))}

                            </select>
                        </div>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={resetSelection}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Cancelar
                            </button>

                            <button
                                disabled={!certSelecionado}
                                onClick={confirmarAssinatura}
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                                Confirmar
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {!modoAssinatura && (
                <div className="flex items-center gap-4 mt-4 text-gray-800">

                    <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Anterior
                    </button>

                    <span>
                        Página {page} de {numPages}
                    </span>

                    <button
                        disabled={page >= numPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Próxima
                    </button>

                </div>
            )}

        </div>
    )
}