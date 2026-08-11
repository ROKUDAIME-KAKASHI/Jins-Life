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

    content = content.replace(/return new Response\("Unauthorized", \{ status: 401 \}\);/g, 'throw new Error("Unauthorized");');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed Server Action throw in: ' + filePath);
    }
  }
});
