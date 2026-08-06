const fs = require('fs');
const path = require('path');

const pages = [
  {
    dir: 'routines',
    title: 'Routines',
    model: 'routine',
    icon: 'ListChecks',
    color: 'from-orange-400 to-amber-500',
    colorName: 'orange',
    fields: [
      { name: 'title', type: 'text', placeholder: 'Routine Name' },
      { name: 'timeOfDay', type: 'text', placeholder: 'MORNING, EVENING, ANYTIME' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-orange-500" />
            {item.title}
          </span>
          <span className="text-xs font-normal bg-orange-500/20 text-orange-700 px-2 py-1 rounded-full">{item.timeOfDay}</span>
        </CardTitle>
      </CardHeader>
    `
  },
  {
    dir: 'focus',
    title: 'Focus',
    model: 'focusSession',
    icon: 'Timer',
    color: 'from-rose-400 to-pink-500',
    colorName: 'rose',
    fields: [
      { name: 'duration', type: 'number', placeholder: 'Duration (minutes)' },
      { name: 'task', type: 'text', placeholder: 'What are you focusing on?' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-rose-500" />
            {item.task || "Deep Work Session"}
          </span>
          <span className="font-bold">{item.duration}m</span>
        </CardTitle>
        <CardDescription>{new Date(item.startTime).toLocaleString()}</CardDescription>
      </CardHeader>
    `
  }
];

for (const page of pages) {
  const code = `import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ${page.icon} } from "lucide-react";
import { revalidatePath } from "next/cache";

async function add${page.title}(formData: FormData) {
  "use server";
  const data: any = {};
  ${page.fields.map(f => {
    if (f.type === 'number') return `const ${f.name} = parseInt(formData.get("${f.name}") as string, 10); if(!isNaN(${f.name})) data.${f.name} = ${f.name};`;
    if (f.type === 'date') return `const ${f.name} = formData.get("${f.name}") as string; if(${f.name}) data.${f.name} = new Date(${f.name});`;
    return `const ${f.name} = formData.get("${f.name}") as string; if(${f.name}) data.${f.name} = ${f.name};`;
  }).join('\n  ')}
  
  if (Object.keys(data).length > 0) {
    await prisma.${page.model}.create({ data });
    revalidatePath("/${page.dir}");
  }
}

export default async function ${page.title}Page() {
  const items = await prisma.${page.model}.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${page.color} capitalize">
            ${page.title}
          </h1>
          <p className="text-muted-foreground mt-2">Manage your ${page.title.toLowerCase()} here.</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-black/5 to-white/5 border-black/10 shadow-lg backdrop-blur-xl mb-8">
        <CardContent className="p-4 sm:p-6">
          <form action={add${page.title}} className="flex flex-col md:flex-row gap-2">
            ${page.fields.map(f => `<input 
              name="${f.name}" 
              ${f.name === page.fields[0].name ? 'required' : ''}
              type="${f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}" 
              placeholder="${f.placeholder}" 
              className="md:flex-1 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-${page.colorName}-500/50"
            />`).join('\n            ')}
            <button 
              type="submit" 
              className="bg-${page.colorName}-500 hover:bg-${page.colorName}-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
            >
              Add ${page.title.replace(/s$/, '')}
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <Card className="bg-gradient-to-br from-black/5 to-white/5 border-black/10 shadow-lg col-span-3">
            <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <${page.icon} className="w-12 h-12 mb-4 opacity-50" />
              <p>No records found. Add one above!</p>
            </CardContent>
          </Card>
        ) : (
          items.map((item: any) => (
            <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-gradient-to-br from-black/5 to-white/5 border-black/10 shadow-md">
              ${page.display('item')}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
`;
  const fullPath = path.join(__dirname, 'src', 'app', page.dir, 'page.tsx');
  fs.writeFileSync(fullPath, code);
  console.log('Generated ' + page.dir);
}
