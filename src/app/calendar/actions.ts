"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addEvent(formData: FormData) {
  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  if (!title || !dateStr || !timeStr) return;
  
  const startTime = new Date(`${dateStr}T${timeStr}`);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour later
  
  await prisma.event.create({ 
    data: { 
      title, 
      startTime,
      endTime
    } 
  });
  revalidatePath("/calendar");
}

export async function deleteEvent(id: string) {
  if (!id) return;
  await prisma.event.delete({ where: { id } });
  revalidatePath("/calendar");
}
