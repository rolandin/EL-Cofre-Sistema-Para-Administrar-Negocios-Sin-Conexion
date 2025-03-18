import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";

const productUpdateSchema = z.object({
  name: z.string().min(1),
  inboundPrice: z.number().min(0),
  outboundPrice: z.number().min(0),
  supplier: z.string().optional(),
  commissionPercentage: z.number().min(0).max(100),
  quantity: z.number().min(0),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(params.id) as any;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user role
    const auth = await verifyToken(request);
    if (auth.role !== "admin" && auth.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = productUpdateSchema.parse(body);

    // Check if product exists
    const product = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(params.id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product
    db.prepare(
      `UPDATE products SET
        name = ?,
        inboundPrice = ?,
        outboundPrice = ?,
        supplier = ?,
        commissionPercentage = ?,
        quantity = ?,
        lastUpdated = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).run(
      validatedData.name,
      validatedData.inboundPrice,
      validatedData.outboundPrice,
      validatedData.supplier || "",
      validatedData.commissionPercentage,
      validatedData.quantity,
      params.id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update product:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid product data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
