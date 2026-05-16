import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight";
import { Separator } from "@/components/ui/separator";

export default async function Page() {
  const session = await auth();

  if (session?.user?.email) {
    redirect("/dashboard");
  }

  return (
    <div className="relative max-w-6xl mx-auto px-6 py-28 space-y-40">

      {/* Spotlight */}
      <Spotlight
        className="absolute -top-40 left-0 md:-top-20 md:left-40 opacity-70 pointer-events-none"
        fill="white"
      />

      {/* Main Title */}
      <h2 className="
        text-center text-5xl md:text-6xl font-light tracking-tight 
        text-transparent bg-clip-text mb-4
        bg-linear-to-r from-indigo-500 to-cyan-500
        drop-shadow-[0_0_35px_rgba(0,200,255,0.25)]
      ">
        Choicely
      </h2>

      {/* Hero Section */}
      <section className="relative grid md:grid-cols-2 gap-16 items-center p-6 md:p-14 rounded-3xl">

        {/* Subtle Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 bg-size-[44px_44px]
          bg-[linear-gradient(to_right,#1c1c1c_1px,transparent_1px),
              linear-gradient(to_bottom,#1c1c1c_1px,transparent_1px)]
          opacity-20 rounded-3xl"
        />

        {/* Text Area */}
        <div className="relative z-10 space-y-8">
          <p className="
            text-4xl md:text-5xl font-semibold leading-tight bg-linear-to-b
            from-neutral-100 to-neutral-300 bg-clip-text text-transparent
          ">
            Décidez avec{" "}
            <span className="
              bg-linear-to-r from-indigo-500 to-cyan-500 
              text-transparent bg-clip-text
              drop-shadow-[0_0_25px_rgba(0,200,255,0.25)]
            ">
              clarté.
            </span>
          </p>

          <p className="text-white/65 text-lg leading-relaxed max-w-md">
            Choicely analyse vos situations, révèle les scénarios possibles et
            met en lumière les éléments qui comptent vraiment.
            Une approche structurée pour avancer avec confiance.
          </p>

          <div className="flex gap-4 pt-6">
            <a
              href="/auth/signup"
              className="
                px-7 py-3.5 rounded-lg text-sm font-medium
                bg-linear-to-r from-indigo-600 to-cyan-600
                hover:opacity-90 transition shadow-md
              "
            >
              Commencer gratuitement
            </a>

            <a
              href="/auth/login"
              className="
                px-7 py-3.5 rounded-lg text-sm border
                border-white/10 bg-white/5
                hover:bg-white/10 transition
              "
            >
              Se connecter
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="relative z-10">
          <Image
            src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop"
            alt="Décision"
            width={600}
            height={450}
            className="
              rounded-3xl border border-white/10 shadow-2xl object-cover
            "
          />
        </div>
      </section>

      <Separator className="bg-linear-to-r from-indigo-500 to-cyan-500 my-20" />

      {/* 3 Steps */}
      <section className="space-y-16">
        <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-tight">
          Un processus en trois temps
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          <Step
            number="01"
            title="Exposez votre situation"
            desc="Décrivez librement votre contexte, vos hésitations ou votre choix difficile."
          />
          <Step
            number="02"
            title="Analyse stratégique"
            desc="Choicely identifie les conséquences, opportunités, risques et angles oubliés."
          />
          <Step
            number="03"
            title="Clarté immédiate"
            desc="Une synthèse limpide, structurée et exploitable — en quelques secondes."
          />
        </div>
      </section>

      <Separator className="bg-linear-to-r from-indigo-500 to-cyan-500 my-20" />

      {/* Content Split */}
      <section className="grid md:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop"
            alt="Analyse décisionnelle"
            width={600}
            height={450}
            className="
              rounded-3xl border border-white/10 shadow-xl object-cover
            "
          />
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Une méthode structurée pour décider mieux.
          </h2>

          <p className="text-white/65 leading-relaxed">
            Chaque décision repose sur des conséquences, des zones d’incertitude 
            et des aspects que l’on ne voit pas immédiatement.
          </p>

          <p className="text-white/55 leading-relaxed">
            Choicely organise ces éléments, clarifie les scénarios possibles et 
            met en évidence les leviers essentiels pour agir avec certitude.
          </p>
        </div>
      </section>

      <Separator className="bg-linear-to-r from-indigo-500 to-cyan-500 my-10" />

      {/* Features */}
      <section className="space-y-16">
        <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-tight">
          Conçu pour rendre la clarté accessible
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          <Card
            icon="https://cdn-icons-png.flaticon.com/512/535/535234.png"
            title="Conséquences visibles"
            desc="Comprenez l’impact de vos options dans le temps."
          />
          <Card
            icon="https://cdn-icons-png.flaticon.com/512/684/684908.png"
            title="Vision élargie"
            desc="Découvrez des perspectives que vous n’aviez pas envisagées."
          />
          <Card
            icon="https://cdn-icons-png.flaticon.com/512/2910/2910760.png"
            title="Synthèse instantanée"
            desc="Une vue claire, exploitable et fiable."
          />
        </div>
      </section>

      <Separator className="bg-linear-to-r from-indigo-500 to-cyan-500 my-20" />

      {/* Final CTA */}
      <section className="
        text-center space-y-6 py-20 rounded-3xl 
        bg-white/5 border border-white/10 backdrop-blur-xl
      ">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Prêt à décider avec plus de certitude ?
        </h2>

        <p className="text-white/65 max-w-xl mx-auto">
          Obtenez une analyse claire et immédiate pour avancer avec confiance.
        </p>

        <a
          href="/auth/signup"
          className="
            px-10 py-4 rounded-xl text-sm font-medium
            bg-linear-to-r from-indigo-600 to-cyan-600
            hover:opacity-90 transition shadow-lg
          "
        >
          Commencer maintenant
        </a>
      </section>

    </div>
  );
}

// STEP COMPONENT
function Step({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="space-y-3">
      <div className="text-indigo-400/40 text-5xl font-bold italic">{number}</div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// CARD COMPONENT
function Card({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="
      p-7 rounded-xl bg-white/5 border border-white/10 
      backdrop-blur-lg transition duration-300
      hover:bg-white/10 hover:scale-[1.03]
      shadow-lg hover:shadow-indigo-500/20
      space-y-4
    ">
      <Image src={icon} alt="" width={40} height={40} className="opacity-90" />
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}