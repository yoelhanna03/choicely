import { auth } from "@/auth";
import { isUserAdmin, getAdminStats, getAdminUsersList } from "@/lib/admin-utils";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getAdminStats();
    const users = await getAdminUsersList();

    return Response.json({
      stats,
      users,
    });
  } catch (error) {
    console.error("[API /admin/stats] Error:", error);
    return Response.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
