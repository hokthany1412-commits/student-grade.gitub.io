const fs = require('fs');

// 1. Modify semester-ranking.html
let sr = fs.readFileSync('semester-ranking.html', 'utf8');
sr = sr.replace('<script src="ranking.js"></script>', '<script src="semester-ranking.js"></script>');
sr = sr.replace(/href="grades\.html\?month=.*?"/g, 'href="semester-grades.html"');
sr = sr.replace('<div class="a4-container">', `<div class="no-print" style="margin: 1rem auto; width: 210mm; display: flex; gap: 10px; justify-content: center;">
    <button id="btn-rank-exam" class="btn" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">ចំណាត់ថ្នាក់ មធ្យមភាគប្រឡងឆមាស</button>
    <button id="btn-rank-sem" class="btn" style="background-color: #cbd5e1; color: black; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">ចំណាត់ថ្នាក់ មធ្យមភាគប្រចាំឆមាស</button>
</div>
<div class="a4-container">`);
fs.writeFileSync('semester-ranking.html', sr);

// 2. Modify semester-honor-roll.html
let hr = fs.readFileSync('semester-honor-roll.html', 'utf8');
hr = hr.replace('<script src="honor-roll.js"></script>', '<script src="semester-honor-roll.js"></script>');
hr = hr.replace(/href="grades\.html\?month=.*?"/g, 'href="semester-grades.html"');
hr = hr.replace('<div class="a4-container">', `<div class="no-print" style="margin: 1rem auto; width: 210mm; display: flex; gap: 10px; justify-content: center;">
    <button id="btn-hr-exam" class="btn" style="background-color: #eab308; color: black; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">កិត្តិយស មធ្យមភាគប្រឡងឆមាស</button>
    <button id="btn-hr-sem" class="btn" style="background-color: #cbd5e1; color: black; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">កិត្តិយស មធ្យមភាគប្រចាំឆមាស</button>
</div>
<div class="a4-container">`);
fs.writeFileSync('semester-honor-roll.html', hr);

console.log('HTML files modified');
