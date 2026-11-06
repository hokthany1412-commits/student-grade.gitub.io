const fs = require('fs');

// Fix semester-ranking.js
let rjs = fs.readFileSync('semester-ranking.js', 'utf8');
rjs = rjs.replace("const tableBody = document.getElementById('ranking-body');", `
    const leftBody = document.getElementById('ranking-body-left');
    const rightBody = document.getElementById('ranking-body-right');
`);
rjs = rjs.replace("tableBody.innerHTML = '';", `
    leftBody.innerHTML = '';
    rightBody.innerHTML = '';
`);
rjs = rjs.replace(`    if (rankedStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</td></tr>';
        return;
    }`, `    if (rankedStudents.length === 0) {
        leftBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</td></tr>';
        return;
    }
    const midIndex = Math.ceil(rankedStudents.length / 2);
    const leftStudents = rankedStudents.slice(0, midIndex);
    const rightStudents = rankedStudents.slice(midIndex);
`);

// The previous version had a loop that did:
// rankedStudents.forEach((student) => {
// ...
// tableBody.appendChild(tr);
// });

// Let's replace the whole renderRanking function to be safe.
const newRenderRanking = `
// Render Table
function renderRanking() {
    document.getElementById('report-month').innerHTML = \`ចំណាត់ថ្នាក់ប្រចាំឆមាសទី១ <br><span style="font-size: 1.1rem; color: #1e293b;">(ផ្អែកលើ មធ្យមភាគ\${currentMode === 'exam' ? 'ប្រឡង' : 'ប្រចាំ'}ឆមាស)</span>\`;
    
    const leftBody = document.getElementById('ranking-body-left');
    const rightBody = document.getElementById('ranking-body-right');
    leftBody.innerHTML = '';
    rightBody.innerHTML = '';
    
    const rankedStudents = calculateRanks();
    
    if (rankedStudents.length === 0) {
        leftBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">មិនទាន់មានទិន្នន័យ</td></tr>';
        return;
    }
    
    const renderRow = (student, tbody) => {
        const avg = currentMode === 'exam' ? student.exam_avg : student.sem_avg;
        const tr = document.createElement('tr');
        
        if (student._tempRank === 1) tr.style.backgroundColor = '#fef08a';
        else if (student._tempRank === 2) tr.style.backgroundColor = '#e2e8f0';
        else if (student._tempRank === 3) tr.style.backgroundColor = '#fed7aa';
        
        tr.innerHTML = \`
            <td style="text-align: center; font-weight: bold;">\${student._tempRank}</td>
            <td style="text-align: left; padding-left: 5px;">\${student.name}</td>
            <td style="text-align: center;">\${student.gender}</td>
            <td style="text-align: center; font-weight: bold;">\${avg ? avg.toFixed(2) : '0.00'}</td>
            <td style="text-align: center;">\${student._tempRank}</td>
            <td style="text-align: center;">\${student.grade || ''}</td>
        \`;
        tbody.appendChild(tr);
    };
    
    const midIndex = Math.ceil(rankedStudents.length / 2);
    rankedStudents.forEach((student, index) => {
        if (index < midIndex) {
            renderRow(student, leftBody);
        } else {
            renderRow(student, rightBody);
        }
    });
    
    // Update button styles
    const btnExam = document.getElementById('btn-rank-exam');
    const btnSem = document.getElementById('btn-rank-sem');
    if (currentMode === 'exam') {
        btnExam.style.backgroundColor = '#3b82f6';
        btnExam.style.color = 'white';
        btnSem.style.backgroundColor = '#cbd5e1';
        btnSem.style.color = 'black';
    } else {
        btnSem.style.backgroundColor = '#3b82f6';
        btnSem.style.color = 'white';
        btnExam.style.backgroundColor = '#cbd5e1';
        btnExam.style.color = 'black';
    }
}
`;

rjs = rjs.replace(/\/\/ Render Table[\s\S]*?(?=\/\/ Event Listeners)/, newRenderRanking);
fs.writeFileSync('semester-ranking.js', rjs);

// Fix semester-honor-roll.js
let hjs = fs.readFileSync('semester-honor-roll.js', 'utf8');
hjs = hjs.replace("document.querySelector('.certificate-title h2')", "document.getElementById('report-month')");
hjs = hjs.replace("const container = document.getElementById('honor-roll-container');", "const container = document.getElementById('honor-list');");

fs.writeFileSync('semester-honor-roll.js', hjs);
console.log('Fixed JS IDs');
