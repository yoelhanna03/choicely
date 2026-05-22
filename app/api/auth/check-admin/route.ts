import { auth } from "@/auth";
import { ensureAdminStatus } from "@/lib/admin-utils";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ isAdmin: false });
    }

    const isAdmin = await ensureAdminStatus(session.user.email);

    return Response.json({
      email: session.user.email,
      isAdmin,
    });
  } catch (error) {
    console.error("[API /auth/check-admin] Error:", error);
    return Response.json({ isAdmin: false }, { status: 200 });
  }
}
