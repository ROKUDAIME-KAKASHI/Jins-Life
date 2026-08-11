"use server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addEvent(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  if (!title || !dateStr || !timeStr) return;
  
  const startTime = new Date(`${dateStr}T${timeStr}`);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour later
  
  await prisma.event.create({ 
    data: { userId,  
      title, 
      startTime,
      endTime
    } 
  });
  revalidatePath("/calendar");
}

export async function deleteEvent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  if (!id) return;
  await prisma.event.delete({ where: { userId,  id } });
  revalidatePath("/calendar");
}
