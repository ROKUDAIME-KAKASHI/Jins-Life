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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/(async function \w+\([^)]*\)\s*\{\s*["']use server["'];?)/g, 
      `$1\n  const session = await getServerSession(authOptions);\n  if (!session?.user?.id) throw new Error("Unauthorized");\n  const userId = session.user.id;\n`
    );
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed inline server action in: ' + filePath);
    }
  }
});
