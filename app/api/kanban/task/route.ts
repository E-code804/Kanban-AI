import { generateKanbanAdviceJson } from "@/lib/OpenAI";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { task } = await req.json();

  if (!task) {
    return NextResponse.json({ error: "Task are required." }, { status: 400 });
  }

  const advice = await generateKanbanAdviceJson(task);
  return NextResponse.json({ advice }, { status: 200 });
}
