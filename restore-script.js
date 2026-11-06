// restore-script.js - Automatically seeds initial data on new domains/browsers

(function autoSeedSystemData() {
    if (!window.AUTO_RESTORE_DATA) return;
    
    // If the system has already been initialized on this browser, never re-seed or overwrite
    if (localStorage.getItem('system_initialized') === 'true') {
        return;
    }
    
    // Check if initial student profile data is completely absent
    const profiles = localStorage.getItem('studentProfilesData');
    const isMissingData = profiles === null || profiles === undefined;
    
    if (isMissingData) {
        console.log("Initial installation: setting up default template data...");
        let restoredCount = 0;
        
        for (let key in window.AUTO_RESTORE_DATA) {
            if (window.AUTO_RESTORE_DATA.hasOwnProperty(key)) {
                let value = window.AUTO_RESTORE_DATA[key];
                if (typeof value === 'object' && value !== null) {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, value);
                }
                restoredCount++;
            }
        }
        
        localStorage.setItem('system_initialized', 'true');
        console.log("Successfully initialized default data.");
    } else {
        localStorage.setItem('system_initialized', 'true');
    }
})();
