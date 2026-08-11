const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (content.includes('prisma.') && !filePath.includes('lib\\prisma.ts') && !filePath.includes('lib\\auth.ts')) {
      
      // Inject imports if not present
      if (!content.includes('getServerSession')) {
        content = 'import { getServerSession } from "next-auth";\n' + content;
      }
      if (!content.includes('authOptions')) {
        content = 'import { authOptions } from "@/lib/auth";\n' + content;
      }

      // Inject session into exported async functions (API routes and Server Actions)
      content = content.replace(/(export async function \w+\([^)]*\)\s*\{)/g, 
        `$1\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });\n  const userId = session.user.id;\n`
      );

      // Also for arrow functions exported
      content = content.replace(/(export const \w+ = async \([^)]*\)\s*=>\s*\{)/g, 
        `$1\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.id) throw new Error("Unauthorized");\n  const userId = session.user.id;\n`
      );

      // Now inject userId into prisma queries
      
      // CREATE: prisma.model.create({ data: { ... } })
      content = content.replace(/(\.create\s*\(\s*\{\s*data\s*:\s*\{)/g, '$1 userId, ');

      // FINDMANY / FINDFIRST / DELETE / UPDATE: prisma.model.findMany({ where: { ... } })
      // If where exists
      content = content.replace(/(\.(?:findMany|findFirst|update|delete|updateMany|deleteMany|count)\s*\(\s*\{\s*where\s*:\s*\{)/g, '$1 userId, ');
      
      // If where doesn't exist (e.g., prisma.model.findMany())
      content = content.replace(/(\.findMany\s*\(\s*)\)/g, '$1{ where: { userId } })');
      content = content.replace(/(\.findMany\s*\(\s*\{)(?!\s*where)/g, '$1 where: { userId }, ');

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Refactored: ' + filePath);
      }
    }
  }
});
console.log("Codebase refactoring complete.");
