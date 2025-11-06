import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedRibbonColors = new Set(["blue", "green", "orange", "red"]);
const DEFAULT_DESCRIPTION =
  "Этот подарок скоро будет доступен для улучшения, продажи или выпуска в виде NFT.";

function normalizeIncomingDescription(desc: any) {
  if (desc === null || typeof desc === "undefined") return "";
  if (typeof desc !== "string") return String(desc);
  // Преобразуем "null"/"undefined" и убираем невидимые пробелы
  const cleaned = desc.replace(/\u00A0/g, " ").trim();
  if (cleaned.toLowerCase() === "null" || cleaned.toLowerCase() === "undefined") return "";
  return cleaned;
}

export async function GET() {
  try {
    const gifts = await prisma.gift.findMany({ orderBy: { id: "asc" } });

    const normalized = gifts.map((gift) => ({
      ...gift,
      description:
        typeof gift.description === "string" && gift.description.trim() !== ""
          ? gift.description
          : DEFAULT_DESCRIPTION,
    }));

    return NextResponse.json(normalized);
  } catch (e) {
    console.error("Ошибка при получении подарков:", e);
    return NextResponse.json(
      { error: "Не удалось загрузить подарки" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name =
      typeof body.name === "string" && body.name.trim() !== ""
        ? body.name.trim()
        : "Новый подарок";

    const descRaw = normalizeIncomingDescription(body.description);
    const description = descRaw === "" ? DEFAULT_DESCRIPTION : descRaw;

    let ribbon_text =
      typeof body.ribbon_text === "string"
        ? body.ribbon_text.trim().slice(0, 24)
        : null;
    if (ribbon_text === "") ribbon_text = null;

    let ribbon_color = body.ribbon_color;
    if (!allowedRibbonColors.has(ribbon_color)) ribbon_color = null;

    let limited_until: Date | null = null;
    if (body.limited_until) {
      const d = new Date(body.limited_until);
      limited_until = isNaN(d.getTime()) ? null : d;
    }

    const created = await prisma.gift.create({
      data: {
        name,
        description,
        price: Number(body.price ?? 0),
        total_quantity: Number(body.total_quantity ?? 0),
        available_quantity: Number(body.available_quantity ?? 0),
        sticker_url: body.sticker_url ?? null,
        status: body.status ?? "active",
        frame_type: body.frame_type ?? "default",
        ribbon_text,
        ribbon_color,
        is_active: body.is_active ?? true,
        is_limited: body.is_limited ?? false,
        limited_until,
      },
    });

    return NextResponse.json(
      {
        ...created,
        description:
          created.description && created.description.trim() !== ""
            ? created.description
            : DEFAULT_DESCRIPTION,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Ошибка при создании подарка:", e);
    return NextResponse.json(
      { error: "Не удалось создать подарок" },
      { status: 500 }
    );
  }
}
