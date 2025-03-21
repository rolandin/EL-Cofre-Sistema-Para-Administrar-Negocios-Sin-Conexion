import { NextResponse } from "next/server";
import { verifyPassword, createToken } from "@/lib/auth";
import db from "@/lib/db";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const stmt = db.prepare(
      "SELECT id, password, role, isActive FROM users WHERE username = ?"
    );
    const user = stmt.get(validatedData.username) as
      | {
          id: number;
          password: string;
          role: string;
          isActive: boolean;
        }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: "inactiveUserError" }, { status: 403 });
    }

    const isValid = await verifyPassword(validatedData.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    const updateStmt = db.prepare(
      "UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?"
    );
    updateStmt.run(user.id);

    // Create and set JWT token
    await createToken(user.id, user.role);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
