/**
 * push_backup_to_sheets.js
 * ស្គ្រីបសម្រាប់រុញទិន្នន័យពី JSON Backup ចូលទៅកាន់ Google Sheets ដោយផ្ទាល់
 * 
 * របៀបប្រើ៖
 * node push_backup_to_sheets.js "WEB_APP_URL"
 */

const fs = require('fs');
const path = require('path');

// 1. រកមើលឯកសារ Backup JSON
const candidates = [
  'C:/Users/User/Downloads/student-system-backup-2026-10-31-full-cleaned.json',
  'C:/Users/User/Downloads/student-system-backup-2026-10-31 (1).json',
  'C:/Users/User/Downloads/student-system-backup-2026-11-01 (2).json',
  'C:/Users/User/Downloads/student-system-backup-2026-11-02.json'
];

let jsonPath = candidates.find(p => fs.existsSync(p));
if (process.argv[3]) {
  jsonPath = process.argv[3];
}

if (!jsonPath || !fs.existsSync(jsonPath)) {
  console.error('❌ រកមិនឃើញឯកសារ Backup JSON ឡើយ!');
  process.exit(1);
}

console.log('📂 ប្រើប្រាស់ឯកសារ JSON:', jsonPath);
const backup = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 2. ទទួលយក Web App URL ពី Command line arguments
let webAppUrl = process.argv[2];

if (!webAppUrl) {
  console.log('\n⚠️ សូមបញ្ចូល Web App URL (ដែលបញ្ចប់ដោយ /exec)៖');
  console.log('ឧទាហរណ៍៖ node push_backup_to_sheets.js "https://script.google.com/macros/s/.../exec"\n');
  process.exit(0);
}

webAppUrl = webAppUrl.trim();
if (!webAppUrl.includes('/macros/s/') || !webAppUrl.endsWith('/exec')) {
  console.error('❌ Web App URL មិនត្រឹមត្រូវទេ! URL ត្រូវតែចាប់ផ្ដើមដោយ https://script.google.com/macros/s/ និងបញ្ចប់ដោយ /exec');
  process.exit(1);
}

// 3. Mock Browser Environment សម្រាប់ដំណើរការ google-sync.js
global.localStorage = {
  data: backup,
  get length() { return Object.keys(this.data).length; },
  key(i) { return Object.keys(this.data)[i]; },
  getItem(k) { return this.data[k] !== undefined ? this.data[k] : null; },
  setItem(k, v) { this.data[k] = v; },
  removeItem(k) { delete this.data[k]; }
};
global.window = global;
global.window.addEventListener = function() {};
global.document = {
  activeElement: null,
  getElementById: function() { return null; },
  querySelectorAll: function() { return []; },
  addEventListener: function() {}
};

const syncCode = fs.readFileSync(path.join(__dirname, 'google-sync.js'), 'utf8');
eval(syncCode);

const payload = window.collectFullSchoolData();
console.log('\n📊 ស្ថិតិទិន្នន័យដែលបានស្រង់ចេញពី JSON៖');
console.log(`- ឆ្នាំសិក្សាសកម្ម៖ ${payload.activeAcademicYear}`);
console.log(`- សិស្សសរុប៖ ${payload.studentCount} នាក់`);
console.log(`- ពិន្ទុប្រចាំខែ (តុលា ដល់ កក្កដា)៖ ${payload.monthlyGradesCount} ជួរ`);
console.log(`- ពិន្ទុប្រឡងឆមាស៖ ${payload.semesterGradesCount} ជួរ`);
console.log(`- ពិន្ទុប្រចាំឆ្នាំ៖ ${payload.annualGradesCount} ជួរ`);

// 4. បញ្ជូនទិន្នន័យទៅកាន់ Google Apps Script
console.log('\n⏳ កំពុងរុញទិន្នន័យទៅកាន់ Google Sheets...');

const safePayload = JSON.stringify({
  encoded: true,
  data: encodeURIComponent(JSON.stringify(payload))
});

fetch(webAppUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: safePayload
})
.then(res => res.text())
.then(text => {
  console.log('\n✅ ជោគជ័យ! ការឆ្លើយតបពី Google Apps Script:');
  console.log(text);
  console.log('\n🎉 ទិន្នន័យទាំងអស់ពី JSON ត្រូវបានរុញចូល Google Sheets រួចរាល់ ១០០%!');
})
.catch(err => {
  console.error('\n❌ មានបញ្ហាក្នុងការផ្ញើទិន្នន័យ:', err.message);
});

