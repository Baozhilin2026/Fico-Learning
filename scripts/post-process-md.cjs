const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '../public/FICO 高级顾问.md');
const outputFile = path.join(__dirname, '../public/FICO 高级顾问.md');

console.log('Post-processing markdown file...');

let markdown = fs.readFileSync(inputFile, 'utf8');

// Fix answer headers
markdown = markdown.replace(/__答 \/ Answer \(CN\)：__/g, '**答案：**');
markdown = markdown.replace(/__Answer \(EN\)：__/g, '**Answer:**');

// Remove remaining __ markers at the start of lines
markdown = markdown.replace(/^__.*?__$/gm, match => {
  if (match.includes('SAP FICO')) {
    return match.replace(/__/g, '');
  }
  return match;
});

// Clean up title lines
markdown = markdown.replace(/^__(.+?)__$/gm, '# $1');

// Remove all escaped backslashes
markdown = markdown.replace(/\\/g, '');

// Remove extra blank lines at the start
markdown = markdown.replace(/^\n+/, '');

fs.writeFileSync(outputFile, markdown, 'utf8');
console.log('Post-processing completed!');
