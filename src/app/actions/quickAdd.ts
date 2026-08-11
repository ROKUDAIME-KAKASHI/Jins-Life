"use server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEntity(data: { type: string, title: string, amount: number }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  if (data.type === "task") {
    await prisma.task.create({ data: { userId,  title: data.title, status: "TODO" } });
  } else if (data.type === "habit") {
    await prisma.habit.create({ data: { userId,  title: data.title, frequency: "DAILY", streak: 0 } });
  } else if (data.type === "event") {
    const today = new Date();
    await prisma.event.create({ data: { userId,  title: data.title, startTime: today, endTime: new Date(today.getTime() + 3600000) } });
  } else if (data.type === "expense") {
    await prisma.expense.create({ data: { userId,  amount: data.amount, category: "Expense", description: data.title, date: new Date() } });
  } else if (data.type === "log") {
    await prisma.log.create({ data: { userId,  content: data.title, source: "USER" } });
  }
  
  // Revalidate all related paths
  const paths = ["/", "/tasks", "/habits", "/calendar", "/finances", "/today"];
  paths.forEach(p => revalidatePath(p));
}
