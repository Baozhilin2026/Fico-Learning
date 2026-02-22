const fs = require('fs');
const path = require('path');
const { sify } = require('chinese-conv');

const inputFile = path.join(__dirname, '../public/FICO 初級顧問.md');
const outputFile = path.join(__dirname, '../public/FICO 初级顾问.md');

console.log('Converting Traditional Chinese to Simplified Chinese...');
console.log('Input:', inputFile);
console.log('Output:', outputFile);

try {
  let content = fs.readFileSync(inputFile, 'utf8');
  const convertedContent = sify(content);
  fs.writeFileSync(outputFile, convertedContent, 'utf8');
  console.log('Conversion completed successfully!');
  console.log('Output file:', outputFile);
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
