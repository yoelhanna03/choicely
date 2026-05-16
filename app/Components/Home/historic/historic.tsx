import { db } from '@/lib/db'
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Clock, History } from "lucide-react"; // Pour ajouter une touche visuelle
import { Separator } from "@/components/ui/separator";

export default async function Historic() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/');
  }

  const propositions = await db.proposition.findMany({
    where: {
      for_email: session.user.email,
    },
    select: {
      ia_prop: true,
      date: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  if (propositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 text-white/30 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
        <History className="h-10 w-10 mb-4 opacity-20" />
        <p className="italic">Aucun historique disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <History className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Mon Historique</h2>
          <p className="text-sm text-white/40">Retrouve tes précédentes propositions générées.</p>
        </div>
      </div>
      <Separator className="bg-linear-to-r from-indigo-500 to-cyan-500 " />
      {/* --- LISTE --- */}
      <div className="grid gap-4">
        {propositions.map((p, i) => (
          <div 
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-2xl hover:shadow-sky-500/5"
          >
            {/* Petit Glow au survol (discret) */}
            <div className="absolute -inset-px bg-linear-to-r from-sky-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex flex-col gap-3">
              <p className="text-[15px] text-white/80 leading-relaxed whitespace-pre-line group-hover:text-white transition-colors">
                {p.ia_prop}
              </p>
              
              <div className="flex items-center gap-2 text-xs font-medium text-white/30 group-hover:text-white/50 transition-colors">
                <Clock className="h-3 w-3" />
                <span>
                  Le {p.date.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="opacity-30">•</span>
                <span>
                  {p.date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}