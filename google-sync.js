/**
 * google-sync.js - Complete Google Sheets Synchronizer & Real-time Auto-Sync Engine
 * Captures full student details (Father, Mother, Guardian, Jobs, Address, POB, Phone, Equity Card, Orphan),
 * all monthly grades by month (តុលា, វិច្ឆិកា, ធ្នូ, មករា, កុម្ភៈ, មីនា, មេសា, ឧសភា, មិថុនា, កក្កដា),
 * semester exam grades, and system backup with 100% UTF-8 safe encoding (No Mojibake).
 */

(function () {
    // --- STORAGE QUOTA RECOVERY & PRUNING ENGINE ---
    // Protects localStorage against QuotaExceededError by eliminating redundant duplicates
    window.pruneStorageQuota = function (isEmergency = false) {
        if (typeof localStorage === 'undefined') return 0;
        let freedBytes = 0;

        try {
            // 1. Remove duplicate studentProfilesData_ay_2025_2026 (exact duplicate of studentProfilesData ~1.26MB)
            const baseProfile = localStorage.getItem('studentProfilesData');
            const aliasProfile = localStorage.getItem('studentProfilesData_ay_2025_2026');
            if (aliasProfile) {
                if (!baseProfile || baseProfile === '[]' || baseProfile === '{}') {
                    localStorage.setItem('studentProfilesData', aliasProfile);
                }
                freedBytes += aliasProfile.length;
                localStorage.removeItem('studentProfilesData_ay_2025_2026');
            }

            // 2. Remove redundant duplicate alias keys
            const duplicateAliases = [
                'studentProfilesData_default',
                'studentProfilesData_default_ay_2025_2026',
                'classList_ay_2025_2026',
                'academicYearList_ay_2025_2026',
                'schoolRecords_ay_2025_2026',
                'teacherProfiles_ay_2025_2026'
            ];
            duplicateAliases.forEach(k => {
                const val = localStorage.getItem(k);
                if (val !== null) {
                    freedBytes += val.length;
                    localStorage.removeItem(k);
                }
            });

            // 3. Remove empty, null, or corrupted keys
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (!k) continue;
                if (k === 'classList' || k === 'academicYearList' || k === 'activeClassId' || k === 'activeAcademicYearId') continue;
                const val = localStorage.getItem(k);
                if (val === null || val === '' || val === '[]' || val === '{}' || val === 'null' || val === 'undefined') {
                    freedBytes += (val ? val.length : 0);
                    localStorage.removeItem(k);
                }
            }

            // 4. Remove obsolete backup and temp dump keys in localStorage
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (!k) continue;
                if (k.startsWith('temp_') || k.startsWith('_temp_') || k.includes('_backup_old') || k.includes('plung_backup_temp')) {
                    const val = localStorage.getItem(k);
                    if (val) freedBytes += val.length;
                    localStorage.removeItem(k);
                }
            }

            // 5. Emergency Deep Cleanup: If emergency or storage is still critically full (>4MB)
            let totalSize = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k) {
                    const v = localStorage.getItem(k);
                    if (v) totalSize += k.length + v.length;
                }
            }

            if (isEmergency || totalSize > 4000000) {
                console.warn('⚠️ Storage near limit (' + (totalSize / 1024 / 1024).toFixed(2) + ' MB). Deduplicating redundant student photos...');
                const masterPhotos = new Map();
                try {
                    const mProfiles = JSON.parse(localStorage.getItem('studentProfilesData')) || [];
                    mProfiles.forEach(s => {
                        if (s && s.id && s.photo && s.photo.startsWith('data:image')) {
                            masterPhotos.set(String(s.id), s.photo);
                        }
                    });
                } catch (e) {}

                if (masterPhotos.size > 0) {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k && k.startsWith('studentProfilesData_') && k !== 'studentProfilesData') {
                            try {
                                const pList = JSON.parse(localStorage.getItem(k));
                                if (Array.isArray(pList)) {
                                    let modified = false;
                                    pList.forEach(s => {
                                        if (s && s.id && s.photo && masterPhotos.has(String(s.id))) {
                                            if (s.photo === masterPhotos.get(String(s.id))) {
                                                s.photo = '';
                                                modified = true;
                                            }
                                        }
                                    });
                                    if (modified) {
                                        const newStr = JSON.stringify(pList);
                                        const oldLen = (localStorage.getItem(k) || '').length;
                                        freedBytes += (oldLen - newStr.length);
                                        localStorage.setItem(k, newStr);
                                    }
                                }
                            } catch (e) {}
                        }
                    }
                }
            }

            if (freedBytes > 0) {
                console.log('🧹 Storage quota optimization completed: freed ' + (freedBytes / 1024).toFixed(1) + ' KB.');
            }
        } catch (err) {
            console.warn('Notice in pruneStorageQuota:', err);
        }

        return freedBytes;
    };

    // Global Photo Resolver fallback helper
    window.getStudentPhoto = function (studentId, preferredPhoto) {
        if (preferredPhoto) return preferredPhoto;
        if (!studentId) return '';
        const sKey = String(studentId).trim();
        try {
            const vault = JSON.parse(localStorage.getItem('student_photos_vault') || '{}');
            if (vault[sKey]) return vault[sKey];
        } catch (e) {}
        try {
            const mProfiles = JSON.parse(localStorage.getItem('studentProfilesData')) || [];
            const found = mProfiles.find(s => String(s.id).trim() === sKey);
            if (found && found.photo) return found.photo;
        } catch (e) {}
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('studentProfilesData_')) {
                try {
                    const list = JSON.parse(localStorage.getItem(k));
                    if (Array.isArray(list)) {
                        const found = list.find(s => String(s.id).trim() === sKey);
                        if (found && found.photo) return found.photo;
                    }
                } catch(e) {}
            }
        }
        return '';
    };

    // Run proactive cleanup immediately when script is evaluated
    try {
        window.pruneStorageQuota(false);
    } catch (e) {}

    // Helper to calculate total for an object of grade components
    function sumFields(gradesObj, prefixes) {
        if (!gradesObj) return '';
        let sum = 0;
        let hasAny = false;
        prefixes.forEach(p => {
            const val = parseFloat(gradesObj[p]);
            if (!isNaN(val)) {
                sum += val;
                hasAny = true;
            }
        });
        return hasAny ? Math.round(sum * 100) / 100 : '';
    }

    // Smart helper to extract Father, Mother, and Guardian names from any record
    function extractParents(s, crossMap) {
        let father = (s.fatherName || s.father_name || s.father || '').trim();
        let fatherJob = (s.fatherJob || s.father_job || '').trim();
        let mother = (s.motherName || s.mother_name || s.mother || '').trim();
        let motherJob = (s.motherJob || s.mother_job || '').trim();
        let guardian = (s.guardianName || s.guardian_name || s.guardian || s.parentName || s.parents || '').trim();
        let guardianJob = (s.guardianJob || s.guardian_job || '').trim();

        // 1. If guardian has " / " or "/", split into Father / Mother
        if ((!father || !mother) && guardian) {
            if (guardian.includes(' / ')) {
                const parts = guardian.split(' / ');
                if (!father && parts[0]) father = parts[0].trim();
                if (!mother && parts[1]) mother = parts[1].trim();
            } else if (guardian.includes('/')) {
                const parts = guardian.split('/');
                if (!father && parts[0]) father = parts[0].trim();
                if (!mother && parts[1]) mother = parts[1].trim();
            } else if (!father) {
                father = guardian.trim();
            }
        }

        // 2. Cross-reference fallback by student ID or Name
        const refKey = s.id || s.name;
        if (crossMap && refKey && crossMap[refKey]) {
            const ref = crossMap[refKey];
            if (!father && ref.fatherName) father = ref.fatherName.trim();
            if (!fatherJob && ref.fatherJob) fatherJob = ref.fatherJob.trim();
            if (!mother && ref.motherName) mother = ref.motherName.trim();
            if (!motherJob && ref.motherJob) motherJob = ref.motherJob.trim();
            if (!guardian && ref.guardian) guardian = ref.guardian.trim();
            if (!guardianJob && ref.guardianJob) guardianJob = ref.guardianJob.trim();
        }

        // 3. Build unified Combined Parents / Guardian string
        let combinedParents = '';
        if (father && mother) {
            combinedParents = `${father} / ${mother}`;
        } else if (father) {
            combinedParents = father;
        } else if (mother) {
            combinedParents = mother;
        } else if (guardian) {
            combinedParents = guardian;
        }

        return {
            fatherName: father,
            fatherJob: fatherJob || (father ? 'កសិករ' : ''),
            motherName: mother,
            motherJob: motherJob || (mother ? 'កសិករ' : ''),
            guardianName: combinedParents || guardian,
            guardianJob: guardianJob
        };
    }

    // Build cross-reference map across all localStorage keys
    function buildCrossReferenceMap() {
        const map = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            try {
                const raw = localStorage.getItem(k);
                if (raw && (raw.startsWith('[') || raw.startsWith('{'))) {
                    const parsed = JSON.parse(raw);
                    const list = Array.isArray(parsed) ? parsed : Object.values(parsed);
                    list.forEach(item => {
                        if (!item || typeof item !== 'object') return;
                        const key = item.id || item.name;
                        if (!key) return;
                        if (!map[key]) map[key] = {};
                        const cur = map[key];

                        if (item.fatherName && !cur.fatherName) cur.fatherName = item.fatherName;
                        if (item.fatherJob && !cur.fatherJob) cur.fatherJob = item.fatherJob;
                        if (item.motherName && !cur.motherName) cur.motherName = item.motherName;
                        if (item.motherJob && !cur.motherJob) cur.motherJob = item.motherJob;
                        if (item.guardian && !cur.guardian) cur.guardian = item.guardian;
                        if (item.guardianName && !cur.guardianName) cur.guardianName = item.guardianName;
                        if (item.phone && !cur.phone) cur.phone = item.phone;
                        if (item.pob && !cur.pob) cur.pob = item.pob;
                        if (item.address && !cur.address) cur.address = item.address;
                        if (item.dob && !cur.dob) cur.dob = item.dob;
                        if (item.age && !cur.age) cur.age = item.age;
                    });
                }
            } catch (e) { }
        }
        return map;
    }

    // Helper to format DOB to DD-MM-YYYY (100% Comprehensive: handles Date object, GMT, ISO, YYYY-MM-DD, etc.)
    function formatDOBDisplay(dob) {
        if (!dob) return '';
        if (dob instanceof Date) {
            const d = String(dob.getDate()).padStart(2, '0');
            const m = String(dob.getMonth() + 1).padStart(2, '0');
            const y = dob.getFullYear();
            return `${d}-${m}-${y}`;
        }
        const str = dob.toString().trim();
        if (!str || str === '-' || str === 'null' || str === 'undefined') return '';

        // Check GMT / ISO / Indochina timestamp e.g. "Wed Jun 03 2015 00:00:00 GMT+0700"
        if (str.includes('GMT') || str.includes('Indochina') || str.includes('T') || (isNaN(str) && !str.includes('-') && !str.includes('/') && !isNaN(Date.parse(str)))) {
            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
                const d = String(parsed.getDate()).padStart(2, '0');
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                const y = parsed.getFullYear();
                if (y > 1900 && y < 2100) return `${d}-${m}-${y}`;
            }
        }

        // YYYY-MM-DD or DD-MM-YYYY
        if (str.includes('-')) {
            const parts = str.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
                } else if (parts[2].length === 4) {
                    return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
                }
            }
        }

        // YYYY/MM/DD or DD/MM/YYYY
        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
                } else if (parts[2].length === 4) {
                    return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
                }
            }
        }

        return str;
    }

    // Helper to compute age
    function calculateStudentAge(dob) {
        if (!dob) return '';
        try {
            const formatted = formatDOBDisplay(dob);
            if (!formatted) return '';
            const parts = formatted.split('-');
            if (parts.length === 3 && parts[2].length === 4) {
                const birthYear = parseInt(parts[2], 10);
                const currentYear = new Date().getFullYear();
                const diff = currentYear - birthYear;
                if (diff >= 4 && diff <= 25) return diff + ' ឆ្នាំ';
            }
        } catch (e) { }
        return '';
    }

    // Month chronological order in Cambodian school year
    const SCHOOL_MONTHS = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា'];

    // Master Data Collector across ALL classes and ALL localStorage keys
    window.collectFullSchoolData = function () {
        const crossMap = buildCrossReferenceMap();
        const allProfiles = [];
        const seenProfileKeys = new Set();
        const allMonthlyGrades = [];
        const allSemesterGrades = [];
        const allAnnualGrades = [];

        // Get classes from classManager
        let classList = [];
        if (window.classManager && typeof window.classManager.getClasses === 'function') {
            classList = window.classManager.getClasses();
        }
        if (!classList || classList.length === 0) {
            try {
                classList = JSON.parse(localStorage.getItem('classList')) || [];
            } catch (e) { }
        }
        if (!classList || classList.length === 0) {
            classList = [
                { id: 'class_g1_k', name: 'ថ្នាក់ទី ១ ក' },
                { id: 'class_g2_k', name: 'ថ្នាក់ទី ២ ក' },
                { id: 'class_g3_k', name: 'ថ្នាក់ទី ៣ ក' },
                { id: 'class_g4_k', name: 'ថ្នាក់ទី ៤ ក' },
                { id: 'default', name: 'ថ្នាក់ទី ៥ ក' },
                { id: 'class_g6_k', name: 'ថ្នាក់ទី ៦ ក' }
            ];
        }

        const classMap = {};
        classList.forEach(c => { classMap[c.id] = c.name; });

        // Get academic years from classManager
        let academicYears = [];
        if (window.classManager && typeof window.classManager.getAcademicYears === 'function') {
            academicYears = window.classManager.getAcademicYears();
        }
        if (!academicYears || academicYears.length === 0) {
            try {
                academicYears = JSON.parse(localStorage.getItem('academicYearList')) || [];
            } catch (e) { }
        }
        if (!academicYears || academicYears.length === 0) {
            academicYears = [
                { id: 'ay_2023_2024', name: '២០២៣ - ២០២៤' },
                { id: 'ay_2024_2025', name: '២០២៤ - ២០២៥' },
                { id: 'ay_2025_2026', name: '២០២៥ - ២០២៦' },
                { id: 'ay_2026_2027', name: '២០២៦ - ២០២៧' }
            ];
        }

        const activeAcademicYearName = (window.classManager && typeof window.classManager.getCurrentAcademicYearName === 'function')
            ? window.classManager.getCurrentAcademicYearName()
            : (localStorage.getItem('academicYear') || localStorage.getItem('currentAcademicYear') || localStorage.getItem('schoolYear') || '២០២៥ - ២០២៦');

        // Smart parser to extract Academic Year and Class Name from ANY key
        function parseKeyYearAndClass(key) {
            let matchedYear = '';
            let matchedClass = '';

            // 1. Determine Academic Year from key
            for (const y of academicYears) {
                if (key.includes(y.id)) {
                    matchedYear = y.name;
                    break;
                }
            }
            if (!matchedYear) {
                for (const y of academicYears) {
                    const cleanYName = y.name.replace(/[\s\-_]/g, '');
                    const cleanKey = key.replace(/[\s\-_]/g, '');
                    if (cleanKey.includes(cleanYName)) {
                        matchedYear = y.name;
                        break;
                    }
                }
            }
            if (!matchedYear) {
                matchedYear = '២០២៥ - ២០២៦'; // Base year for all legacy non-year-suffixed keys
            }

            // 2. Determine Class Name from key
            for (const c of classList) {
                if (key.includes(c.id)) {
                    matchedClass = c.name;
                    break;
                }
            }
            if (!matchedClass && key.includes('class_1786957637327')) {
                matchedClass = 'ថ្នាក់ទី ៣ ក';
            }
            if (!matchedClass) {
                matchedClass = classMap['default'] || 'ថ្នាក់ទី ៥ ក';
            }

            return { academicYear: matchedYear, className: matchedClass };
        }

        // Active month fallback
        const fallbackMonth = localStorage.getItem('lastSelectedMonth') || 'តុលា';

        // 1. Scan ALL student profile keys in localStorage (across all classes and all years)
        const profileKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('studentProfilesData')) {
                profileKeys.push(k);
            }
        }
        if (!profileKeys.includes('studentProfilesData')) {
            profileKeys.unshift('studentProfilesData');
        }

        profileKeys.forEach(pKey => {
            let profs = [];
            try {
                const raw = localStorage.getItem(pKey);
                if (raw) profs = JSON.parse(raw) || [];
            } catch (e) { }

            const info = parseKeyYearAndClass(pKey);
            let deletedStudentIdsList = [];
            try { deletedStudentIdsList = JSON.parse(localStorage.getItem('user_deleted_student_ids') || '[]'); } catch(e){}

            if (Array.isArray(profs)) {
                profs.forEach(p => {
                    if (!p || (!p.id && !p.name)) return;
                    if (p.id && deletedStudentIdsList.includes(String(p.id).trim())) return;

                    const pYear = (p.academicYear || p.schoolYear || p.year || info.academicYear).trim();
                    const pClass = (p.className || info.className).trim();

                    const dedupeKey = pYear + '_' + pClass + '_' + (p.id || p.name);
                    if (seenProfileKeys.has(dedupeKey)) return;
                    seenProfileKeys.add(dedupeKey);

                    // Extract parents with smart split & cross-reference
                    const parentsInfo = extractParents(p, crossMap);

                    // Combine POB
                    const pobParts = [
                        p.pobVillage ? 'ភូមិ' + p.pobVillage : '',
                        p.pobCommune ? 'ឃុំ' + p.pobCommune : '',
                        p.pobDistrict ? 'ស្រុក' + p.pobDistrict : '',
                        p.pobProvince ? 'ខេត្ត' + p.pobProvince : (p.pob || '')
                    ].filter(Boolean);
                    const fullPob = pobParts.join(' ') || p.pob || '';

                    // Combine Current Address
                    const curParts = [
                        p.currHouse ? 'ផ្ទះ' + p.currHouse : '',
                        p.currVillage ? 'ភូមិ' + p.currVillage : '',
                        p.currCommune ? 'ឃុំ' + p.currCommune : '',
                        p.currDistrict ? 'ស្រុក' + p.currDistrict : '',
                        p.currProvince ? 'ខេត្ត' + p.currProvince : (p.address || '')
                    ].filter(Boolean);
                    const fullAddress = curParts.join(' ') || p.address || '';

                    // Family members
                    let famStr = '';
                    const tot = p.familyMembersTot !== undefined && p.familyMembersTot !== '' ? p.familyMembersTot : (p.familyMembers || '');
                    const fem = p.familyMembersFem !== undefined && p.familyMembersFem !== '' ? p.familyMembersFem : (p.familyFemales || '');
                    if (tot || fem) {
                        famStr = `${tot || 0} នាក់ (ស្រី ${fem || 0})`;
                    }

                    const dobFormatted = formatDOBDisplay(p.dob);
                    const ageCalculated = p.age || calculateStudentAge(p.dob);

                    allProfiles.push({
                        academicYear: pYear,
                        className: pClass,
                        id: p.id || '',
                        name: p.name || '',
                        gender: p.gender === 'ប្រុស' ? 'ប' : (p.gender === 'ស្រី' ? 'ស' : (p.gender || '')),
                        dob: dobFormatted,
                        age: ageCalculated,
                        status: p.status || 'កំពុងរៀន',
                        fatherName: parentsInfo.fatherName,
                        fatherJob: parentsInfo.fatherJob,
                        motherName: parentsInfo.motherName,
                        motherJob: parentsInfo.motherJob,
                        guardianName: parentsInfo.guardianName,
                        guardianJob: parentsInfo.guardianJob,
                        phone: p.phone || '',
                        pob: fullPob,
                        address: fullAddress,
                        equityCard: p.equityCard || p.poorCard || 'គ្មាន',
                        equityCardNo: p.equityCardNo || '',
                        orphanStatus: p.orphanStatus || 'មិនកំព្រា',
                        familyMembers: famStr,
                        difficulty: Array.isArray(p.difficulty) ? p.difficulty.join(', ') : (p.difficulty || ''),
                        photo: p.photo || window.getStudentPhoto(p.id) || ''
                    });
                });
            }
        });

        function getClassOrder(cName) {
            if (!cName) return 99;
            if (cName.includes('១') || cName.includes('1')) return 1;
            if (cName.includes('២') || cName.includes('2')) return 2;
            if (cName.includes('៣') || cName.includes('3')) return 3;
            if (cName.includes('៤') || cName.includes('4')) return 4;
            if (cName.includes('៥') || cName.includes('5')) return 5;
            if (cName.includes('៦') || cName.includes('6')) return 6;
            return 99;
        }

        // Sort allProfiles: Academic Year -> Class Name (Grade 1 to 6) -> Student ID / Name
        allProfiles.sort((a, b) => {
            if (a.academicYear !== b.academicYear) return a.academicYear.localeCompare(b.academicYear, 'km');
            const oA = getClassOrder(a.className);
            const oB = getClassOrder(b.className);
            if (oA !== oB) return oA - oB;
            const idA = parseInt(a.id, 10) || 0;
            const idB = parseInt(b.id, 10) || 0;
            if (idA && idB && idA !== idB) return idA - idB;
            return (a.name || '').localeCompare(b.name || '', 'km');
        });

        // 1.1. Build Fast Profile Lookup by (className + '_' + id) and by (id)
        const profileLookup = {};
        allProfiles.forEach(p => {
            const pId = String(p.id || '').trim();
            const pClass = String(p.className || '').trim();
            const pName = (p.name || '').trim();
            if (pId && pName && !pName.includes('áž') && !pName.includes('\ufffd')) {
                profileLookup[pId] = p;
                if (pClass) {
                    profileLookup[pClass + '_' + pId] = p;
                }
            }
        });

        // 2. Build Score Map from ALL localStorage grade keys
        const monthlyScoreMap = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;

            if (k.startsWith('studentGrades_') && !k.includes('sem')) {
                let monthName = '';
                for (const m of SCHOOL_MONTHS) {
                    if (k.includes(m)) {
                        monthName = m;
                        break;
                    }
                }
                if (!monthName) {
                    if (k.includes('october') || k.includes('តុលា')) monthName = 'តុលា';
                    else if (k.includes('november') || k.includes('វិច្ឆិកា')) monthName = 'វិច្ឆិកា';
                    else if (k.includes('december') || k.includes('ធ្នូ')) monthName = 'ធ្នូ';
                    else monthName = fallbackMonth;
                }

                const info = parseKeyYearAndClass(k);

                try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const gradeList = JSON.parse(raw);
                        if (Array.isArray(gradeList) && gradeList.length > 0) {
                            let listModified = false;
                            gradeList.forEach(g => {
                                if (!g || (!g.id && !g.name)) return;
                                const gYear = (g.academicYear || g.schoolYear || info.academicYear).trim();
                                const gClass = (g.className || info.className).trim();
                                const sId = String(g.id || '').trim();
                                const gObj = g.grades || {};

                                const khScore = sumFields(gObj, ['kh_1', 'kh_2', 'kh_3', 'kh_4']);
                                const maScore = sumFields(gObj, ['ma_1', 'ma_2', 'ma_3', 'ma_4', 'ma_5']);
                                const scScore = sumFields(gObj, ['sc_1', 'sc_2', 'sc_3', 'sc_4', 'sc_5']);
                                const soScore = sumFields(gObj, ['so_1', 'so_2', 'so_3', 'so_4']);
                                const peScore = sumFields(gObj, ['sp_1', 'sp_2', 'sp_3']);
                                const enScore = gObj.en_1 !== undefined ? gObj.en_1 : '';
                                const absScore = gObj.abs_1 !== undefined ? gObj.abs_1 : '';

                                // Auto-repair student name and gender from Profile (SSOT)
                                const matchedP = profileLookup[gClass + '_' + sId] || profileLookup[sId];
                                if (matchedP && matchedP.name) {
                                    if (g.name !== matchedP.name || (g.name && (g.name.includes('áž') || g.name.includes('\ufffd')))) {
                                        g.name = matchedP.name;
                                        listModified = true;
                                    }
                                    if (matchedP.gender) {
                                        g.gender = (matchedP.gender === 'ប្រុស' || matchedP.gender === 'ប') ? 'ប' : 'ស';
                                    }
                                }

                                const scoreRecord = {
                                    khmer: khScore,
                                    math: maScore,
                                    science: scScore,
                                    social: soScore,
                                    pe: peScore,
                                    english: enScore,
                                    absences: absScore,
                                    total: g.total !== undefined ? g.total : '',
                                    average: g.average !== undefined ? g.average : '',
                                    rank: g.rank !== undefined ? g.rank : ''
                                };

                                const k1 = `${gYear}_${gClass}_${monthName}_${sId}`;
                                const k2 = `${gYear}_${monthName}_${sId}`;
                                const k3 = `${monthName}_${sId}`;

                                if (!monthlyScoreMap[k1] || scoreRecord.total !== '') monthlyScoreMap[k1] = scoreRecord;
                                if (!monthlyScoreMap[k2] || scoreRecord.total !== '') monthlyScoreMap[k2] = scoreRecord;
                                if (!monthlyScoreMap[k3] || scoreRecord.total !== '') monthlyScoreMap[k3] = scoreRecord;
                            });

                            if (listModified) {
                                try { localStorage.setItem(k, JSON.stringify(gradeList)); } catch (saveErr) { }
                            }
                        }
                    }
                } catch (e) { }
            }
        }

        // 3. Generate Monthly Grades based on Profile Roster (Single Source of Truth)
        // Group profiles by Academic Year and Class
        const studentsByYearAndClass = {};
        allProfiles.forEach(p => {
            const yr = p.academicYear || '២០២៥ - ២០២៦';
            const cls = p.className || 'ថ្នាក់ទី ១ ក';
            if (!studentsByYearAndClass[yr]) studentsByYearAndClass[yr] = {};
            if (!studentsByYearAndClass[yr][cls]) studentsByYearAndClass[yr][cls] = [];
            studentsByYearAndClass[yr][cls].push(p);
        });

        // For each Academic Year
        const sortedAcademicYears = Object.keys(studentsByYearAndClass).sort((a, b) => a.localeCompare(b, 'km'));
        sortedAcademicYears.forEach(yr => {
            const classObj = studentsByYearAndClass[yr];
            const sortedClasses = Object.keys(classObj).sort((a, b) => {
                const oA = getClassOrder(a);
                const oB = getClassOrder(b);
                if (oA !== oB) return oA - oB;
                return a.localeCompare(b, 'km');
            });

            // For each Month (តុលា ដល់ កក្កដា)
            SCHOOL_MONTHS.forEach(mName => {
                // For each Class in strict order (Grade 1 -> Grade 6)
                sortedClasses.forEach(clsName => {
                    const classStudents = classObj[clsName];
                    classStudents.forEach(s => {
                        const sId = String(s.id || '').trim();
                        const k1 = `${yr}_${clsName}_${mName}_${sId}`;
                        const k2 = `${yr}_${mName}_${sId}`;
                        const k3 = `${mName}_${sId}`;
                        const sc = monthlyScoreMap[k1] || monthlyScoreMap[k2] || monthlyScoreMap[k3] || {};

                        allMonthlyGrades.push({
                            academicYear: yr,
                            className: clsName,
                            month: mName,
                            id: sId,
                            name: s.name,      // 100% matches student profile!
                            gender: s.gender,  // 100% matches student profile!
                            khmer: sc.khmer !== undefined ? sc.khmer : '',
                            math: sc.math !== undefined ? sc.math : '',
                            science: sc.science !== undefined ? sc.science : '',
                            social: sc.social !== undefined ? sc.social : '',
                            pe: sc.pe !== undefined ? sc.pe : '',
                            english: sc.english !== undefined ? sc.english : '',
                            absences: sc.absences !== undefined ? sc.absences : '',
                            total: sc.total !== undefined ? sc.total : '',
                            average: sc.average !== undefined ? sc.average : '',
                            rank: sc.rank !== undefined ? sc.rank : ''
                        });
                    });
                });
            });
        });

        // 4. Scan ALL semester exam grades and map to Score Map
        const semScoreMap = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;

            if (k.startsWith('semester1ExamGrades') || k.startsWith('semester2ExamGrades') || k.startsWith('studentGrades_sem')) {
                const semName = (k.includes('2') || k.includes('sem2')) ? 'ឆមាសទី២' : 'ឆមាសទី១';
                const info = parseKeyYearAndClass(k);

                try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const semList = JSON.parse(raw);
                        if (Array.isArray(semList) && semList.length > 0) {
                            let semModified = false;
                            semList.forEach(g => {
                                if (!g || (!g.id && !g.name)) return;
                                const gYear = (g.academicYear || g.schoolYear || info.academicYear).trim();
                                const gClass = (g.className || info.className).trim();
                                const sId = String(g.id || '').trim();

                                const matchedP = profileLookup[gClass + '_' + sId] || profileLookup[sId];
                                if (matchedP && matchedP.name) {
                                    if (g.name !== matchedP.name || (g.name && (g.name.includes('áž') || g.name.includes('\ufffd')))) {
                                        g.name = matchedP.name;
                                        semModified = true;
                                    }
                                    if (matchedP.gender) {
                                        g.gender = (matchedP.gender === 'ប្រុស' || matchedP.gender === 'ប') ? 'ប' : 'ស';
                                    }
                                }

                                const rec = {
                                    total: g.total !== undefined ? g.total : (g.sem_avg ? Math.round(g.sem_avg * 10) : ''),
                                    average: g.sem_avg !== undefined ? g.sem_avg : (g.average !== undefined ? g.average : ''),
                                    rank: g.rank !== undefined ? g.rank : ''
                                };

                                semScoreMap[`${gYear}_${gClass}_${semName}_${sId}`] = rec;
                                semScoreMap[`${gYear}_${semName}_${sId}`] = rec;
                                semScoreMap[`${semName}_${sId}`] = rec;
                            });

                            if (semModified) {
                                try { localStorage.setItem(k, JSON.stringify(semList)); } catch (saveErr) { }
                            }
                        }
                    }
                } catch (e) { }
            }
        }

        // Generate Semester Grades based on Profile Roster (SSOT)
        sortedAcademicYears.forEach(yr => {
            const classObj = studentsByYearAndClass[yr];
            const sortedClasses = Object.keys(classObj).sort((a, b) => {
                const oA = getClassOrder(a);
                const oB = getClassOrder(b);
                if (oA !== oB) return oA - oB;
                return a.localeCompare(b, 'km');
            });

            ['ឆមាសទី១', 'ឆមាសទី២'].forEach(semName => {
                sortedClasses.forEach(clsName => {
                    classObj[clsName].forEach(s => {
                        const sId = String(s.id || '').trim();
                        const sc = semScoreMap[`${yr}_${clsName}_${semName}_${sId}`] ||
                            semScoreMap[`${yr}_${semName}_${sId}`] ||
                            semScoreMap[`${semName}_${sId}`] || {};

                        allSemesterGrades.push({
                            academicYear: yr,
                            className: clsName,
                            semester: semName,
                            id: sId,
                            name: s.name,
                            gender: s.gender,
                            total: sc.total !== undefined ? sc.total : '',
                            average: sc.average !== undefined ? sc.average : '',
                            rank: sc.rank !== undefined ? sc.rank : ''
                        });
                    });
                });
            });
        });

        // 5. Scan ALL annual exam grades and map to Score Map
        const annualScoreMap = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;

            if (k.startsWith('annualExamGrades') || k.startsWith('annualGrades')) {
                const info = parseKeyYearAndClass(k);
                try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const annList = JSON.parse(raw);
                        if (Array.isArray(annList) && annList.length > 0) {
                            let annModified = false;
                            annList.forEach(g => {
                                if (!g || (!g.id && !g.name)) return;
                                const gYear = (g.academicYear || g.schoolYear || info.academicYear).trim();
                                const gClass = (g.className || info.className).trim();
                                const sId = String(g.id || '').trim();

                                const matchedP = profileLookup[gClass + '_' + sId] || profileLookup[sId];
                                if (matchedP && matchedP.name) {
                                    if (g.name !== matchedP.name || (g.name && (g.name.includes('áž') || g.name.includes('\ufffd')))) {
                                        g.name = matchedP.name;
                                        annModified = true;
                                    }
                                    if (matchedP.gender) {
                                        g.gender = (matchedP.gender === 'ប្រុស' || matchedP.gender === 'ប') ? 'ប' : 'ស';
                                    }
                                }

                                const rec = {
                                    average: g.annual_avg !== undefined ? g.annual_avg : (g.average !== undefined ? g.average : ''),
                                    grade: g.annual_grade || g.grade || '',
                                    rank: g.rank !== undefined ? g.rank : ''
                                };

                                annualScoreMap[`${gYear}_${gClass}_${sId}`] = rec;
                                annualScoreMap[`${gYear}_${sId}`] = rec;
                                annualScoreMap[`${sId}`] = rec;
                            });

                            if (annModified) {
                                try { localStorage.setItem(k, JSON.stringify(annList)); } catch (saveErr) { }
                            }
                        }
                    }
                } catch (e) { }
            }
        }

        // Generate Annual Grades based on Profile Roster (SSOT)
        sortedAcademicYears.forEach(yr => {
            const classObj = studentsByYearAndClass[yr];
            const sortedClasses = Object.keys(classObj).sort((a, b) => {
                const oA = getClassOrder(a);
                const oB = getClassOrder(b);
                if (oA !== oB) return oA - oB;
                return a.localeCompare(b, 'km');
            });

            sortedClasses.forEach(clsName => {
                classObj[clsName].forEach(s => {
                    const sId = String(s.id || '').trim();
                    const sc = annualScoreMap[`${yr}_${clsName}_${sId}`] ||
                        annualScoreMap[`${yr}_${sId}`] ||
                        annualScoreMap[`${sId}`] || {};

                    allAnnualGrades.push({
                        academicYear: yr,
                        className: clsName,
                        id: sId,
                        name: s.name,
                        gender: s.gender,
                        average: sc.average !== undefined ? sc.average : '',
                        grade: sc.grade !== undefined ? sc.grade : '',
                        rank: sc.rank !== undefined ? sc.rank : ''
                    });
                });
            });
        });

        // 5. Raw system backup
        const backupRaw = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && !k.startsWith('theme_') && k !== 'redirectAfterLogin' && k !== 'studentProfilesData_ay_2025_2026') {
                backupRaw[k] = localStorage.getItem(k);
            }
        }

        return {
            action: 'sync_full_school_data',
            timestamp: new Date().toISOString(),
            activeAcademicYear: activeAcademicYearName,
            academicYears: academicYears,
            classes: classList,
            studentCount: allProfiles.length,
            students: allProfiles,
            monthlyGradesCount: allMonthlyGrades.length,
            monthlyGrades: allMonthlyGrades,
            semesterGradesCount: allSemesterGrades.length,
            semesterGrades: allSemesterGrades,
            annualGradesCount: allAnnualGrades.length,
            annualGrades: allAnnualGrades,
            backupJson: JSON.stringify(backupRaw)
        };
    };

    // Storage key and URL isolation for សាលាបឋមសិក្សា ផ្លុង
    const STORAGE_KEY_PLUNG = 'google_sheets_url_plung';
    const WRONG_URLS_FOR_PLUNG = [
        "https://script.google.com/macros/s/AKfycbwMN6Irm6AEejmoWwwx3VfTNjWRj4HcUBdF8CPSBIIjSx1WxkxL9OQ8uCRmngKLQ5e6/exec",
        "https://script.google.com/macros/s/AKfycbxtgAwfKwgDqM3GRE_0R5wMZ25xa7ugQizgcvET2LPkQuVmfXOz4Jgl86cssLqsAaQ7Ow/exec",
        "https://script.google.com/macros/s/AKfycbwiVxxoIP8CNVfclVMLM-C99gsi_39dTTD1rdzyejcvVWtwhFhbFbueIOBTNQL5FIFdtQ/exec"
    ];
    if (typeof localStorage !== 'undefined') {
        const curPlung = localStorage.getItem(STORAGE_KEY_PLUNG);
        if (curPlung && WRONG_URLS_FOR_PLUNG.includes(curPlung)) {
            localStorage.removeItem(STORAGE_KEY_PLUNG);
        }
        const curGeneral = localStorage.getItem('google_sheets_url');
        if (curGeneral && WRONG_URLS_FOR_PLUNG.includes(curGeneral)) {
            localStorage.removeItem('google_sheets_url');
        }
    }

    // Default Google Sheets Web App URL for សាលាបឋមសិក្សា ផ្លុង (Shared across teachers)
    window.DEFAULT_GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxV7BGvlcu_ccPxAJVuokFKKoPNjy1Shf5fnnvPe9eAJWInSkdrpSIBYqTs4FNU7-V5Qw/exec";

    window.getGoogleSheetsUrl = function () {
        let stored = (typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_PLUNG) || localStorage.getItem('google_sheets_url')) : '') || '';
        if (stored && WRONG_URLS_FOR_PLUNG.includes(stored)) {
            localStorage.removeItem(STORAGE_KEY_PLUNG);
            localStorage.removeItem('google_sheets_url');
            stored = '';
        }
        return (stored || window.DEFAULT_GOOGLE_SHEETS_URL || '').trim();
    };

    // Central function to send full data to Google Apps Script (100% UTF-8 Safe)
    // Direct Single-Student Real-time Sync API (Matches Vue 3 & Apps Script Architecture)
    window.clearGoogleSheetClass = async function(className, academicYear) {
        const sheetUrl = window.getGoogleSheetsUrl();
        if (!sheetUrl) return;
        try {
            await fetch(sheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'clear_class',
                    className: className || 'ថ្នាក់ទី ៦ ក',
                    academicYear: academicYear || '២០២៦ - ២០២៧'
                })
            });
            console.log('✅ Google Sheets clear_class sync sent for:', className);
        } catch(err) {
            console.warn('Google Sheets clear_class notice:', err);
        }
    };

    window.deleteStudentFromGoogleSheets = async function(studentId) {
        const sheetUrl = window.getGoogleSheetsUrl();
        if (!sheetUrl || !studentId) return;
        try {
            await fetch(sheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'delete', id: String(studentId).trim() })
            });
            console.log('✅ Google Sheets delete sync completed for ID:', studentId);
            if (typeof window.updateSyncStatus === 'function') window.updateSyncStatus('success');
            if (typeof showToastNotification === 'function') {
                showToastNotification(`☁️ បានលុបសិស្ស (ID: ${studentId}) ពី Google Sheets!`);
            }
        } catch(err) {
            console.warn('Google Sheets delete sync notice:', err);
        }
    };

    window.updateStudentInGoogleSheets = async function(student) {
        const sheetUrl = window.getGoogleSheetsUrl();
        if (!sheetUrl || !student || !student.id) return;
        try {
            await fetch(sheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'update', student: student })
            });
            console.log('✅ Google Sheets update sync completed for ID:', student.id);
            if (typeof window.updateSyncStatus === 'function') window.updateSyncStatus('success');
            if (typeof showToastNotification === 'function') {
                showToastNotification(`☁️ បានកែប្រែ «${student.name}» ក្នុង Google Sheets!`);
            }
        } catch(err) {
            console.warn('Google Sheets update sync notice:', err);
        }
    };

    window.syncAllToGoogleSheets = async function (isSilent = false) {
        let sheetUrl = window.getGoogleSheetsUrl();
        const inputEl = document.getElementById('google-sheets-url');
        if (inputEl && inputEl.value.trim()) {
            sheetUrl = inputEl.value.trim();
            localStorage.setItem(STORAGE_KEY_PLUNG, sheetUrl);
        }

        if (!sheetUrl) {
            if (!isSilent) {
                alert('⚠️ មិនទាន់មាន Web App URL សម្រាប់សាលាបឋមសិក្សា ផ្លុង នៅឡើយទេ!\n\nសូមចូលទៅកាន់ការកំណត់ (Settings ⚙️) រួចបិទភ្ជាប់ (Paste) Web App URL នៃ Google Sheet របស់សាលា ផ្លុង។');
                if (typeof openSettingsModal === 'function') {
                    openSettingsModal();
                }
            }
            return;
        }

        // Validate that the URL is a real Web App URL (ends with /exec, starts with https://script.google.com/macros/s/)
        const cleanCheckUrl = sheetUrl.trim().split('?')[0].replace(/\/+$/, '');
        const isValidUrl = cleanCheckUrl.includes('/macros/s/') && cleanCheckUrl.endsWith('/exec') && !cleanCheckUrl.includes('/library/') && !cleanCheckUrl.includes('/edit') && !cleanCheckUrl.includes('/projects/');
        if (!isValidUrl) {
            if (!isSilent) {
                alert('⚠️ URL ដែលអ្នកបានបញ្ចូលមិនទាន់ត្រឹមត្រូវទេ!\n\n' +
                    'URL បច្ចុប្បន្ន៖ ' + sheetUrl + '\n\n' +
                    'នេះជា Link របស់ Library ឬ Script Editor មិនមែនជា Web App URL សម្រាប់បញ្ជូនទិន្នន័យទេ។\n\n' +
                    '👉 របៀបយក Web App URL ត្រឹមត្រូវ (ក្នុង Google Apps Script) ៖\n' +
                    '១. ចុចប៊ូតុងពណ៌ខៀវ "Deploy" (នៅជ្រុងលើខាងស្ដាំ) > ជ្រើស "New deployment"\n' +
                    '២. ចុចលើរូបកង់ ⚙️ (Select type) > ជ្រើសរើស "Web app"\n' +
                    '៣. កន្លែង "Who has access" ត្រូវជ្រើសរើស "Anyone" (សំខាន់បំផុត)\n' +
                    '៤. ចុច "Deploy" រួចចុច "Copy" យក Web app URL (ដែលបញ្ចប់ដោយ /exec)\n' +
                    '៥. យកមក Paste ក្នុងប្រអប់កំណត់នេះ រួចចុច "រក្សាទុក"!');
            } else {
                console.warn('Google Auto-Sync Skipped: Invalid Web App URL (' + sheetUrl + '). URL must end with /exec');
            }
            return;
        }

        const syncButtons = document.querySelectorAll('button[onclick*="exportToGoogleSheets"], button[onclick*="syncAllToGoogleSheets"]');
        const origTexts = [];
        syncButtons.forEach((btn, idx) => {
            origTexts[idx] = btn.innerHTML;
            btn.innerHTML = '⏳ កំពុងបញ្ជូនទៅ Google Sheets...';
            btn.disabled = true;
        });

        try {
            const payload = window.collectFullSchoolData();

            // Encode payload with encodeURIComponent to prevent ANY UTF-8 Mojibake corruption
            const safePayload = JSON.stringify({
                encoded: true,
                data: encodeURIComponent(JSON.stringify(payload))
            });

            await fetch(sheetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: safePayload
            });

            if (isSilent) {
                if (typeof window.updateSyncStatus === 'function') window.updateSyncStatus('success');
                showToastNotification(`☁️ បាន Auto-Sync ចូល Google Sheets! (${payload.activeAcademicYear} - សិស្ស ${payload.studentCount} នាក់, ពិន្ទុ ${payload.monthlyGradesCount} ជួរ)`);
            } else {
                alert(`✅ បានបញ្ជូនទិន្នន័យគ្រប់ជ្រុងជ្រោយទៅកាន់ Google Sheets រួចរាល់ដោយជោគជ័យ!\n\n` +
                    `• ឆ្នាំសិក្សា៖ ${payload.activeAcademicYear || '២០២៥ - ២០២៦'}\n` +
                    `• ថ្នាក់រៀន៖ គ្រប់ថ្នាក់ (ថ្នាក់ទី ១ ដល់ ទី ៦)\n` +
                    `• ប្រវត្តិរូប_រួមគ្រប់ថ្នាក់៖ ${payload.studentCount} នាក់ (លុបសន្លឹកចាស់ "ប្រវត្តិរូបសិស្ស_ពេញលេញ" រួចរាល់)\n` +
                    `• ពិន្ទុសិស្សប្រចាំខែ (តាមខែ & តាមឆ្នាំសិក្សា)៖ ${payload.monthlyGradesCount} ជួរ\n` +
                    `• ពិន្ទុប្រឡងឆមាស៖ ${payload.semesterGradesCount} ជួរ\n` +
                    `• ឈ្មោះខ្មែរ និងឆ្នាំសិក្សាត្រូវបានការពារត្រឹមត្រូវ ១០០% (លែងភ័ន្តច្រឡំគ្នា)`);
            }
        } catch (err) {
            console.error('Google Sheets Sync Error:', err);
            if (!isSilent) {
                alert('មានបញ្ហាក្នុងការ Sync ទៅ Google Sheets: ' + err.message);
            }
        } finally {
            syncButtons.forEach((btn, idx) => {
                if (origTexts[idx]) btn.innerHTML = origTexts[idx];
                btn.disabled = false;
            });
        }
    };

    // Toast Notification helper
    function showToastNotification(msg) {
        let toast = document.getElementById('google-sync-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'google-sync-toast';
            toast.style.cssText = 'position: fixed; bottom: 25px; left: 25px; background: #064e3b; color: #ecfdf5; padding: 12px 20px; border-radius: 12px; font-family: "Battambang", sans-serif; font-size: 0.9rem; z-index: 999999; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #059669; transition: all 0.4s ease; opacity: 0; transform: translateY(20px); pointer-events: none; display: flex; align-items: center; gap: 8px;';
            document.body.appendChild(toast);
        }
        toast.innerHTML = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 4000);
    }

        // Two-way collaborative sync: Pull latest data from Google Sheets
    window.pullFromGoogleSheets = async function (isSilent = false) {
        if (window.isPullingFromCloud || window.isSyncingToCloud) return;
        window.isPullingFromCloud = true;
        let sheetUrl = window.getGoogleSheetsUrl();
        if (!sheetUrl) {
            const inputEl = document.getElementById('google-sheets-url');
            if (inputEl && inputEl.value.trim()) {
                sheetUrl = inputEl.value.trim();
                localStorage.setItem(STORAGE_KEY_PLUNG, sheetUrl);
            }
        }

        if (!sheetUrl) {
            if (!isSilent) {
                alert('⚠️ មិនទាន់បានកំណត់ Google Sheets Web App URL សម្រាប់សាលាបឋមសិក្សា ផ្លុង នៅឡើយទេ!\n\nសូមចូលទៅកាន់ការកំណត់ (Settings ⚙️) រួចបញ្ចូល Web App URL នៃ Google Sheet របស់លោកអ្នកជាមុនសិន។');
                if (typeof openSettingsModal === 'function') openSettingsModal();
            }
            window.isPullingFromCloud = false;
            return;
        }

        if (!isSilent) {
            if (!confirm('⚠️ តើអ្នកពិតជាចង់ទាញយកទិន្នន័យពី Google Sheets មកធ្វើបច្ចុប្បន្នភាពលើឧបករណ៍នេះមែនទេ?\n\n👉 ចុច OK ដើម្បីបន្តការទាញយក។')) {
                window.isPullingFromCloud = false;
                return;
            }
        }

        try {
            const pullUrl = sheetUrl + (sheetUrl.includes('?') ? '&' : '?') + 'action=pull&_t=' + Date.now();
            const res = await fetch(pullUrl);
            const result = await res.json();

            if (result && result.status === 'success' && result.data) {
                const cloudData = result.data;
                let changeCount = 0;
                let studentTotal = 0;

                // Load user intentionally deleted student IDs so they are not revived
                let deletedIds = [];
                try { deletedIds = JSON.parse(localStorage.getItem('user_deleted_student_ids') || '[]'); } catch(e){}
                const deletedSet = new Set(deletedIds.map(id => String(id).trim()));

                // Load photo vault
                let vault = {};
                try { vault = JSON.parse(localStorage.getItem('student_photos_vault') || '{}'); } catch(e){}

                for (let k in cloudData) {
                    if (Object.prototype.hasOwnProperty.call(cloudData, k)) {
                        let cloudVal = typeof cloudData[k] === 'object' ? JSON.stringify(cloudData[k]) : cloudData[k];
                        const localVal = localStorage.getItem(k);

                        // 🛡️ CRITICAL SMART MERGE FOR STUDENT PROFILES:
                        // NEVER delete local students during a pull! Merge them seamlessly!
                        if (k.startsWith('studentProfilesData')) {
                            try {
                                const cloudList = JSON.parse(cloudVal) || [];
                                const localList = JSON.parse(localVal || '[]') || [];

                                const mergedMap = new Map();

                                // 1. Add cloud students (excluding intentionally deleted ones)
                                if (Array.isArray(cloudList)) {
                                    cloudList.forEach(p => {
                                        if (p && (p.id || p.name)) {
                                            const idKey = String(p.id || p.name).trim();
                                            if (!deletedSet.has(idKey)) {
                                                if (p.dob) p.dob = formatDOBDisplay(p.dob);
                                                // Restore photo from vault if missing
                                                if (!p.photo && vault[idKey]) p.photo = vault[idKey];
                                                else if (p.photo) vault[idKey] = p.photo;
                                                mergedMap.set(idKey, p);
                                            }
                                        }
                                    });
                                }

                                // 2. Keep newly entered local students that are not in cloud yet
                                if (Array.isArray(localList)) {
                                    localList.forEach(lp => {
                                        if (lp && (lp.id || lp.name)) {
                                            const lpKey = String(lp.id || lp.name).trim();
                                            if (!deletedSet.has(lpKey)) {
                                                if (!mergedMap.has(lpKey)) {
                                                    // Local student newly added - PRESERVE IT!
                                                    if (lp.photo) vault[lpKey] = lp.photo;
                                                    mergedMap.set(lpKey, lp);
                                                } else {
                                                    // Student exists in cloud: preserve local values if cloud is blank!
                                                    const cur = mergedMap.get(lpKey);
                                                    if (!cur.photo && lp.photo) {
                                                        cur.photo = lp.photo;
                                                        vault[lpKey] = lp.photo;
                                                    }
                                                    if ((!cur.dob || cur.dob === '-') && lp.dob && lp.dob !== '-') {
                                                        cur.dob = lp.dob;
                                                    }
                                                    if ((!cur.age || cur.age === '-') && lp.age && lp.age !== '-') {
                                                        cur.age = lp.age;
                                                    }
                                                    if (!cur.fatherName && lp.fatherName) cur.fatherName = lp.fatherName;
                                                    if (!cur.fatherJob && lp.fatherJob) cur.fatherJob = lp.fatherJob;
                                                    if (!cur.motherName && lp.motherName) cur.motherName = lp.motherName;
                                                    if (!cur.motherJob && lp.motherJob) cur.motherJob = lp.motherJob;
                                                    if (!cur.guardianName && lp.guardianName) cur.guardianName = lp.guardianName;
                                                    if (!cur.guardian && lp.guardian) cur.guardian = lp.guardian;
                                                    if (!cur.phone && lp.phone) cur.phone = lp.phone;
                                                    if (!cur.pob && lp.pob) cur.pob = lp.pob;
                                                    if (!cur.address && lp.address) cur.address = lp.address;
                                                    mergedMap.set(lpKey, cur);
                                                }
                                            }
                                        }
                                    });
                                }

                                const finalList = Array.from(mergedMap.values());
                                cloudVal = JSON.stringify(finalList);
                                studentTotal += finalList.length;
                            } catch (pErr) {
                                console.warn('Error merging profiles for ' + k, pErr);
                            }
                        }

                        // Prevent storing bloated duplicate alias keys that blow up localStorage quota
                        if (k === 'studentProfilesData_ay_2025_2026') {
                            if (!localStorage.getItem('studentProfilesData')) {
                                try { localStorage.setItem('studentProfilesData', cloudVal); } catch(e) {}
                            }
                            localStorage.removeItem('studentProfilesData_ay_2025_2026');
                            continue;
                        }

                        if (localVal !== cloudVal) {
                            try {
                                localStorage.setItem(k, cloudVal);
                                changeCount++;
                            } catch (setErr) {
                                if (typeof window.pruneStorageQuota === 'function') {
                                    window.pruneStorageQuota(true);
                                    try {
                                        localStorage.setItem(k, cloudVal);
                                        changeCount++;
                                    } catch (e) {}
                                }
                            }
                        }
                    }
                }

                // Save updated photo vault
                try { localStorage.setItem('student_photos_vault', JSON.stringify(vault)); } catch(e){}

                localStorage.setItem('system_initialized', 'true');
                localStorage.setItem('plung_full_backup_2026_10_31_loaded_v2', 'true');
                if (result.timestamp) {
                    localStorage.setItem('_last_synced_cloud_timestamp', result.timestamp);
                }

                // Cool-down period: prevents pull from triggering an accidental bounce push back
                window._pullCoolDownUntil = Date.now() + 8000;

                if (changeCount > 0 || studentTotal > 0) {
                    console.log('✅ បានទាញទិន្នន័យពី Google Sheets (' + changeCount + ' keys updated, students: ' + studentTotal + ')');
                    
                    try {
                        window.dispatchEvent(new CustomEvent('cloudDataUpdated', {
                            detail: { changeCount: changeCount, studentTotal: studentTotal, isSilent: isSilent }
                        }));
                    } catch(evErr) {}

                    if (!isSilent) {
                        alert('✅ បានទាញយកទិន្នន័យពី Google Sheets ដោយជោគជ័យ!\n\nទិន្នន័យដែលបានទាញយក៖ សិស្សសរុប ' + studentTotal + ' នាក់ និងពិន្ទុគ្រប់ឆ្នាំសិក្សា។');
                        window.location.reload();
                    } else if (changeCount > 0) {
                        if (typeof window.updateSyncStatus === 'function') window.updateSyncStatus('success');
                showToastNotification("☁️ បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យពី Google Sheets!");
                    }
                } else if (!isSilent) {
                    alert("ℹ️ ទិន្នន័យលើកុំព្យូទ័ររបស់អ្នក ដូចគ្នានឹងទិន្នន័យក្នុង Google Sheets រួចរាល់ហើយ!");
                }
            } else if (result && result.status === 'empty') {
                if (!isSilent) {
                    alert("ℹ️ Google Sheet នេះមិនទាន់មានទិន្នន័យសិស្ស ឬពិន្ទុនៅឡើយទេ។");
                }
            } else if (result && result.status === 'error') {
                if (!isSilent) {
                    alert("⚠️ បញ្ហាពី Google Sheet៖ " + (result.message || "មិនអាចអានទិន្នន័យបាន"));
                }
            }
        } catch (err) {
            console.warn("Pull from Google Sheets notice:", err);
            if (!isSilent) {
                alert("⚠️ មិនអាចទាញទិន្នន័យពី Google Sheets បានទេ៖ " + (err.message || "សូមពិនិត្យមើល URL និងការតភ្ជាប់អ៊ីនធឺណិត"));
            }
        } finally {
            window.isPullingFromCloud = false;
            window._pullCoolDownUntil = Date.now() + 6000;
        }
    };

    let autoSyncTimer = null;
    let pendingAutoSync = false;
    window.triggerGoogleAutoSync = function (immediate = false) {
        const sheetUrl = window.getGoogleSheetsUrl();
        if (!sheetUrl) return;

        if (window.isSyncingToCloud) {
            pendingAutoSync = true;
            return;
        }

        if (autoSyncTimer) clearTimeout(autoSyncTimer);
        if (immediate) {
            window.syncAllToGoogleSheets(true).finally(() => {
                if (pendingAutoSync) {
                    pendingAutoSync = false;
                    setTimeout(() => window.triggerGoogleAutoSync(false), 500);
                }
            });
            return;
        }
        autoSyncTimer = setTimeout(() => {
            window.syncAllToGoogleSheets(true).finally(() => {
                if (pendingAutoSync) {
                    pendingAutoSync = false;
                    setTimeout(() => window.triggerGoogleAutoSync(false), 500);
                }
            });
        }, 800);
    };

    // Global localStorage.setItem Interceptor:
    // Safe storage with auto-recovery against QuotaExceededError and auto-sync to Google Sheets!
    (function installStorageAutoSyncHook() {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
        if (window.__storageSyncHookInstalled) return;
        window.__storageSyncHookInstalled = true;

        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalGetItem = localStorage.getItem.bind(localStorage);

        // Fallback for alias keys so reading studentProfilesData_ay_2025_2026 never fails
        localStorage.getItem = function (key) {
            if (key === 'studentProfilesData_ay_2025_2026') {
                const val = originalGetItem(key);
                if (val && val !== '[]' && val !== '{}' && val !== 'null') return val;
                return originalGetItem('studentProfilesData');
            }
            return originalGetItem(key);
        };

        localStorage.setItem = function (key, value) {
            // Prevent writing bloated duplicate alias keys that blow up storage quota
            if (key === 'studentProfilesData_ay_2025_2026') {
                if (!originalGetItem('studentProfilesData')) {
                    originalSetItem('studentProfilesData', value);
                }
                return;
            }

            try {
                originalSetItem(key, value);
            } catch (err) {
                const isQuota = err && (
                    err.name === 'QuotaExceededError' ||
                    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
                    err.code === 22 ||
                    err.code === 1014 ||
                    (err.message && err.message.toLowerCase().includes('quota'))
                );
                if (isQuota && typeof window.pruneStorageQuota === 'function') {
                    console.warn('⚠️ Storage Quota Exceeded on "' + key + '". Running auto-recovery...');
                    window.pruneStorageQuota(true);
                    try {
                        originalSetItem(key, value);
                        console.log('✅ Auto-recovery successful! Saved "' + key + '".');
                    } catch (retryErr) {
                        console.error('Save failed even after auto-recovery:', retryErr);
                        throw retryErr;
                    }
                } else {
                    throw err;
                }
            }

            // Record local edit timestamp to protect user modifications from stale cloud pulls
            if (typeof key === 'string' && (
                key.startsWith('studentProfilesData') ||
                key.startsWith('studentGrades') ||
                key.startsWith('semester') ||
                key.startsWith('annual')
            )) {
                window._lastLocalEditTime = Date.now();
                try { originalSetItem('_last_local_student_edit_time', String(Date.now())); } catch(e){}
            }

            if (window.isPullingFromCloud) return;

            if (typeof key === 'string' && (
                key.startsWith('studentProfilesData') ||
                key.startsWith('studentGrades') ||
                key.startsWith('semester') ||
                key.startsWith('annual') ||
                key.startsWith('teacherProfiles') ||
                key.startsWith('schoolRecords')
            )) {
                if (typeof window.triggerGoogleAutoSync === 'function') {
                    window.triggerGoogleAutoSync(false);
                }
            }
        };
    })();

    // Safe Startup Cloud Sync (Never Poll Aggressively in Background!):
    if (typeof window !== 'undefined') {
        // On initial page load: pull once to synchronize with cloud
        window.addEventListener('load', function () {
            setTimeout(function () {
                const sheetUrl = window.getGoogleSheetsUrl();
                if (sheetUrl && typeof window.pullFromGoogleSheets === 'function') {
                    // Only auto-pull on load if user hasn't made an edit in the last 15s
                    const lastLocalEdit = parseInt(localStorage.getItem('_last_local_student_edit_time') || '0', 10);
                    if (Date.now() - lastLocalEdit > 15000) {
                        console.log('☁️ Startup sync with Google Sheets...');
                        window.pullFromGoogleSheets(true);
                    }
                }
            }, 1200);
        });
    }
})();
