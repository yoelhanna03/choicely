"use client";

interface ResultIAProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;           // Réponse complète de l'API (result, summary, score)
  onBack: () => void;  // Callback pour retourner au dashboard
}

export default function ResultIA({ data, onBack }: ResultIAProps) {
  // Gestion du cas où data est juste une string (legacy)
  const isString = typeof data === 'string';
  const result = isString ? data : data?.result;
  const score = isString ? null : data?.score;
  const summary = isString ? null : data?.summary;

  const getScoreColor = (s: number) => {
    if (s >= 75) return "text-emerald-400";
    if (s >= 50) return "text-sky-400";
    return "text-red-400";
  };

  const getScoreBg = (s: number) => {
    if (s >= 75) return "bg-emerald-500/10 border border-emerald-500/20";
    if (s >= 50) return "bg-sky-500/10 border border-sky-500/20";
    return "bg-red-500/10 border border-red-500/20";
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-xl w-full max-w-xl text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white/90">Analyse de l&apos;IA</h2>
          {summary && <p className="text-sm text-white/50 mt-1">{summary}</p>}
        </div>
        {score !== null && (
          <div className={`px-4 py-2 rounded-xl ${getScoreBg(score)} ${getScoreColor(score)} font-bold text-lg`}>
            {score}/100
          </div>
        )}
      </div>
      
      <div className="prose prose-invert max-w-none mb-8 text-white/80">
        {/* Affichage du résultat */}
        <p className="whitespace-pre-wrap">{result}</p>
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