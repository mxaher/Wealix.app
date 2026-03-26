import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from '@/lib/server-auth';

export async function GET() {
  const authResult = await requireAuthenticatedUser();
  if (authResult.error) {
    return authResult.error;
  }

  return NextResponse.json({ message: "Hello, world!" });
}
