import { NextResponse } from "next/server";
import { getFeaturedVendorsAction } from "@/lib/actions/featured-vendors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const parsedLimit = Number(limitParam);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 8;

  const data = await getFeaturedVendorsAction(limit);
  return NextResponse.json({ data });
}
