export default function Loading() {
  return (
    <main className="ml-64 flex-1 min-h-screen bg-transparent p-12 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. SKELETON INPUT SIMPLE */}
        <div className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 h-20">
          {/* Ligne de texte simulée */}
          <div className="flex-1 h-6 bg-white/10 rounded-lg w-1/3" />
          {/* Bouton simulé */}
          <div className="w-11 h-11 bg-white/10 rounded-xl" />
        </div>

        {/* 2. SKELETON TABLEAU DE FLUX (3 CASES & 2 FLÈCHES) */}
        <div className="grid grid-cols-5 items-center gap-2">
          
          {/* Case 01 */}
          <div className="col-span-1 p-6 rounded-xl border border-white/5 bg-white/[0.02] h-32 flex flex-col justify-between">
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-2 bg-white/5 rounded w-full" />
              <div className="h-2 bg-white/5 rounded w-5/6" />
            </div>
          </div>

          {/* Flèche intermédiaire 1 */}
          <div className="mx-auto w-4 h-4 bg-white/5 rounded-full" />

          {/* Case 02 */}
          <div className="col-span-1 p-6 rounded-xl border border-white/5 bg-white/[0.03] h-32 flex flex-col justify-between">
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-2 bg-white/5 rounded w-full" />
              <div className="h-2 bg-white/5 rounded w-4/5" />
            </div>
          </div>

          {/* Flèche intermédiaire 2 */}
          <div className="mx-auto w-4 h-4 bg-white/5 rounded-full" />

          {/* Case 03 */}
          <div className="col-span-1 p-6 rounded-xl border border-white/5 bg-white/[0.02] h-32 flex flex-col justify-between">
            <div className="h-3 bg-white/10 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-2 bg-white/5 rounded w-full" />
              <div className="h-2 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        </div>

        {/* 3. SKELETON RÉSUMÉ / SYNTHÈSE */}
        <div className="pt-8 flex flex-col items-center">
          {/* Ligne verticale de connexion */}
          <div className="w-px h-12 bg-white/10 mb-4" />
          
          {/* Grand bloc de synthèse */}
          <div className="w-full p-10 rounded-[2rem] border border-white/5 bg-white/[0.01] h-40 flex flex-col justify-center items-center space-y-3">
            <div className="h-4 bg-white/10 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
          </div>
        </div>

      </div>
    </main>
  );
}