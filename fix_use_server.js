const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/actions/delete.ts',
  'src/app/actions/proactive.ts',
  'src/app/actions/quickAdd.ts',
  'src/app/calendar/actions.ts',
  'src/app/tasks/actions.ts',
  'src/features/meeting-transcriber/server/actions.ts'
];

filesToFix.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Check if 'use server' exists
    if (content.includes('"use server"') || content.includes("'use server'")) {
      // Remove it from wherever it is
      content = content.replace(/["']use server["'];?\r?\n?/g, '');
      
      // Prepend it to the very top
      content = '"use server";\n' + content;
      
      fs.writeFileSync(p, content);
      console.log('Fixed "use server" in: ' + f);
    }
  }
});
