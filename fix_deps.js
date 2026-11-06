const fs = require('fs');

function ensureClassManager(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Ensure theme.js and classManager.js are in head
    if (!content.includes('<script src="classManager.js"></script>')) {
        content = content.replace('</head>', '    <script src="theme.js"></script>\n    <script src="classManager.js"></script>\n</head>');
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    }
}

ensureClassManager('semester-ranking.html');
ensureClassManager('semester-honor-roll.html');
