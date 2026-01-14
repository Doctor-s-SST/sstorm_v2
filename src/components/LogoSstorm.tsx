import Image from "next/image";
import Link from "next/link";

export default function LogoStorm() {

  return (
    <Link href="/" className="flex items-center justify-center w-full">
                <Image
          src="/email-assets/logo-cropped.svg"
          alt="Logo SSTORM"
          width={180}
          height={40}
          priority
          className="object-contain"
        />
    </Link>
  );
}
