import { readPhotoFile } from "@/server/photoFiles";

// Отдаёт загруженные фото. Имена случайные и не меняются, поэтому кешируем надолго.
export async function GET(
  _request: Request,
  { params }: RouteContext<"/uploads/[file]">,
) {
  const { file } = await params;
  const data = await readPhotoFile(file);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
