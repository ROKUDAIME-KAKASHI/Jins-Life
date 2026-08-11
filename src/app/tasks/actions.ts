"use server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTask(id: string, currentStatus: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
  await prisma.task.update({
    where: { userId,  id },
    data: { status: newStatus }
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await prisma.task.delete({
    where: { userId,  id }
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function addTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const title = formData.get("title") as string;
  if (!title || title.trim() === "") return;
  
  await prisma.task.create({
    data: { userId, 
      title,
      status: "TODO",
      priority: "MEDIUM"
    }
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}
