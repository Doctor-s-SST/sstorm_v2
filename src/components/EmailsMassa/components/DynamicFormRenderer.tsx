import InformeTecnico from "@/components/EmailsMassa/forms/tecnico/InformeTecnico"
import TentativaContato from "@/components/EmailsMassa/forms/tecnico/TentativaContato"
import PropostaAdms from "@/components/EmailsMassa/forms/comercial/PropostaAdms"

export default function DynamicFormRenderer({ modelo, adm }: any) {

  switch(modelo.form){

    case "informe-tecnico":
      return <InformeTecnico modelo={modelo.form}/>

    case "tentativa-contato":
      return <TentativaContato modelo={modelo.form}/>

    case "proposta-adms":
      return <PropostaAdms modelo={modelo.form}/>

    default:
      return null
  }

}
