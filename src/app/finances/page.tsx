import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { DollarSign, IndianRupee, PieChart } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addExpense(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const amountStr = formData.get("amount") as string;
 const category = formData.get("category") as string;
 const description = formData.get("description") as string;
 
 if (!amountStr || !category) return;
 const amount = parseFloat(amountStr);
 if (isNaN(amount)) return;

 await prisma.expense.create({ 
 data: { userId,  
 amount, 
 category, 
 description 
 } 
 });
 revalidatePath("/finances");
}

export default async function FinancesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const expenses = await prisma.expense.findMany({ where: { userId }, 
 orderBy: { date: 'desc' },
 });

 const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Finances
 </h1>
 <p className="text-muted-foreground mt-2">Track your expenses and budget.</p>
 </div>
 <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
 <span>Total Spent:</span>
 <span>₹{totalSpent.toFixed(2)}</span>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addExpense} className="flex flex-col md:flex-row gap-2">
 <div className="relative md:w-32 shrink-0">
 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
 <input 
 name="amount" 
 required 
 type="number" 
 step="0.01"
 placeholder="Amount" 
 className="w-full bg-muted/50 border border-border rounded-xl pl-7 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
 />
 </div>
 <input 
 name="category" 
 required
 type="text" 
 placeholder="Category (e.g. Food, Transport)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
 />
 <input 
 name="description" 
 type="text" 
 placeholder="Description (Optional)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
 />
 <button 
 type="submit" 
 className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Expense
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {expenses.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <PieChart className="w-12 h-12 mb-4 opacity-50" />
 <p>No expenses tracked yet. Ask Jarvis or add one above!</p>
 </CardContent>
 </Card>
 ) : (
 expenses.map(expense => (
 <Card key={expense.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <span className="flex items-center gap-2">
 <IndianRupee className="w-4 h-4 text-emerald-500" />
 {expense.amount.toFixed(2)}
 </span>
 <div className="flex items-center gap-2">
 <span className="text-xs font-normal bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
 {expense.category}
 </span>
 <DeleteButton model="Expense" id={expense.id} path="/finances" />
 </div>
 </CardTitle>
 <CardDescription>
 {new Date(expense.date).toLocaleDateString()}
 </CardDescription>
 </CardHeader>
 {expense.description && (
 <CardContent>
 <p className="text-sm text-muted-foreground">{expense.description}</p>
 </CardContent>
 )}
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

