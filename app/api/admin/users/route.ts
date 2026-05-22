import { auth } from "@/auth";
import { isUserAdmin } from "@/lib/admin-utils";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        subscription: {
          select: { tier: true, createdAt: true },
        },
        credits: {
          select: { balance: true, lastResetAt: true },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error("[API /admin/users/[id]] Error:", error);
    return Response.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    const body = await req.json();

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Allowed fields for admin to update
    const allowedFields: Record<string, any> = {};
    if (body.role && ["user", "admin"].includes(body.role)) {
      allowedFields.role = body.role;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: allowedFields,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error("[API PATCH /admin/users/[id]] Error:", error);
    return Response.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Prevent deleting self
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email === session.user.email) {
      return Response.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete related records first
    await Promise.all([
      db.credit.deleteMany({ where: { userId } }),
      db.subscription.deleteMany({ where: { userId } }),
      db.proposition.deleteMany({ where: { for_email: user.email } }),
      db.bilan.deleteMany({ where: { by_email: user.email } }),
      db.question.deleteMany({ where: { by_email: user.email } }),
    ]);

    // Delete user
    await db.user.delete({
      where: { id: userId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[API DELETE /admin/users/[id]] Error:", error);
    return Response.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
