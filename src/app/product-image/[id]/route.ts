import { getProductImage } from "@/lib/catalog";

// Serves a product photo that was uploaded in the Admin page.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  const img = Number.isInteger(num) ? await getProductImage(num) : null;
  if (!img) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(img.base64, "base64"), {
    headers: {
      "Content-Type": img.type,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
