import InformeTecnico from "@/components/EmailsMassa/forms/tecnico/InformeTecnico"
import TentativaContato from "@/components/EmailsMassa/forms/tecnico/TentativaContato"

export default function DynamicFormRenderer({ modelo }: any) {

  switch(modelo.form){

    case "informe-tecnico":
      return <InformeTecnico modelo={modelo.form}/>

    case "tentativa-contato":
      return <TentativaContato modelo={modelo.form}/>

    default:
      return null
  }

}
