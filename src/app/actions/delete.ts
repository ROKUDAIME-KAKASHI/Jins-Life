"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteItem(model: string, id: string, path: string) {
  try {
    await (prisma as any)[model].delete({
      where: { id }
    });
    revalidatePath(path);
  } catch (error) {
    console.error(`Failed to delete ${model} with id ${id}:`, error);
  }
}
