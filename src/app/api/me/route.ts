import { getSession } from "@/lib/session";

// Tells the browser who is logged in (read from the signed cookie, no sheet call).
export async function GET() {
  const me = await getSession();
  return Response.json(
    { user: me },
    { headers: { "Cache-Control": "no-store" } }
  );
}
