const fs = require('fs');
const path = require('path');

const routes = [
  'tasks', 'projects', 'goals', 'habits', 'finances', 'notes', 
  'journal', 'calendar', 'crm', 'health', 'media', 'focus', 
  'routines', 'reviews', 'trips', 'subscriptions', 'inventory'
];

const basePath = path.join(process.cwd(), 'src', 'app');

routes.forEach(route => {
  const dir = path.join(basePath, route);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const title = route.charAt(0).toUpperCase() + route.slice(1);
  
  const content = `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ${title}Page() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 capitalize">
            ${title}
          </h1>
          <p className="text-muted-foreground mt-2">Manage your ${route} here.</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-black/5 to-white/5 dark:from-white/5 dark:to-black/5 border-black/10 dark:border-white/10 shadow-lg backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This module is currently being built. Data interface coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});

console.log('Successfully generated ' + routes.length + ' pages!');
