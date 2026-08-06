"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTask(id: string, currentStatus: string) {
  const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
  await prisma.task.update({
    where: { id },
    data: { status: newStatus }
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id }
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title || title.trim() === "") return;
  
  await prisma.task.create({
    data: {
      title,
      status: "TODO",
      priority: "MEDIUM"
    }
  });
  revalidatePath("/tasks");
  revalidatePath("/today");
}
