"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, BarChart3, CreditCard, TrendingUp } from "lucide-react";
import Link from "next/link";

interface AdminStats {
  stats: {
    totalUsers: number;
    totalAnalyses: number;
    totalBilans: number;
    totalProSubscriptions: number;
    totalPremiumSubscriptions: number;
    totalPaidSubscriptions: number;
  };
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    subscription: { tier: string } | null;
    credits: { balance: number } | null;
  }>;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function fetchAdminData() {
    try {
      if (!session?.user?.email) {
        router.push("/auth/login");
        return;
      }

      const res = await fetch("/api/admin/stats");

      if (res.status === 403) {
        setError("Accès refusé. Vous n'êtes pas administrateur.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Erreur lors du chargement des données admin");
      }

      const adminData = await res.json();
      setData(adminData);
    } catch (err) {
      console.error("Admin fetch error:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchAdminData();
    }
  }, [session, router]);

  async function handleDeleteUser(userId: string, userEmail: string) {
    if (!confirm(`Supprimer l'utilisateur ${userEmail} ? Cette action est irréversible.`)) {
      return;
    }

    setDeletingUserId(userId);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Erreur lors de la suppression de l'utilisateur");
      }

      setSuccessMessage(`Utilisateur ${userEmail} supprimé.`);
      await fetchAdminData();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(String(err));
    } finally {
      setDeletingUserId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F17] text-white flex items-center justify-center">
        <div>Chargement des données admin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F17] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-4">Accès Refusé</h1>
          <p className="text-[rgba(237,234,248,0.60)] mb-8">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#5B4FE8] to-[#00C8D7] rounded-lg text-white hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0F0F17] text-white flex items-center justify-center">
        <div>Aucune donnée disponible</div>
      </div>
    );
  }

  const { stats, users } = data;

  return (
    <div className="min-h-screen bg-[#0F0F17] text-white">
      <div className="p-6 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-sm text-[rgba(237,234,248,0.70)] hover:bg-[rgba(255,255,255,0.05)] transition-all mb-6"
            >
              <ArrowLeft size={16} />
              Dashboard Principal
            </Link>

            <h1 className="text-5xl font-light mb-2">Tableau de Bord Admin</h1>
            <p className="text-[rgba(237,234,248,0.60)]">
              Accès administrateur - Gestion complète de la plateforme
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100">
              {successMessage}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {/* Total Users */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[rgba(237,234,248,0.60)] uppercase tracking-wide">
                  Total Utilisateurs
                </h3>
                <Users className="text-[#00C8D7]" size={20} />
              </div>
              <p className="text-3xl font-light">{stats.totalUsers}</p>
            </div>

            {/* Analyses */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[rgba(237,234,248,0.60)] uppercase tracking-wide">
                  Analyses
                </h3>
                <BarChart3 className="text-[#5B4FE8]" size={20} />
              </div>
              <p className="text-3xl font-light">{stats.totalAnalyses}</p>
            </div>

            {/* Bilans */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[rgba(237,234,248,0.60)] uppercase tracking-wide">
                  Bilans
                </h3>
                <TrendingUp className="text-[#00C8D7]" size={20} />
              </div>
              <p className="text-3xl font-light">{stats.totalBilans}</p>
            </div>

            {/* Pro Subs */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[rgba(237,234,248,0.60)] uppercase tracking-wide">
                  Plan Pro
                </h3>
                <CreditCard className="text-yellow-500" size={20} />
              </div>
              <p className="text-3xl font-light">{stats.totalProSubscriptions}</p>
            </div>

            {/* Premium Subs */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-[rgba(237,234,248,0.60)] uppercase tracking-wide">
                  Plan Premium
                </h3>
                <CreditCard className="text-purple-500" size={20} />
              </div>
              <p className="text-3xl font-light">{stats.totalPremiumSubscriptions}</p>
            </div>
          </div>

          {/* Users List */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
              <h2 className="text-2xl font-light">Liste des Utilisateurs</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)]">
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Nom
                    </th>
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Abonnement
                    </th>
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Crédits
                    </th>
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Inscrit
                    </th>
                    <th className="px-6 py-4 text-left text-[rgba(237,234,248,0.60)] font-normal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition"
                    >
                      <td className="px-6 py-4 text-white">{user.email}</td>
                      <td className="px-6 py-4 text-[rgba(237,234,248,0.70)]">
                        {user.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">
                          {user.subscription?.tier || "free"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[rgba(237,234,248,0.70)]">
                        {user.credits?.balance || 0}
                      </td>
                      <td className="px-6 py-4 text-[rgba(237,234,248,0.70)] text-xs">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          disabled={
                            deletingUserId === user.id ||
                            user.email === session?.user?.email
                          }
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-200 text-sm transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {user.email === session?.user?.email
                            ? "Moi"
                            : deletingUserId === user.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
