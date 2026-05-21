"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-[#0F0F17] text-white">
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-[13.5px] text-[rgba(237,234,248,0.70)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all mb-12"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>

          {/* Header */}
          <div className="mb-16">
            <h1 className="text-5xl font-light mb-4">Conditions Générales d'Utilisation</h1>
            <p className="text-[rgba(237,234,248,0.60)]">
              Dernière mise à jour : Mai 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-light mb-4">1. Objet et définitions</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Choicely (« l'Application ») est une plateforme d'analyse de décisions utilisant l'intelligence artificielle. Elle permet aux utilisateurs d'analyser des choix, des situations complexes et de recevoir des synthèses basées sur l'IA.
                </p>
                <p>
                  Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de l'Application par les utilisateurs (« Vous » ou « l'Utilisateur »).
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-light mb-4">2. Acceptation des conditions</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  En accédant à ou en utilisant l'Application, vous acceptez d'être lié par les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'Application.
                </p>
                <p>
                  Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications entrent en vigueur dès leur publication. Votre utilisation continue de l'Application constitue une acceptation des modifications.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-light mb-4">3. Inscription et comptes utilisateur</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous déclarez que les informations fournis lors de l'inscription sont exactes, complètes et à jour.
                </p>
                <p>
                  Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion et de toutes les activités qui se produisent sous votre compte. Vous acceptez de notifier immédiatement Choicely de toute utilisation non autorisée de votre compte.
                </p>
                <p>
                  Vous devez être âgé d'au moins 18 ans pour utiliser l'Application.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-light mb-4">4. Utilisation acceptable</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>Vous acceptez de ne pas utiliser l'Application pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violer les lois ou réglementations applicables</li>
                  <li>Contourner les mesures de sécurité ou d'authentification</li>
                  <li>Accéder ou tenter d'accéder à des données non autorisées</li>
                  <li>Interférer avec le fonctionnement de l'Application</li>
                  <li>Soumettre du contenu haineux, discriminatoire, ou abusif</li>
                  <li>Harceler ou menacer d'autres utilisateurs</li>
                  <li>Utiliser l'Application à des fins commerciales sans autorisation</li>
                  <li>Créer des faux comptes ou usurper l'identité d'une personne</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-light mb-4">5. Contenu utilisateur</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Le contenu que vous fournissez à l'Application (« Contenu Utilisateur ») reste votre propriété. En soumettant ce contenu, vous nous accordez une licence non exclusive, gratuite et mondiale pour l'utiliser afin de fournir et d'améliorer l'Application.
                </p>
                <p>
                  Vous êtes responsable de tout Contenu Utilisateur que vous fournissez. Vous garantissez que vous possédez les droits nécessaires et que ce contenu ne viole aucun droit tiers.
                </p>
                <p>
                  Nous pouvons supprimer ou modifier tout Contenu Utilisateur qui viole ces CGU.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-light mb-4">6. Données et vie privée</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  L'utilisation de vos données personnelles est régie par notre <Link href="/privacy" className="text-[#00C8D7] hover:text-[#5B4FE8] transition-colors">Politique de Confidentialité</Link>.
                </p>
                <p>
                  Les analyses et synthèses générées par l'IA sont basées sur les données que vous fournissez. Bien que nous nous efforçons d'assurer la précision, Choicely ne garantit pas que les analyses seront appropriées, exactes ou complètes pour vos besoins spécifiques.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-light mb-4">7. Paiements et dons</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  L'Application offre la possibilité de faire des dons pour soutenir son développement. Les paiements sont traités par Stripe.
                </p>
                <p>
                  Tous les paiements sont définitifs et non remboursables, sauf si la loi l'exige. Les dons ne donnent droit à aucun remboursement automatique de crédits ou services.
                </p>
                <p>
                  Vous acceptez de payer tous les frais applicables et les taxes associées à vos dons.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-light mb-4">8. Limitation de responsabilité</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  L'Application est fournie « telle quelle » sans garantie d'aucune sorte, expresse ou implicite. Nous ne garantissons pas que l'Application sera ininterrompue, exempt d'erreurs ou sécurisé.
                </p>
                <p>
                  Nous ne sommes pas responsables de tout dommage indirect, accessoire, spécial ou consécutif résultant de votre utilisation de l'Application.
                </p>
                <p>
                  Les analyses générées par l'IA sont fournies à titre informatif uniquement. Vous ne devez pas vous fier uniquement à ces analyses pour prendre des décisions importantes. Vous êtes seul responsable des décisions que vous prenez.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-light mb-4">9. Propriété intellectuelle</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  L'Application, y compris son code, son design, ses textes, et ses éléments visuels, est la propriété exclusive de Choicely ou de ses concédants. Vous ne devez pas reproduire, modifier, ou distribuer ces éléments sans autorisation expresse.
                </p>
                <p>
                  Les modèles d'IA utilisés par Choicely sont propriétaires et ne peuvent pas être accédés ou extraits par les utilisateurs.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-light mb-4">10. Suspension et résiliation</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Nous pouvons suspendre ou résilier votre compte à tout moment, à notre discrétion, si vous violez ces CGU ou posez un risque pour l'Application ou ses utilisateurs.
                </p>
                <p>
                  En cas de résiliation, vous ne conserverez plus accès à votre compte et à vos données stockées, sauf si nous sommes tenus de les conserver par la loi.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-light mb-4">11. Liens externes</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  L'Application peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables du contenu, de la précision ou de la sécurité de ces sites externes. Votre utilisation de ces sites est soumise à leurs conditions générales respectives.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-light mb-4">12. Modifications du service</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Nous nous réservons le droit de modifier, suspendre ou interrompre l'Application, en tout ou en partie, à tout moment et sans préavis. Nous ne serons pas responsables envers vous ou tiers pour ces modifications.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-light mb-4">13. Droit applicable et juridiction</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Ces CGU sont régies par les lois en vigueur. Tout litige sera soumis à la juridiction compétente.
                </p>
              </div>
            </section>
          </div>

          {/* Footer spacing */}
          <div className="mt-20 pt-8 border-t border-[rgba(255,255,255,0.1)]">
            <p className="text-[13px] text-[rgba(237,234,248,0.40)]">
              © 2026 Choicely. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
