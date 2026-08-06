const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('src/app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace text-transparent bg-clip-text bg-gradient-to-r from-COLOR-X to-COLOR-Y
  const regex = /text-transparent\s+bg-clip-text\s+bg-gradient-to-r\s+from-([a-z]+)-(400|500)\s+to-([a-z]+)-(500|600)/g;
  
  content = content.replace(regex, (match, fromColor, fromShade, toColor, toShade) => {
    changed = true;
    const darkFrom = fromShade; // keep original for dark
    const darkTo = toShade;     // keep original for dark
    const lightFrom = "600";
    const lightTo = "600";
    return `text-transparent bg-clip-text bg-gradient-to-r from-${fromColor}-${lightFrom} dark:from-${fromColor}-${darkFrom} to-${toColor}-${lightTo} dark:to-${toColor}-${darkTo}`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated title gradient in ${file}`);
  }
});
