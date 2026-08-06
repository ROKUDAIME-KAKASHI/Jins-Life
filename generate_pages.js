const fs = require('fs');
const path = require('path');

const pages = [
  {
    dir: 'crm',
    title: 'CRM',
    model: 'contact',
    icon: 'Users',
    color: 'from-blue-400 to-cyan-500',
    colorName: 'blue',
    fields: [
      { name: 'name', type: 'text', placeholder: 'Contact Name' },
      { name: 'email', type: 'email', placeholder: 'Email Address' },
      { name: 'notes', type: 'text', placeholder: 'Notes' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          {item.name}
        </CardTitle>
        <CardDescription>{item.email}</CardDescription>
      </CardHeader>
      {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
    `
  },
  {
    dir: 'health',
    title: 'Health',
    model: 'healthMetric',
    icon: 'Activity',
    color: 'from-rose-400 to-red-500',
    colorName: 'rose',
    fields: [
      { name: 'type', type: 'text', placeholder: 'Type (e.g. WEIGHT, SLEEP)' },
      { name: 'value', type: 'number', placeholder: 'Value' },
      { name: 'unit', type: 'text', placeholder: 'Unit (e.g. kg, hours)' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500" />
          {item.type}
        </CardTitle>
        <CardDescription>{item.value} {item.unit}</CardDescription>
      </CardHeader>
      {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
    `
  },
  {
    dir: 'inventory',
    title: 'Inventory',
    model: 'inventoryItem',
    icon: 'Archive',
    color: 'from-amber-400 to-orange-500',
    colorName: 'amber',
    fields: [
      { name: 'name', type: 'text', placeholder: 'Item Name' },
      { name: 'category', type: 'text', placeholder: 'Category' },
      { name: 'value', type: 'number', placeholder: 'Estimated Value (Optional)' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Archive className="w-4 h-4 text-amber-500" />
          {item.name}
        </CardTitle>
        <CardDescription>{item.category} {item.value ? '- ₹' + item.value : ''}</CardDescription>
      </CardHeader>
    `
  },
  {
    dir: 'journal',
    title: 'Journal',
    model: 'journal',
    icon: 'BookOpen',
    color: 'from-indigo-400 to-blue-500',
    colorName: 'indigo',
    fields: [
      { name: 'mood', type: 'text', placeholder: 'Mood (e.g. Happy, Focused)' },
      { name: 'entry', type: 'text', placeholder: 'Write your thoughts...' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            {new Date(item.date).toLocaleDateString()}
          </span>
          {item.mood && <span className="text-xs font-normal bg-indigo-500/20 text-indigo-700 px-2 py-1 rounded-full">{item.mood}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.entry}</p></CardContent>
    `
  },
  {
    dir: 'media',
    title: 'Media',
    model: 'mediaItem',
    icon: 'Library',
    color: 'from-purple-400 to-indigo-500',
    colorName: 'purple',
    fields: [
      { name: 'title', type: 'text', placeholder: 'Title' },
      { name: 'type', type: 'text', placeholder: 'Type (e.g. BOOK, MOVIE)' },
      { name: 'status', type: 'text', placeholder: 'Status (e.g. TO_CONSUME)' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Library className="w-4 h-4 text-purple-500" />
          {item.title}
        </CardTitle>
        <CardDescription>{item.type} - {item.status.replace('_', ' ')}</CardDescription>
      </CardHeader>
      {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
    `
  },
  {
    dir: 'notes',
    title: 'Notes',
    model: 'note',
    icon: 'FileText',
    color: 'from-yellow-400 to-amber-500',
    colorName: 'yellow',
    fields: [
      { name: 'title', type: 'text', placeholder: 'Note Title' },
      { name: 'tags', type: 'text', placeholder: 'Tags (comma separated)' },
      { name: 'content', type: 'text', placeholder: 'Note Content' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-4 h-4 text-yellow-500" />
          {item.title}
        </CardTitle>
        <CardDescription>{item.tags}</CardDescription>
      </CardHeader>
      <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p></CardContent>
    `
  },
  {
    dir: 'projects',
    title: 'Projects',
    model: 'project',
    icon: 'FolderKanban',
    color: 'from-sky-400 to-blue-500',
    colorName: 'sky',
    fields: [
      { name: 'title', type: 'text', placeholder: 'Project Title' },
      { name: 'description', type: 'text', placeholder: 'Description' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-sky-500" />
            {item.title}
          </span>
          <span className="text-xs font-normal bg-sky-500/20 text-sky-700 px-2 py-1 rounded-full">{item.status}</span>
        </CardTitle>
      </CardHeader>
      {item.description && <CardContent><p className="text-sm text-muted-foreground">{item.description}</p></CardContent>}
    `
  },
  {
    dir: 'subscriptions',
    title: 'Subscriptions',
    model: 'subscription',
    icon: 'CreditCard',
    color: 'from-green-400 to-emerald-500',
    colorName: 'green',
    fields: [
      { name: 'name', type: 'text', placeholder: 'Subscription Name' },
      { name: 'cost', type: 'number', placeholder: 'Cost' },
      { name: 'cycle', type: 'text', placeholder: 'Cycle (MONTHLY/YEARLY)' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-500" />
            {item.name}
          </span>
          <span className="font-bold">₹{item.cost}</span>
        </CardTitle>
        <CardDescription>{item.cycle}</CardDescription>
      </CardHeader>
    `
  },
  {
    dir: 'trips',
    title: 'Trips',
    model: 'trip',
    icon: 'Plane',
    color: 'from-teal-400 to-cyan-500',
    colorName: 'teal',
    fields: [
      { name: 'destination', type: 'text', placeholder: 'Destination' },
      { name: 'startDate', type: 'date', placeholder: 'Start Date' },
      { name: 'endDate', type: 'date', placeholder: 'End Date' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plane className="w-4 h-4 text-teal-500" />
          {item.destination}
        </CardTitle>
        <CardDescription>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
    `
  },
  {
    dir: 'reviews',
    title: 'Reviews',
    model: 'review',
    icon: 'BarChart',
    color: 'from-pink-400 to-rose-500',
    colorName: 'pink',
    fields: [
      { name: 'type', type: 'text', placeholder: 'Type (WEEKLY/MONTHLY)' },
      { name: 'summary', type: 'text', placeholder: 'Summary of period' }
    ],
    display: (item) => `
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="w-4 h-4 text-pink-500" />
          {item.type} Review - {new Date(item.date).toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      {item.summary && <CardContent><p className="text-sm text-muted-foreground">{item.summary}</p></CardContent>}
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
    if (f.type === 'number') return `const ${f.name} = parseFloat(formData.get("${f.name}") as string); if(!isNaN(${f.name})) data.${f.name} = ${f.name};`;
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
              ${f.type === 'number' ? 'step="0.01"' : ''}
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
