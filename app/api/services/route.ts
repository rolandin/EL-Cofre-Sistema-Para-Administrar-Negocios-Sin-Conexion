import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  commissionPercentage: z.number().min(0).max(100),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const offset = (page - 1) * pageSize;

    // Get total count
    const totalCount = db
      .prepare("SELECT COUNT(*) as count FROM services")
      .get() as { count: number };

    // Get paginated services
    const services = db
      .prepare("SELECT * FROM services ORDER BY name LIMIT ? OFFSET ?")
      .all(pageSize, offset) as any[];

    return NextResponse.json({
      items: services,
      total: totalCount.count,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = serviceSchema.parse(body);

    const result = db
      .prepare(
        `INSERT INTO services (
          name,
          description,
          base_price,
          commission_percentage
        ) VALUES (?, ?, ?, ?)`
      )
      .run(
        validatedData.name,
        validatedData.description || "",
        validatedData.basePrice,
        validatedData.commissionPercentage
      );

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error("Failed to create service:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid service data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
