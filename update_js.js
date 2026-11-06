const fs = require('fs');

const jsFiles = ['script.js', 'ranking.js', 'honor-roll.js', 'teacher.js', 'student-profile.js', 'summary-report.js'];

// List of keys that need to be scoped using window.getKey()
const keysToScope = [
    "'studentProfilesData'",
    "'studentGrades_មករា'",
    "'studentGrades_កុម្ភៈ'",
    "'studentGrades_មីនា'",
    "'studentGrades_មេសា'",
    "'studentGrades_ឧសភា'",
    "'studentGrades_មិថុនា'",
    "'studentGrades_កក្កដា'",
    "'studentGrades_សីហា'",
    "'studentGrades_កញ្ញា'",
    "'studentGrades_តុលា'",
    "'studentGrades_វិច្ឆិកា'",
    "'studentGrades_ធ្នូ'",
    "storageKey",
    "'teacherProfiles'",
    "'schoolRecords'",
    "'galleryRecords'"
];

jsFiles.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    keysToScope.forEach(key => {
        // Regex to match localStorage.getItem/setItem and replace the key argument
        // Replace getItem(key) -> getItem(window.getKey(key))
        const getRegex = new RegExp(`localStorage\\.getItem\\(\\s*${key}\\s*\\)`, 'g');
        content = content.replace(getRegex, `localStorage.getItem(window.getKey(${key}))`);
        
        // Replace setItem(key, val) -> setItem(window.getKey(key), val)
        const setRegex = new RegExp(`localStorage\\.setItem\\(\\s*${key}\\s*,`, 'g');
        content = content.replace(setRegex, `localStorage.setItem(window.getKey(${key}),`);
        
        // Replace removeItem(key) -> removeItem(window.getKey(key))
        const removeRegex = new RegExp(`localStorage\\.removeItem\\(\\s*${key}\\s*\\)`, 'g');
        content = content.replace(removeRegex, `localStorage.removeItem(window.getKey(${key}))`);
    });
    
    if (original !== content) {
        fs.writeFileSync(f, content);
        console.log('Updated ' + f);
    }
});
