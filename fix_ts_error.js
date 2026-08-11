const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/api/chat/route.ts');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/error: e\.message/g, 'error: String(e.message)');
fs.writeFileSync(file, content);
console.log('Fixed types in chat route');
