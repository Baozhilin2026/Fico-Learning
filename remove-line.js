const fs = require('fs');
const filePath = 'D:\\26年FICO模块英文学习网站\src\components\mock-interview\InterviewSession.vue';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const newLines = lines.filter(line => !line.includes('currentStage'));
fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Removed line with currentStage');
