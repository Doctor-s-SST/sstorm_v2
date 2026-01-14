import Image from "next/image";
import { useSidebar } from "./ui/sidebar";
import Link from "next/link";

export default function LogoDoctors() {
  const { state } = useSidebar();

  return (
    <Link href="/" className="flex items-center justify-center w-full">
        {state === "expanded" ? (
        <Image
          src="/email-assets/doctors-svg.svg"
          alt="Logo Doctor's SST"
          width={100}
          height={40}
          priority
          className="object-contain mt-9"
        />
      ) : (
        <Image
          src="/email-assets/doctors-fav.svg"
          alt="Logo Doctor's SST"
          width={32}
          height={32}
          priority
          className="object-contain"
        />
      )}
    </Link>
  );
}
