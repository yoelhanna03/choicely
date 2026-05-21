"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
            <h1 className="text-5xl font-light mb-4">Politique de Confidentialité</h1>
            <p className="text-[rgba(237,234,248,0.60)]">
              Dernière mise à jour : Mai 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-light mb-4">1. Introduction</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Choicely (« nous », « notre » ou « l'Application ») s'engage à protéger votre vie privée. La présente Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations.
                </p>
                <p>
                  Cette politique s'applique à l'Application Choicely et à tous les services associés.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-light mb-4">2. Informations que nous collectons</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <h3 className="text-lg font-normal text-white mt-4">2.1 Informations d'identification personnelle</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adresse email</li>
                  <li>Nom (si fourni)</li>
                  <li>Informations d'authentification (par ex. via Google OAuth)</li>
                </ul>

                <h3 className="text-lg font-normal text-white mt-4">2.2 Contenu utilisateur</h3>
                <p>
                  Les analyses, situations et textes que vous soumettez à l'Application pour traitement par l'IA. Ces données sont stockées afin de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fournir les fonctionnalités du service</li>
                  <li>Générer des analyses et synthèses</li>
                  <li>Maintenir votre historique de décisions</li>
                  <li>Améliorer les modèles d'IA (avec votre consentement)</li>
                </ul>

                <h3 className="text-lg font-normal text-white mt-4">2.3 Données techniques</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et système d'exploitation</li>
                  <li>Historique de navigation au sein de l'Application</li>
                  <li>Données de cookies et identifiants de session</li>
                  <li>Informations d'utilisation (pages consultées, actions effectuées)</li>
                </ul>

                <h3 className="text-lg font-normal text-white mt-4">2.4 Données de paiement</h3>
                <p>
                  Les informations de paiement sont traitées directement par Stripe et ne sont pas stockées sur nos serveurs. Nous recevons uniquement des confirmations de transaction anonymisées.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-light mb-4">3. Comment nous utilisons vos données</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>Nous utilisons les informations collectées pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer et gérer votre compte utilisateur</li>
                  <li>Fournir les analyses et fonctionnalités demandées</li>
                  <li>Stocker et afficher votre historique d'analyses</li>
                  <li>Améliorer et optimiser l'Application</li>
                  <li>Envoyer des notifications et mises à jour (si consentement donné)</li>
                  <li>Respecter les obligations légales</li>
                  <li>Analyser les tendances d'utilisation et les performances</li>
                  <li>Détecter et prévenir les activités frauduleuses</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-light mb-4">4. Sécurité des données</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles, notamment :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                  <li>Chiffrement des données sensibles au repos</li>
                  <li>Contrôle d'accès basé sur les rôles</li>
                  <li>Authentification sécurisée (OAuth)</li>
                  <li>Audits de sécurité réguliers</li>
                </ul>
                <p>
                  Cependant, aucune méthode de transmission sur Internet n'est 100% sécurisée. Nous ne pouvons pas garantir la sécurité absolue des vos données.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-light mb-4">5. Stockage et durée de conservation</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Vos données sont stockées sur des serveurs sécurisés. La durée de conservation dépend du type de données :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Données de compte :</strong> Conservées aussi longtemps que votre compte est actif</li>
                  <li><strong>Analyses et historique :</strong> Conservés jusqu'à suppression manuelle ou suppression du compte</li>
                  <li><strong>Données techniques :</strong> Conservées pendant 90 jours maximum</li>
                  <li><strong>Logs de sécurité :</strong> Conservés pendant 12 mois</li>
                </ul>
                <p>
                  Vous pouvez demander la suppression de vos données à tout moment en nous contactant.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-light mb-4">6. Partage de données avec des tiers</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Nous ne vendons jamais vos données personnelles. Cependant, nous pouvons partager des données avec :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Prestataires de services :</strong> Stripe (paiements), providers d'IA</li>
                  <li><strong>Partenaires techniques :</strong> Serveurs d'hébergement, bases de données</li>
                  <li><strong>Autorités légales :</strong> Si requête légale valide</li>
                </ul>
                <p>
                  Tous les prestataires sont tenus par des accords de confidentialité strictes.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-light mb-4">7. Vos droits RGPD</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Si vous êtes situé en Europe, vous avez les droits suivants concernant vos données :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                  <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> Vous opposer au traitement</li>
                  <li><strong>Droit de retirer le consentement :</strong> À tout moment</li>
                </ul>
                <p>
                  Pour exercer ces droits, veuillez nous contacter à support@choicely.app
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-light mb-4">8. Cookies et technologies similaires</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Nous utilisons des cookies pour :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintenir votre session authentifiée</li>
                  <li>Stocker vos préférences utilisateur</li>
                  <li>Analyser l'utilisation de l'Application</li>
                </ul>
                <p>
                  Vous pouvez contrôler les cookies via les paramètres de votre navigateur. Désactiver les cookies peut affecter les fonctionnalités de l'Application.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-light mb-4">9. Modifications de cette politique</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre. Les modifications entrent en vigueur dès leur publication. Votre utilisation continue de l'Application signifie que vous acceptez les modifications.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-light mb-4">10. Informations légales</h2>
              <div className="space-y-4 text-[15px] leading-relaxed text-[rgba(237,234,248,0.70)]">
                <p>
                  Choicely se conforme au Règlement Général sur la Protection des Données (RGPD) et à toutes les lois applicables en matière de protection des données.
                </p>
                <p>
                  Pour toute plainte concernant le traitement de vos données, vous avez le droit de déposer une plainte auprès de l'autorité de protection des données compétente.
                </p>
              </div>
            </section>

            {/* Related Links */}
            <section>
              <div className="bg-[rgba(0,200,215,0.1)] border border-[rgba(0,200,215,0.2)] rounded-lg p-6">
                <p className="text-sm mb-4">Documents connexes :</p>
                <Link
                  href="/cgu"
                  className="text-[#00C8D7] hover:text-[#5B4FE8] transition-colors"
                >
                  Conditions Générales d'Utilisation
                </Link>
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
