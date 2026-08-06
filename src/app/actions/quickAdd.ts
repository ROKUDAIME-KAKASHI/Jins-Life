"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEntity(data: { type: string, title: string, amount: number }) {
  if (data.type === "task") {
    await prisma.task.create({ data: { title: data.title, status: "TODO" } });
  } else if (data.type === "habit") {
    await prisma.habit.create({ data: { title: data.title, frequency: "DAILY", streak: 0 } });
  } else if (data.type === "event") {
    const today = new Date();
    await prisma.event.create({ data: { title: data.title, startTime: today, endTime: new Date(today.getTime() + 3600000) } });
  } else if (data.type === "expense") {
    await prisma.expense.create({ data: { amount: data.amount, category: "Expense", description: data.title, date: new Date() } });
  } else if (data.type === "log") {
    await prisma.log.create({ data: { content: data.title, source: "USER" } });
  }
  
  // Revalidate all related paths
  const paths = ["/", "/tasks", "/habits", "/calendar", "/finances", "/today"];
  paths.forEach(p => revalidatePath(p));
}
