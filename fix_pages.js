const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src/app'), function(filePath) {
  if (filePath.endsWith('page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    if (content.includes('export default async function')) {
      if (!content.includes('const session = await getServerSession')) {
        content = content.replace(/(export default async function\s+\w+\([^)]*\)\s*\{)/, 
          `$1\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;\n  const userId = session.user.id;\n`
        );
      }
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed page: ' + filePath);
    }
  }
});
