import Image from "next/image";
import { useSidebar } from "./ui/sidebar";
import Link from "next/link";

export default function SidebarLogo() {
  const { state } = useSidebar();

  return (
    <Link href="/" className="flex items-center justify-center w-full">
      <Image
        src="/email-assets/logo-doctors.png"
        alt="Logo Doctor's SST"
        width={140}
        height={40}
        priority
        className="object-contain"
      />
    </Link>
  );
}
