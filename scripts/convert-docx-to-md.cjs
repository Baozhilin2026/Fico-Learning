const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const inputFile = path.join(__dirname, '../FICO 高级顾问.docx');
const outputFile = path.join(__dirname, '../public/FICO 高级顾问.md');

console.log('Converting DOCX to Markdown...');
console.log('Input:', inputFile);
console.log('Output:', outputFile);

mammoth.convertToMarkdown({ path: inputFile })
  .then(result => {
    let markdown = result.value;

    // Remove excessive blank lines first
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Step-by-step conversions

    // 1. Fix question numbering: __Q01__ -> ### Q1.
    markdown = markdown.replace(/__Q(\d+)__/g, '### Q$1.');

    // 2. Fix section headers: __【FI基础 / FI Fundamentals】__ -> ## FI基础 | FI Fundamentals
    markdown = markdown.replace(/__【([^】]+?) \/ ([^】]+?)】__/g, '## $1 | $2');

    // 3. Fix Chinese question lines: 🇨🇳 __什么是...?__ -> **什么是...?**
    markdown = markdown.replace(/🇨🇳 __([^_]+?)__\n/g, '**$1**\n');

    // 4. Fix English question lines: 🇬🇧 __*What is...?*__ -> What is...?
    markdown = markdown.replace(/🇬🇧 __\*([^*]+?)\*__\n/g, '$1\n');

    // 5. Fix Chinese answer headers: __答 / Answer (CN)：__ -> **答案：**
    // Use a simpler pattern that matches the structure
    markdown = markdown.replace(/__[^_]+?\/[^_]+?\(CN\)[^_]*?：__/g, '**答案：**');

    // 6. Fix English answer headers: __Answer (EN)：__ -> **Answer:**
    markdown = markdown.replace(/__Answer \(EN\)：__/g, '**Answer:**');

    // 7. Remove remaining standalone __ markers
    markdown = markdown.replace(/^__$/gm, '');

    // 8. Remove escaped backslashes before parentheses
    markdown = markdown.replace(/\\\(/g, '(');
    markdown = markdown.replace(/\\\)/g, ')');

    // 9. Clean up extra spaces again
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // 10. Add separators between questions (after each answer section)
    markdown = markdown.replace(/(###\s*Q\d+\.)/g, '\n\n---\n\n$1');
    markdown = markdown.replace(/^\n\n---\n\n### Q1\./m, '### Q1.');

    fs.writeFileSync(outputFile, markdown, 'utf8');
    console.log('Conversion completed successfully!');
    console.log('Output file:', outputFile);

    // Show some stats
    const lines = markdown.split('\n');
    console.log(`Total lines: ${lines.length}`);
    const questions = markdown.match(/###\s*Q\d+\./g) || [];
    console.log(`Total questions: ${questions.length}`);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
