const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 1. Remove background gradients from cards and replace with solid colors
      content = content.replace(/bg-gradient-to-[a-z]+ from-[^\s]+ to-[^\s]+/g, 'bg-card');
      content = content.replace(/bg-gradient-to-[a-z]+ from-[^\s]+ via-[^\s]+ to-[^\s]+/g, 'bg-card');
      
      // 2. Remove text gradients from h1s (Apple/Linear style is solid monochrome)
      content = content.replace(/text-transparent bg-clip-text bg-gradient-[^\s]+ from-[^\s]+ dark:from-[^\s]+ to-[^\s]+ dark:to-[^\s]+/g, 'text-foreground');
      content = content.replace(/text-transparent bg-clip-text bg-gradient-[^\s]+ from-[^\s]+ to-[^\s]+/g, 'text-foreground');
      
      // 3. Remove glassmorphism blurs
      content = content.replace(/\bbackdrop-blur-[a-z0-9]+\b/g, '');
      content = content.replace(/\bbackdrop-blur\b/g, '');
      
      // 4. Standardize borders to minimal
      content = content.replace(/border-black\/[0-9]+ dark:border-white\/[0-9]+/g, 'border-border');
      
      // 5. Flatten shadows
      content = content.replace(/\bshadow-2xl\b/g, 'shadow-sm');
      content = content.replace(/\bshadow-xl\b/g, 'shadow-sm');
      content = content.replace(/\bshadow-lg\b/g, 'shadow-sm');
      content = content.replace(/\bshadow-md\b/g, 'shadow-sm');
      content = content.replace(/\bshadow-[a-z]+-500\/[0-9]+\b/g, ''); // Remove colored shadows
      
      // 6. Clean up rounded corners to be slightly less bubbly (Apple style)
      // Actually, keeping rounded-2xl or rounded-xl is fine, maybe we keep them.
      
      // 7. Replace specific card backgrounds with solid ones if they have explicit opacity
      content = content.replace(/bg-black\/5 dark:bg-white\/5/g, 'bg-muted/50');
      content = content.replace(/bg-white\/50 dark:bg-black\/20/g, 'bg-muted/50');
      
      // Remove double spaces left by replacements
      content = content.replace(/ +/g, ' ');
      
      fs.writeFileSync(fullPath, content);
      console.log(`Processed: ${fullPath}`);
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'app'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('UI Overhaul Complete!');
