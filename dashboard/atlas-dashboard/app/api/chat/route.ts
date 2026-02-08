import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.chatMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const body = await req.json();
  const userMsg = await prisma.chatMessage.create({
    data: { role: "user", content: body.content ?? "" },
  });
  const assistantMsg = await prisma.chatMessage.create({
    data: { role: "assistant", content: "Recibido. Procesando…" },
  });
  return NextResponse.json({ userMsg, assistantMsg });
}
