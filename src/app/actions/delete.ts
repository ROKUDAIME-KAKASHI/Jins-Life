"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deleteItem(model: string, id: string, path: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    // deleteMany safely allows filtering by non-unique combinations like id + userId
    await (prisma as any)[model].deleteMany({
      where: { 
        id,
        userId: session.user.id
      }
    });
    revalidatePath(path);
  } catch (error) {
    console.error(`Failed to delete ${model} with id ${id}:`, error);
  }
}
