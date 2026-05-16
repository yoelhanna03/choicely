"use client";

interface ResultIAProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;           // Ou le type précis de ta réponse IA
  onBack: () => void;  // Ajoute cette ligne
}

export default function ResultIA({ data, onBack }: ResultIAProps) {
  return (
    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-xl w-full max-w-xl text-white">
      <h2 className="text-xl font-semibold mb-4 text-white/90">Analyse de l&apos;IA</h2>
      
      <div className="prose prose-invert max-w-none mb-8 text-white/80">
        {/* Affichage du résultat */}
        <p className="whitespace-pre-wrap">{data}</p>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition"
      >
        Retour au tableau de bord
      </button>
    </div>
  );
}