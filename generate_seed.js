const fs = require('fs');
const data = JSON.parse(fs.readFileSync('pdf_data.json', 'utf8'));
const decode = (t) => decodeURIComponent(t.R[0].T);

// X mappings
const P12_X = {
    16.66: 'kh_1',
    18.69: 'kh_2',
    20.72: 'kh_3',
    22.71: 'kh_4',
    24.61: 'ma_1',
    32.62: 'ma_5'
};

const P45_X = {
    3.57: 'sc_2',
    7.60: 'sc_4',
    13.53: 'so_3',
    15.62: 'so_4',
    17.63: 'sp_1',
    19.63: 'sp_2'
};

const getCol = (x, mapping) => {
    for (let key in mapping) {
        if (Math.abs(x - parseFloat(key)) < 1) return mapping[key];
    }
    return null;
};

let students = [];

const parsePagePair = (pageLeft, pageRight) => {
    let rowsLeft = {};
    let rowsRight = {};
    
    // Group left by y
    data.Pages[pageLeft].Texts.forEach(t => {
        if (t.y > 7 && t.y < 25) {
            let ry = Math.round(t.y * 10) / 10;
            if (!rowsLeft[ry]) rowsLeft[ry] = [];
            rowsLeft[ry].push(t);
        }
    });
    
    // Group right by y
    data.Pages[pageRight].Texts.forEach(t => {
        if (t.y > 7 && t.y < 25) {
            let ry = Math.round(t.y * 10) / 10;
            if (!rowsRight[ry]) rowsRight[ry] = [];
            rowsRight[ry].push(t);
        }
    });
    
    // Match rows Left
    for (let y in rowsLeft) {
        let texts = rowsLeft[y];
        
        let idText = texts.find(t => Math.abs(t.x - 3.66) < 1);
        if (!idText) continue;
        let id = decode(idText).trim();
        
        // Find name (x from ~5.9 to ~15)
        let nameTexts = texts.filter(t => t.x > 5.8 && t.x < 15);
        nameTexts.sort((a,b) => a.x - b.x);
        let name = nameTexts.map(decode).join('').replace(/\s+/g, ' ').trim();
        
        // Find gender (x ~ 14.33 on Page 1, maybe ~13.5 on Page 2)
        // Actually gender is right before kh_1.
        let genderText = texts.find(t => t.x > 14 && t.x < 15.5 && ['ស', 'ប'].includes(decode(t).trim()));
        let gender = genderText ? decode(genderText).trim() : 'ស';
        // Clean name from gender
        if (name.endsWith('ស') || name.endsWith('ប')) {
            name = name.slice(0, -1).trim();
        }
        
        let grades = {
            kh_1:'', kh_2:'', kh_3:'', kh_4:'',
            ma_1:'', ma_2:'', ma_3:'', ma_4:'', ma_5:'',
            sc_1:'', sc_2:'', sc_3:'', sc_4:'',
            so_1:'', so_2:'', so_3:'', so_4:'',
            sp_1:'', sp_2:'', abs_1:''
        };
        
        // Map Left Grades
        texts.forEach(t => {
            let col = getCol(t.x, P12_X);
            if (col) grades[col] = decode(t).trim();
        });
        
        // Match Right Grades
        if (rowsRight[y]) {
            rowsRight[y].forEach(t => {
                let col = getCol(t.x, P45_X);
                if (col) grades[col] = decode(t).trim();
            });
        }
        
        // Hardcode specific bugfixes for names
        name = name.replace(/ស$/, '').replace(/ប$/, '').trim(); // strip trailing gender
        // For row 1: "កែម សុផាន់ណា" is extracted as "កែ ម ស ុ ផា ន ់ ណា" -> we let it be as OCR extracts it.
        // Actually, we can use existing localStorage names if ID matches! We just use ID.
        
        students.push({
            id: id,
            name: name,
            gender: gender,
            grades: grades
        });
    }
};

parsePagePair(0, 3); // Page 1 & 4
parsePagePair(1, 4); // Page 2 & 5

// Write to seed_data.js
let seedCode = `
const decemberGrades = ${JSON.stringify(students, null, 2)};

// Try to merge with existing student names to fix OCR spaces
const currentStudents = JSON.parse(localStorage.getItem('studentGrades_តុលា')) || [];
const nameMap = {};
currentStudents.forEach(s => {
    nameMap[s.id] = { name: s.name, gender: s.gender };
});

decemberGrades.forEach(s => {
    if (nameMap[s.id]) {
        s.name = nameMap[s.id].name;
        s.gender = nameMap[s.id].gender;
    }
});

// Calculate metrics
decemberGrades.forEach(student => {
    let total = 0;
    let count = 0;
    for (const subject in student.grades) {
        if (subject !== 'abs_1') { // Skip absence
            const val = parseFloat(student.grades[subject]);
            if (!isNaN(val)) {
                total += val;
                count++;
            }
        }
    }
    student.total = count > 0 ? parseFloat(total.toFixed(2)) : 0;
    student.average = count > 0 ? parseFloat((total / count).toFixed(2)) : 0;
});

// Rank
const sorted = [...decemberGrades].sort((a, b) => b.average - a.average);
let currentRank = 1;
for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].average < sorted[i - 1].average) {
        currentRank = i + 1;
    }
    sorted[i].rank = sorted[i].average > 0 ? currentRank : 0;
}

// Only seed once
if (!localStorage.getItem('december_2025_seeded')) {
    localStorage.setItem('studentGrades_ធ្នូ', JSON.stringify(decemberGrades));
    localStorage.setItem('december_2025_seeded', 'true');
    alert('ទិន្នន័យខែធ្នូ (December) ត្រូវបានទាញយកពី PDF និងបញ្ចូលដោយស្វ័យប្រវត្តិជោគជ័យ! សូមជ្រើសរើសខែ ធ្នូ ដើម្បីមើល។');
}
`;

fs.writeFileSync('seed_data.js', seedCode);
console.log("seed_data.js created successfully!");
