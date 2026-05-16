import Link from "next/link";
import { ArrowLeft } from "lucide-react"; // L'icône de flèche

export default function BackHomeButton() {
  return (
    <Link 
      href="/" 
      className="group flex items-center gap-2 w-fit px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:shadow-white/5 mb-8"
    >
      {/* L'icône avec un effet de translation au survol */}
      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
      
      <span>Retourner à l&apos;accueil</span>
    </Link>
  );
}