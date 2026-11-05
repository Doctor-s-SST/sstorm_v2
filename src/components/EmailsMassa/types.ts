export type TipoVariavel = "texto" | "lista"

export interface Variavel {
  nome: string
  label: string
  tipo: TipoVariavel
}

export interface ModeloEmail {
  id: number
  nome: string
  assunto: string
  html: string
  email_copia: string
  variaveis_json: Variavel[]
}