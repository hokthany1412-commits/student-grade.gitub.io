// Helper to format date to DD-MM-YYYY (ថ្ងៃ-ខែ-ឆ្នាំ) for display and export (100% Comprehensive)
function formatDOB(dobString) {
    if (!dobString) return '-';
    if (dobString instanceof Date) {
        const d = String(dobString.getDate()).padStart(2, '0');
        const m = String(dobString.getMonth() + 1).padStart(2, '0');
        const y = dobString.getFullYear();
        return `${d}-${m}-${y}`;
    }
    // Normalize Khmer numerals to Arabic digits and trim
    const str = dobString.toString().replace(/[០-៩]/g, d => '០១២៣៤៥៦៧៨៩'.indexOf(d)).trim();
    if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';

    // 1. Check if string is GMT / Indochina / ISO timestamp e.g. "Wed Jun 03 2015 00:00:00 GMT+0700 (Indochina Time)"
    if (str.includes('GMT') || str.includes('Indochina') || str.includes('T') || (isNaN(str) && !str.includes('-') && !str.includes('/') && !isNaN(Date.parse(str)))) {
        const parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
            const d = String(parsed.getDate()).padStart(2, '0');
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const y = parsed.getFullYear();
            if (y > 1900 && y < 2100) {
                return `${d}-${m}-${y}`;
            }
        }
    }

    // 2. If format contains '-' e.g. "YYYY-MM-DD" or "DD-MM-YYYY"
    if (str.includes('-')) {
        const parts = str.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD -> DD-MM-YYYY
                const y = parts[0];
                const m = parts[1].padStart(2, '0');
                const d = parts[2].padStart(2, '0');
                return `${d}-${m}-${y}`;
            } else if (parts[2].length === 4) {
                // DD-MM-YYYY
                const d = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                const y = parts[2];
                return `${d}-${m}-${y}`;
            }
        }
    }

    // 3. If format contains '/' e.g. "DD/MM/YYYY" or "YYYY/MM/DD"
    if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY/MM/DD -> DD-MM-YYYY
                const y = parts[0];
                const m = parts[1].padStart(2, '0');
                const d = parts[2].padStart(2, '0');
                return `${d}-${m}-${y}`;
            } else if (parts[2].length === 4) {
                // DD/MM/YYYY -> DD-MM-YYYY
                const d = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                const y = parts[2];
                return `${d}-${m}-${y}`;
            }
        }
    }

    // 4. Try parsing as Date if possible
    const lastParsed = new Date(str);
    if (!isNaN(lastParsed.getTime())) {
        const y = lastParsed.getFullYear();
        if (y > 1900 && y < 2100) {
            const d = String(lastParsed.getDate()).padStart(2, '0');
            const m = String(lastParsed.getMonth() + 1).padStart(2, '0');
            return `${d}-${m}-${y}`;
        }
    }

    return str;
}

// Master dictionary of known student parent information
window.KNOWN_STUDENT_PARENTS = {
    "1312": { name: "កែម សុផាន់ណា", fatherName: "អូន កែម", motherName: "ថន យៀក", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 55 57 139" },
    "1173": { name: "កែ សុគាម", fatherName: "កែម កែ", motherName: "ម៉ាប់ សុំ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "093 906 739" },
    "1290": { name: "ខន ប៊ុនថង", fatherName: "ខន ខេង", motherName: "ឡូច ញ៉ាញ់", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "093 298 475" },
    "1301": { name: "ខែត លីនដា", fatherName: "ខន ខែត", motherName: "ហ៊ុយ ភ័ក្រ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 66 12 757" },
    "1328": { name: "ឃួន ស្រីយួច", fatherName: "ស៊ែម សុខឃួន", motherName: "ឆឹម ម៉ៅ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 84 37 105" },
    "1327": { name: "ជឿន គីម", fatherName: "ជឿន ង៉ុង", motherName: "ខា សុយឿន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "085 59 34 19 340" },
    "1135": { name: "ចំណើន បញ្ញា", fatherName: "គីន ចំណើន", motherName: "គឿន កី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "081 755 941" },
    "1298": { name: "ចំណើន សុធារិទ្ធិ", fatherName: "សួង ចំណើន", motherName: "សៃ សារូ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "031 53 11 222" },
    "1314": { name: "ផៃនី ធីតា", fatherName: "ប៊ុន ផៃនី", motherName: "អៀង ឡែន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 26 59 605" },
    "1288": { name: "ដំ ស្រីនា", fatherName: "មិថុនា ដំ (ស្លាប់)", motherName: "ធូ ញ៉ុក", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1444": { name: "គឿម ប៊ុនតី", fatherName: "រឿន ប៊ុនគឿម", motherName: "ឌី ក្លើប", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 61 78 179" },
    "1445": { name: "នឹម លីម៉េង", fatherName: "នឹម នឹម", motherName: "ទុំ យូណា", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 80 01 958" },
    "1446": { name: "ប៊ុន បូណា", fatherName: "ម៉ា ប៊ុន", motherName: "គី ផុន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "081 744 412" },
    "1286": { name: "ប៊ុនធឿន ម៉ីម៉ី", fatherName: "ហែម ប៊ុនធឿន", motherName: "រ៉ន ចន្ទី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "015 341 473" },
    "1448": { name: "ផាយ ស្រីតា", fatherName: "ឌី ផាយ", motherName: "សៅ មន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1299": { name: "ជួ ចិន", fatherName: "ជួន ជួ", motherName: "ប៉ាវ រ៉ន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "093 927 873" },
    "1449": { name: "ពក ពេជ្រ", fatherName: "ហ៊ឹម ពក", motherName: "យូ យ៉ា", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 56 34 678" },
    "1295": { name: "ពូក សៀងហុង", fatherName: "ហុន ពូក", motherName: "ឡាញ ពិសី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "081 634 296" },
    "1275": { name: "ពេញ រក្សា", fatherName: "អ៊ុ ពេញ", motherName: "ហ៊ឹម ហ៊ាន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "069 306 381" },
    "1450": { name: "ភាង សំភ័ន្ត", fatherName: "ភី ភាង", motherName: "ជូ សុខធឿន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 99 41 871" },
    "1279": { name: "ភាព សោភា", fatherName: "ឈឹម ភាព", motherName: "ហ៊ាន ហួន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 84 50 646" },
    "1451": { name: "ភឿន សាភ័យ", fatherName: "អ៊ុង សុភឿន", motherName: "ណាក រ៉ន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1335": { name: "ម៉ុន លីហ្សា", fatherName: "ភិន ពន្លក", motherName: "ស៊ឹង សុភន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "086 383 950" },
    "1131": { name: "យ៉ុន សូរិយា", fatherName: "គឹម យឹម", motherName: "អ៊ឹម ឡួយ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1303": { name: "វង់ ភារ័ត្ន", fatherName: "ស៊ឹង សំវង់", motherName: "ជា សុភ័ក្រ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "070 382 956" },
    "1285": { name: "វ៉ាយ ធារ័ត្ន", fatherName: "រ៉ី វ៉ាយ", motherName: "ជូន ផាយ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "087 469 726" },
    "1282": { name: "រី សៀងម៉ាត់", fatherName: "រី រី", motherName: "ឡាញ ជាង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 77 17 263" },
    "1281": { name: "រិន មុន្នា", fatherName: "ម៉ែម រិន", motherName: "រ៉ន យ៉ាត", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 60 63 227" },
    "1452": { name: "រៀង វីរៈ", fatherName: "នួន រៀង", motherName: "ប៊ុត ហុង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1294": { name: "លឹម គឹមលីញ", fatherName: "ឡៀង សុភ័ណ", motherName: "ជួន ភ័ន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1453": { name: "លឹម សុខា", fatherName: "លឹម ផាង", motherName: "ឌី ផ្លាប់", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "093 350 913" },
    "1244": { name: "លុម រៀម", fatherName: "លឹម លុក", motherName: "គៀន គាង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1280": { name: "វ៉ែ រ៉ាឌី", fatherName: "ញ៉ែប វ៉ែ", motherName: "សូត្រ ស៊ីដា", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "086 372 547" },
    "1283": { name: "វ៉ាន់ ឧស្សាហ៍", fatherName: "វ៉ាន់ វ៉ាន់", motherName: "ឆឹម ពក", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1249": { name: "វ៉ិត ណាវី", fatherName: "អ៊ុក វ៉ិត", motherName: "អៀង សុភ័ក្រ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "069 784 251" },
    "1323": { name: "វ៉ិត វី", fatherName: "វ៉ាត វ៉ិត", motherName: "អៀង លិស", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 85 03 730" },
    "1454": { name: "វិសាល រ៉ាឌី", fatherName: "ហ៊ុយ វិសាល", motherName: "ខុំ ឃីម", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "081 566 854" },
    "1455": { name: "វុត្ធី សុភ័ណ្ឌ", fatherName: "ញឹម វុត្ធី", motherName: "លឹម សុភី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "093 351 055" },
    "1307": { name: "ស៊ីញ ភ័ក្រ្ត័ណ្ឌ", fatherName: "សៀង ស៊ីញ", motherName: "ជា រា", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "070 366 083" },
    "1274": { name: "ស៊ី ស្រីណេត", fatherName: "ស្រិន គីមស្រ៊ី", motherName: "រី សុខនាច", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "088 86 83 316" },
    "1278": { name: "ស៊ី នីតា", fatherName: "ស៊ី លី", motherName: "តាំង យៀង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "081 861 751" },
    "1456": { name: "ស៊ី ស៊ីរ៉េ", fatherName: "អ៊ុង ពិសី", motherName: "តូច ជាង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 98 47 001" },
    "1457": { name: "សុខ សៅ", fatherName: "ស សុក", motherName: "លុច ប៉ាង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1458": { name: "សុភា នីកា", fatherName: "ស៊ឹង សុភា", motherName: "ជឿន ភាន់", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "087 991 282" },
    "1459": { name: "សៀប ដានី", fatherName: "ជឹម សាន់", motherName: "អ៊ុន ចៀង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1304": { name: "សេក សុជា", fatherName: "យឿន សេក", motherName: "នឹម សាំង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 54 95 112" },
    "1306": { name: "សេង លីហ្សា", fatherName: "ស៊ឹង សេង", motherName: "ខន ផន", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 77 41 221" },
    "1318": { name: "សៅ សុខា", fatherName: "សុះ សៅ", motherName: "ខុំ ខៃ", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 72 67 034" },
    "1316": { name: "ហ៊ី ម៉ាហា", fatherName: "រដ្ឋា សេងហ៊ី", motherName: "ហ៊ុត ផាត់", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 83 29 685" },
    "1308": { name: "ហួន សុខណាត់", fatherName: "ហាញ់ ហួន", motherName: "ខន ឈូក", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "069 286 375" },
    "1309": { name: "ហេង ឡៃហៀក", fatherName: "ភឹម ហ៊ីង", motherName: "ស៊ឹម ផល្លី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "070 548 199" },
    "1460": { name: "ហេង ឡៃហៀង", fatherName: "ភឹម ហ៊ីង", motherName: "ស៊ឹម ផល្លី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "" },
    "1393": { name: "អ៊ាន់ ស៊ីណាវ", fatherName: "អៀង អ៊ាន់", motherName: "គា ឌី", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 83 54 512" },
    "1289": { name: "អ៊ុន អ៊ុត", fatherName: "អ៊ឹម អ៊ុន", motherName: "យ៉ុង ចៀង", fatherJob: "កសិករ", motherJob: "កសិករ", pobVillage: "ឆ្លង", phone: "096 68 65 031" },
    // Batch 4 (Grade 4 & Grade 2 Recovered)
    "1337": { name: "កូយ លីគ័ង្គ", fatherName: "ធូ  កូយ", motherName: "រ៉េម ណាត", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1336": { name: "តាក់ រ៉ាទី", fatherName: "ឡូញ តាក់", motherName: "រឹម កុន", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1362": { name: "ធីន សុខណា", fatherName: "សឿន ធីន", motherName: "ណំ ប៉ូ", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1329": { name: "នេត លីណា", fatherName: "ឡាច ប៊ុននេត", motherName: "ហ៊ត សុក", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1389": { name: "យ័ត ឧសភា", fatherName: "យ៉ន យ័ត", motherName: "ផៃ តាប់", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1376": { name: "យ៉ែន ស្រីពេជ្រ", fatherName: "ឃូ យ៉ែន", motherName: "អាន ប៉ាន់", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1802": { name: "រ៉ិត រីម៉ា", fatherName: "ញ៉េប រ៉ិត", motherName: "ឌី ផ្លិច", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1342": { name: "រៀន ធារ័ត្ន", fatherName: "ញ៉េប រៀន", motherName: "ជីម សៅ", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1372": { name: "សាំង គឹមសៀ", fatherName: "សុះ សាំង", motherName: "គុយ ពាយ", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1395": { name: "សាយ កក្កដា", fatherName: "សួន សាយ", motherName: "គីន សោម", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1411": { name: "សៀង រតនា", fatherName: "សៀប សៀង", motherName: "ផេង ស្រីម៉ៅ", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1401": { name: "អៃ វិសាល", fatherName: "អាត អៃ", motherName: "ឆែ ឆុត", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1338": { name: "ឃួន មិនា", fatherName: "ស៊ែម សុខឃួន", motherName: "ជីម ម៉ៅ", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1414": { name: "ឆាវ តេឆូ", fatherName: "សឿន ឆាវ", motherName: "ហៀ ធួង", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1438": { name: "ទន ស្រីតី", fatherName: "វី ទន", motherName: "រ៉ុន ឡាំ", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1416": { name: "ទិន សោភ័ណ", fatherName: "តឹម ទិន", motherName: "ហ៊ីម ហ៊ី", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1386": { name: "ទុំ ស្រីនិត្យ", fatherName: "ទួត ទុំ", motherName: "វ័ន តុស", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1426": { name: "ផាន តុងលី", fatherName: "ឡាច ឡុង", motherName: "វ៉ាន់ ខុន", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1432": { name: "មុត កានីកា", fatherName: "ស​ មុត", motherName: "ឈាង ស្រី", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1431": { name: "មុត នីកា", fatherName: "ស​ មុត", motherName: "ឈាង ស្រី", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1433": { name: "មុត នីតា", fatherName: "ស​ មុត", motherName: "ឈាង ស្រី", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1425": { name: "វ៉ាន់ ចន្ធូ", fatherName: "ញឹម សាវ៉ាន់", motherName: "លីម សុភ័ក្ត", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1391": { name: "វ៉ាន់ ណាសាក់", fatherName: "វ៉ា វ៉ាន់", motherName: "ធឹម ពក", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1405": { name: "វ៉ាន់ សាវ័ន", fatherName: "ញឹម សាវ៉ាន់", motherName: "លីម សុភ័ក្ត", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1365": { name: "ស៊ន សំ", fatherName: "ស៊ន   សេត", motherName: "ជុន   គីម", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1397": { name: "សូយ សីហា", fatherName: "សឿន សូយ", motherName: "ជីន សុផល", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1400": { name: "ហាង លីហ័រ", fatherName: "ហាង ហាត", motherName: "លី លឹង", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1435": { name: "ហ៊ាន់ មករា", fatherName: "ហ៊ុន ហ៊ាន់", motherName: "ហ៊ឹម រីម", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1297": { name: "អាន ឆេងអ៊ី", fatherName: "អ៊ន   ប៉េងអាន", motherName: "ពៅ   ឆុង", fatherJob: "កសិករ", motherJob: "កសិករ" },
    "1883": { name: "នូ ស៊ីនាត", fatherName: "សូត្រ នូ", motherName: "ណូក ចាន់ណា", fatherJob: "កសិករ", motherJob: "កសិករ" }
};

// Helper to auto-recover missing parent information
function recoverStudentParentInfo(student) {
    if (!student) return false;
    let changed = false;

    // 1. From guardian string if contains " / " or " និង "
    if ((!student.fatherName || !student.motherName) && student.guardian) {
        const rawG = student.guardian.toString().replace(/្ដ/g, '្ត');
        let parts = [];
        if (rawG.includes('/')) {
            parts = rawG.split(/\s*\/\s*/);
        } else if (rawG.includes(' និង ')) {
            parts = rawG.split(/\s*និង\s*/);
        }
        if (parts.length >= 2) {
            if (!student.fatherName && parts[0] && parts[0].trim()) {
                student.fatherName = parts[0].trim();
                changed = true;
            }
            if (!student.motherName && parts[1] && parts[1].trim()) {
                student.motherName = parts[1].trim();
                changed = true;
            }
        }
    }

    // 2. From KNOWN_STUDENT_PARENTS
    const known = window.KNOWN_STUDENT_PARENTS && (window.KNOWN_STUDENT_PARENTS[student.id] || window.KNOWN_STUDENT_PARENTS[student.name]);
    if (known) {
        if (!student.motherName && known.motherName) {
            student.motherName = known.motherName;
            changed = true;
        }
        if (!student.fatherName && known.fatherName) {
            student.fatherName = known.fatherName;
            changed = true;
        }
        if (!student.fatherJob && known.fatherJob) {
            student.fatherJob = known.fatherJob;
            changed = true;
        }
        if (!student.motherJob && known.motherJob) {
            student.motherJob = known.motherJob;
            changed = true;
        }
        if (!student.phone && known.phone) {
            student.phone = known.phone;
            changed = true;
        }
    }

    // Auto-heal missing DOB & Age from OFFICIAL_GRADE6_STUDENTS
    if ((!student.dob || student.dob === '-') && typeof OFFICIAL_GRADE6_STUDENTS !== 'undefined') {
        const off = OFFICIAL_GRADE6_STUDENTS.find(o => o.id === student.id || o.name === student.name);
        if (off && off.dob) {
            student.dob = off.dob;
            student.age = off.age || (typeof calculateAge === 'function' ? calculateAge(off.dob) : '');
            changed = true;
        }
    }

    // 3. Across localStorage keys if still missing
    if (!student.motherName || !student.fatherName) {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('studentProfilesData') || k === 'remedial_manual_rows')) {
                    const data = JSON.parse(localStorage.getItem(k));
                    if (Array.isArray(data)) {
                        const match = data.find(s => s && (s.id === student.id || (s.name && s.name === student.name)));
                        if (match) {
                            if (!student.motherName && match.motherName) {
                                student.motherName = match.motherName;
                                changed = true;
                            }
                            if (!student.fatherName && match.fatherName) {
                                student.fatherName = match.fatherName;
                                changed = true;
                            }
                            if (!student.motherJob && match.motherJob) {
                                student.motherJob = match.motherJob;
                                changed = true;
                            }
                            if (!student.fatherJob && match.fatherJob) {
                                student.fatherJob = match.fatherJob;
                                changed = true;
                            }
                            if (student.motherName && student.fatherName) break;
                        }
                    }
                }
            }
        } catch(e){}
    }

    return changed;
}

// Data Array to hold student profiles
// 🛡️ OFFICIAL ROSTER FOR ថ្នាក់ទី ៦ ក (២០២៦ - ២០២៧) - PRESERVES COMPLETE ROSTER ACROSS ALL DEVICES
const OFFICIAL_GRADE6_STUDENTS = [
    { id: 'S-203', name: 'កែម សុផាន់ណា', gender: 'ស', dob: '10-12-2010', age: '១៥ ឆ្នាំ', status: 'សិស្សថ្មី', fatherName: 'អូន កែម', fatherJob: 'កសិករ', motherName: 'ចន យ៉ៀក', motherJob: 'កសិករ', guardianName: 'អូន កែម / ចន យ៉ៀក', guardianJob: 'កសិករ', phone: '096 55 57 139', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-204', name: 'កែ សុតាម', gender: 'ប', dob: '12-12-2015', age: '11 ឆ្នាំ', status: 'សិស្សថ្មី', fatherName: 'កែម កែ', fatherJob: 'កសិករ', motherName: 'ម៉ាប់ សុំ', motherJob: 'កសិករ', guardianName: 'កែម កែ / ម៉ាប់ សុំ', guardianJob: 'កសិករ', phone: '093 906 739', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-205', name: 'ខន ប៊ុនថេង', gender: 'ប', dob: '14-12-2014', age: '12 ឆ្នាំ', status: 'សិស្សថ្មី', fatherName: 'ខន ខែត', fatherJob: 'កសិករ', motherName: 'ឡុច ញ៉ាញ់', motherJob: 'កសិករ', guardianName: 'ខន ខែត / ឡុច ញ៉ាញ់', guardianJob: 'កសិករ', phone: '093 298 475', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-206', name: 'ខេត លីនដា', gender: 'ស', dob: '24-05-2014', age: '12 ឆ្នាំ', status: 'សិស្សថ្មី', fatherName: 'ខន ខែត', fatherJob: 'កសិករ', motherName: 'ហ៊ុយ ក័ត្រ', motherJob: 'កសិករ', guardianName: 'ខន ខែត / ហ៊ុយ ក័ត្រ', guardianJob: 'កសិករ', phone: '096 66 12 757', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-207', name: 'ឃួន ស្រីយួច', gender: 'ស', dob: '20-10-2012', age: '14 ឆ្នាំ', status: 'សិស្សថ្មី', fatherName: 'ស៊ែម សុខឃួន', fatherJob: 'កសិករ', motherName: 'ជីម ម៉ៅ', motherJob: 'កសិករ', guardianName: 'ស៊ែម សុខឃួន / ជីម ម៉ៅ', guardianJob: 'កសិករ', phone: '096 84 37 105', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-208', name: 'ឃឿន រ៉ាដា', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ង៉ាន់ ឃីន', fatherJob: 'កសិករ', motherName: 'ខា សុខឃឿន', motherJob: 'កសិករ', guardianName: 'ង៉ាន់ ឃីន / ខា សុខឃឿន', guardianJob: 'កសិករ', phone: '085 59 19 340', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-209', name: 'ចំរើន បញ្ញា', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'គឹម ចំរើន', fatherJob: 'កសិករ', motherName: 'កៀង នី', motherJob: 'កសិករ', guardianName: 'គឹម ចំរើន / កៀង នី', guardianJob: 'កសិករ', phone: '081 755 941', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-210', name: 'ចំរើន សុធារិទ្ធ', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'សុខ ចំរើន', fatherJob: 'កសិករ', motherName: 'សែ សារូ', motherJob: 'កសិករ', guardianName: 'សុខ ចំរើន / សែ សារូ', guardianJob: 'កសិករ', phone: '031 53 11 222', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-211', name: 'ឆៃនី ជីតា', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ប៊ុន ឆៃនី', fatherJob: 'កសិករ', motherName: 'អៀង ឡៃនួន', motherJob: 'កសិករ', guardianName: 'ប៊ុន ឆៃនី / អៀង ឡៃនួន', guardianJob: 'កសិករ', phone: '096 26 59 605', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-212', name: 'ដំ ស្រីនា', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ចំរើន ដំ (ស្លាប់)', fatherJob: 'កសិករ', motherName: 'ជួ ញឹក', motherJob: 'កសិករ', guardianName: 'ចំរើន ដំ (ស្លាប់) / ជួ ញឹក', guardianJob: 'កសិករ', phone: '', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-213', name: 'តឿម ប៊ុនតី', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'រៀន ប៊ុនធឿន', fatherJob: 'កសិករ', motherName: 'ឌី ភ្លើប', motherJob: 'កសិករ', guardianName: 'រៀន ប៊ុនធឿន / ឌី ភ្លើប', guardianJob: 'កសិករ', phone: '096 61 78 179', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-214', name: 'នឹម លីម៉េង', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'នឹម នឹម', fatherJob: 'កសិករ', motherName: 'ខំ យូណា', motherJob: 'កសិករ', guardianName: 'នឹម នឹម / ខំ យូណា', guardianJob: 'កសិករ', phone: '096 80 01 958', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-215', name: 'ប៉ីន បូណា', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ផា ប៉ីន', fatherJob: 'កសិករ', motherName: 'គី ដុន', motherJob: 'កសិករ', guardianName: 'ផា ប៉ីន / គី ដុន', guardianJob: 'កសិករ', phone: '081 744 412', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-216', name: 'ប៊ុនធឿន ម៉ីម៉ី', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ហេង ប៊ុនធឿន', fatherJob: 'កសិករ', motherName: 'រុន ចន្ទី', motherJob: 'កសិករ', guardianName: 'ហេង ប៊ុនធឿន / រុន ចន្ទី', guardianJob: 'កសិករ', phone: '015 341 473', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-217', name: 'ផាយ ស្រីតា', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ឌី ផាយ', fatherJob: 'កសិករ', motherName: 'ហៅ បន', motherJob: 'កសិករ', guardianName: 'ឌី ផាយ / ហៅ បន', guardianJob: 'កសិករ', phone: '', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-218', name: 'ឡន ធូ', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ឌុក ឡូ', fatherJob: 'កសិករ', motherName: 'ពៅ វែ', motherJob: 'កសិករ', guardianName: 'ឌុក ឡូ / ពៅ វែ', guardianJob: 'កសិករ', phone: '093 927 873', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-219', name: 'ហួត លៀងហេង', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ហួត ភូក', fatherJob: 'កសិករ', motherName: 'ញ៉ែម ប៉ាល់', motherJob: 'កសិករ', guardianName: 'ហួត ភូក / ញ៉ែម ប៉ាល់', guardianJob: 'កសិករ', phone: '081 634 296', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-220', name: 'អាញ់ វណ្ណា', gender: 'ស', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'អ៊ុំ អាញ់', fatherJob: 'កសិករ', motherName: 'ហ៊ឹម ម៉ាង', motherJob: 'កសិករ', guardianName: 'អ៊ុំ អាញ់ / ហ៊ឹម ម៉ាង', guardianJob: 'កសិករ', phone: '069 306 381', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-221', name: 'កាន សង្ខ័ន្ធ', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ក៏ កាន', fatherJob: 'កសិករ', motherName: 'ជួ សុធាធឿន', motherJob: 'កសិករ', guardianName: 'ក៏ កាន / ជួ សុធាធឿន', guardianJob: 'កសិករ', phone: '096 99 41 871', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' },
    { id: 'S-222', name: 'ភាព សោភា', gender: 'ប', dob: '', age: '', status: 'សិស្សថ្មី', fatherName: 'ម៉ម ភាព', fatherJob: 'កសិករ', motherName: 'ហ៊ិន ហួន', motherJob: 'កសិករ', guardianName: 'ម៉ម ភាព / ហ៊ិន ហួន', guardianJob: 'កសិករ', phone: '096 55 57 139', pobVillage: 'ផ្លុង', pobCommune: 'ទីពោ', pobDistrict: 'សន្ទុក', pobProvince: 'កំពង់ធំ', currVillage: 'ផ្លុង', currCommune: 'ទីពោ', currDistrict: 'សន្ទុក', currProvince: 'កំពង់ធំ', academicYear: '២០២៦ - ២០២៧', className: 'ថ្នាក់ទី ៦ ក', orphanStatus: 'មិនកំព្រា', equityCard: 'គ្មាន' }
];

let studentProfiles = JSON.parse(localStorage.getItem(window.getKey('studentProfilesData'))) || [];

// 🛡️ Data is strictly user-controlled: deleted students will NEVER be auto-reseeded
// Auto-cleanup bad data from imports and normalize DOB to DD-MM-YYYY (ថ្ងៃ-ខែ-ឆ្នាំ)
window.cleanupStudentProfilesData = function() {
    let modified = false;

    // Load user intentionally deleted student IDs so they are not restored
    let userDeleted = [];
    try { userDeleted = JSON.parse(localStorage.getItem('user_deleted_student_ids') || '[]'); } catch(e){}
    const userDeletedSet = new Set(userDeleted.map(x => String(x).trim()));

    // Load photo vault to auto-restore photos
    let vault = {};
    try { vault = JSON.parse(localStorage.getItem('student_photos_vault') || '{}'); } catch(e){}

    // Auto-merge removed: user deletions are respected 100%
    studentProfiles.forEach(s => {
        if (s.id && s.id.startsWith('$')) {
            s.id = s.id.replace(/^\$/, '');
            modified = true;
        }
        if (s.phone && s.phone.startsWith('$')) {
            s.phone = s.phone.replace(/^\$/, '');
            modified = true;
        }
        if (s.gender === 'ប្រុស') {
            s.gender = 'ប';
            modified = true;
        } else if (s.gender === 'ស្រី') {
            s.gender = 'ស';
            modified = true;
        }
        if (!s.status) {
            s.status = 'សិស្សថ្មី';
            modified = true;
        }
        if (!s.equityCard) {
            s.equityCard = 'គ្មាន';
        }
        // Normalize DOB to DD-MM-YYYY (ថ្ងៃ-ខែ-ឆ្នាំ)
        if (s.dob) {
            const formattedDob = formatDOB(s.dob);
            if (formattedDob !== s.dob) {
                s.dob = formattedDob;
                modified = true;
            }
        }
        // Auto-heal missing parent information
        if (recoverStudentParentInfo(s)) {
            modified = true;
        }
    });
    if (modified) {
        localStorage.setItem(window.getKey('studentProfilesData'), JSON.stringify(studentProfiles));
    }
};

// Initial cleanup on page load
window.cleanupStudentProfilesData();

// DOM Elements
const form = document.getElementById('student-profile-form');
const tableBody = document.getElementById('table-body');
const clearBtn = document.getElementById('clear-data-btn') || document.getElementById('clear-btn');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const tableResponsive = document.querySelector('.table-responsive');

// Helper to format date to YYYY-MM-DD for <input type="date">
function formatToInputDate(dobString) {
    if (!dobString) return '';
    const formatted = formatDOB(dobString);
    if (formatted && formatted.includes('-')) {
        const parts = formatted.split('-');
        if (parts.length === 3 && parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    return '';
}

// Helper to calculate age and convert to Khmer
function calculateAge(dobString) {
    if (!dobString) return '';
    const formatted = formatDOB(dobString);
    if (!formatted || formatted === '-') return '';
    const p = formatted.split('-');
    if (p.length !== 3) return '';
    const birthDate = new Date(`${p[2]}-${p[1]}-${p[0]}`);
    if (isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 0 || age > 100) return '';
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const toKhmer = (num) => num.toString().split('').map(d => khmerNums[d] || d).join('');
    return toKhmer(age) + ' ឆ្នាំ';
}

// Photo handling state
let currentFormPhotoBase64 = '';

// Helper to compress and set student photo using Canvas (keeps Base64 small ~15-25KB)
window.compressAndSetPhoto = function(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert('សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG, WebP)!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Resize image to max 400x500
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 500;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = Math.round((width * MAX_HEIGHT) / height);
                    height = MAX_HEIGHT;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG format with 0.82 quality
            const compressedData = canvas.toDataURL('image/jpeg', 0.82);
            setFormPhoto(compressedData);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.setFormPhoto = function(base64Data) {
    currentFormPhotoBase64 = base64Data || '';
    const imgEl = document.getElementById('form-photo-preview');
    const placeholderEl = document.getElementById('form-photo-placeholder');
    const removeBtn = document.getElementById('remove-photo-btn');

    if (currentFormPhotoBase64) {
        if (imgEl) {
            imgEl.src = currentFormPhotoBase64;
            imgEl.style.display = 'block';
        }
        if (placeholderEl) placeholderEl.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    } else {
        if (imgEl) {
            imgEl.src = '';
            imgEl.style.display = 'none';
        }
        if (placeholderEl) placeholderEl.style.display = 'flex';
        if (removeBtn) removeBtn.style.display = 'none';
    }
};

function removeStudentPhoto() { if (typeof window.removeStudentPhoto === 'function' && window.removeStudentPhoto !== removeStudentPhoto) { window.removeStudentPhoto(); return; } if (typeof window.setFormPhoto === 'function') window.setFormPhoto(''); const fileInput = document.getElementById('student-photo-file-input'); if (fileInput) fileInput.value = ''; }
window.removeStudentPhoto = function() {
    setFormPhoto('');
    const fileInput = document.getElementById('student-photo-file-input');
    if (fileInput) fileInput.value = '';
};

window.handlePhotoFileInput = function(input) {
    if (input.files && input.files[0]) {
        compressAndSetPhoto(input.files[0]);
    }
};

window.handlePhotoDrop = function(e) {
    e.preventDefault();
    const dropzone = document.getElementById('student-photo-dropzone');
    if (dropzone) dropzone.style.borderColor = '#94a3b8';
    
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        compressAndSetPhoto(e.dataTransfer.files[0]);
    }
};

// Clipboard Paste for Image
window.addEventListener('paste', (e) => {
    const formSection = document.getElementById('profile-form-section');
    if (!formSection || formSection.style.display === 'none') return;
    
    if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
            const item = e.clipboardData.items[i];
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                compressAndSetPhoto(blob);
                break;
            }
        }
    }
});

// Render Table
function renderTable(dataToRender = studentProfiles) {
    tableBody.innerHTML = '';
    
    if (dataToRender.length === 0) {
        emptyState.classList.remove('hidden');
        tableResponsive.style.display = 'none';
        return;
    }
    
    emptyState.classList.add('hidden');
    tableResponsive.style.display = 'block';

    dataToRender.forEach((student, index) => {
        const row = document.createElement('tr');
        
        // Format parents name
        let parents = '';
        if (student.fatherName && student.motherName) {
            parents = `${student.fatherName} / ${student.motherName}`;
        } else if (student.fatherName || student.motherName) {
            parents = student.fatherName || student.motherName;
        } else {
            parents = student.guardian || student.guardianName || '';
        }

        const isRepeater = student.status === 'សិស្សចាស់ (ត្រួតថ្នាក់)' || student.status === 'ត្រួតថ្នាក់' || student.status === 'សិស្សចាស់';
        const statusBadge = isRepeater 
            ? `<span style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">សិស្សចាស់ (ត្រួតថ្នាក់)</span>`
            : `<span style="background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">សិស្សថ្មី</span>`;
        
        // Equity Card Badge
        let equityBadge = `<span style="color: var(--text-secondary); font-size: 0.85rem;">គ្មាន</span>`;
        const eq = student.equityCard;
        const eqNo = student.equityCardNo ? `<span style="font-family: monospace; font-size: 0.72rem; letter-spacing: 0.5px; opacity: 0.95;">#${student.equityCardNo}</span>` : '';
        
        if (eq === 'កម្រិតក្រ១' || eq === 'ក្រ១') {
            equityBadge = `<span style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; display: inline-flex; flex-direction: column; align-items: center; gap: 2px;" title="កម្រិតក្រ១ ${student.equityCardNo ? '· លេខប័ណ្ណ៖ ' + student.equityCardNo : ''}"><span>ក្រ១ (ទីទាល់ក្រ)</span>${eqNo}</span>`;
        } else if (eq === 'កម្រិតក្រ២' || eq === 'ក្រ២') {
            equityBadge = `<span style="background: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; display: inline-flex; flex-direction: column; align-items: center; gap: 2px;" title="កម្រិតក្រ២ ${student.equityCardNo ? '· លេខប័ណ្ណ៖ ' + student.equityCardNo : ''}"><span>ក្រ២ (ក្រីក្រ)</span>${eqNo}</span>`;
        } else if (eq === 'កម្រិតក្រ៣' || eq === 'ក្រ៣') {
            equityBadge = `<span style="background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; display: inline-flex; flex-direction: column; align-items: center; gap: 2px;" title="កម្រិតក្រ៣ ${student.equityCardNo ? '· លេខប័ណ្ណ៖ ' + student.equityCardNo : ''}"><span>ក្រ៣ (ងាយរង)</span>${eqNo}</span>`;
        }

        // Family Members & Orphan Badge
        let familyMemStr = '-';
        const tot = student.familyMembersTot !== undefined && student.familyMembersTot !== '' ? student.familyMembersTot : (student.familyMembers || '');
        const fem = student.familyMembersFem !== undefined && student.familyMembersFem !== '' ? student.familyMembersFem : (student.familyFemales || '');
        if (tot && fem) {
            familyMemStr = `<span style="font-weight: 600; color: #1e293b;">${tot}</span> <span style="font-size: 0.8rem; color: #64748b;">(ស្រី ${fem})</span>`;
        } else if (tot) {
            familyMemStr = `<span style="font-weight: 600; color: #1e293b;">${tot}</span>`;
        } else if (fem) {
            familyMemStr = `<span style="font-size: 0.8rem; color: #64748b;">ស្រី ${fem}</span>`;
        }
        
        let orphanBadge = `<span style="color: var(--text-secondary); font-size: 0.85rem;">មិនកំព្រា</span>`;
        const orph = (student.orphanStatus || '').trim();
        if (orph === 'កំព្រាឪពុក') {
            orphanBadge = `<span style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 2px 7px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">កំព្រាឪពុក</span>`;
        } else if (orph === 'កំព្រាម្តាយ') {
            orphanBadge = `<span style="background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 2px 7px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; white-space: nowrap;">កំព្រាម្តាយ</span>`;
        } else if (orph === 'កំព្រាទាំងឪពុកនិងម្តាយ' || orph.includes('ទាំង')) {
            orphanBadge = `<span style="background: #7f1d1d; color: #ffffff; padding: 2px 7px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; white-space: nowrap;">កំព្រាទាំងពីរ</span>`;
        }

        // Student Photo / Avatar markup
        const sPhoto = student.photo || (window.getStudentPhoto ? window.getStudentPhoto(student.id) : '');
        let photoMarkup = '';
        if (sPhoto) {
            photoMarkup = `<img src="${sPhoto}" alt="${student.name}" class="student-table-photo" onclick="viewStudentProfile('${student.id}')" title="ចុចដើម្បីមើលប្រវត្តិរូបពេញលេញ">`;
        } else {
            const isFemale = student.gender === 'ស' || student.gender === 'ស្រី' || student.gender === 'F';
            photoMarkup = `
                <div class="student-table-no-photo" onclick="viewStudentProfile('${student.id}')" style="background: ${isFemale ? '#fdf2f8' : '#eff6ff'}; border: 1px dashed ${isFemale ? '#f472b6' : '#93c5fd'}; color: ${isFemale ? '#db2777' : '#2563eb'};" title="មិនទាន់មានរូបថត - ចុចដើម្បីមើល">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
            `;
        }

        row.innerHTML = `
            <td style="text-align: center;"><span class="rank">${index + 1}</span></td>
            <td style="text-align: center; vertical-align: middle; padding: 4px;">${photoMarkup}</td>
            <td style="text-align: center;"><span class="grade-badge grade-b">${student.id}</span></td>
            <td style="font-weight: 700; color: var(--text-primary); cursor: pointer;" onclick="viewStudentProfile('${student.id}')" title="ចុចដើម្បីមើលប្រវត្តិរូប">${student.name}</td>
            <td style="text-align: center;">${student.gender}</td>
            <td>${statusBadge}</td>
            <td style="white-space: nowrap; font-size: 0.92rem; text-align: center;">${formatDOB(student.dob)}</td>
            <td style="white-space: nowrap; text-align: center;">${calculateAge(student.dob)}</td>
            <td>${parents}</td>
            <td>${student.phone || ''}</td>
            <td style="display: flex; justify-content: center; align-items: center; gap: 6px; min-width: 270px;">
                <button class="btn-icon" onclick="viewStudentProfile('${student.id}')" title="មើលប្រវត្តិរូបពេញលេញ" style="color: #0284c7; background: #f0f9ff; border-radius: 6px; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-icon" onclick="window.location.href='student-id-card.html?studentId=${student.id}'" title="ចេញប័ណ្ណសម្គាល់ខ្លួនសិស្ស (កាតសិស្ស)" style="color: #0052cc; background: #eff6ff; border-radius: 6px; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2"/><path d="M15 12h2"/><path d="M7 16h10"/></svg>
                </button>
                <button class="btn-icon" onclick="window.location.href='enrollment-certificate.html?studentId=${student.id}'" title="ចេញលិខិតបញ្ជាក់ការចុះឈ្មោះ" style="color: #059669; background: #ecfdf5; border-radius: 6px; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                </button>
                <button class="btn-icon" onclick="window.location.href='study-certificate.html?studentId=${student.id}'" title="ចេញលិខិតបញ្ជាក់ការសិក្សា" style="color: #7c3aed; background: #f5f3ff; border-radius: 6px; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </button>
                <button class="btn-icon" onclick="window.location.href='praise-certificate.html?studentId=${student.id}'" title="ចេញប័ណ្ណសរសើរ" style="color: #d97706; background: #fef3c7; border-radius: 6px; padding: 4px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                </button>
                <button class="btn-icon btn-edit" onclick="editStudent('${student.id}')" title="កែប្រែទិន្នន័យ" style="color: var(--primary);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteStudent('${student.id}', this)" title="លុបសិស្សនេះចេញពីប្រព័ន្ធ និង Google Sheet" style="color: #dc2626; background: #fee2e2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 4px; cursor: pointer;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Save Data
function saveData(immediate = false) {
    const curKey = window.getKey('studentProfilesData');
    
    // Mark edit timestamp to protect user data from stale cloud pulls
    window._lastLocalEditTime = Date.now();
    try {
        localStorage.setItem('_last_local_student_edit_time', String(Date.now()));
        localStorage.setItem('system_initialized', 'true');
        localStorage.setItem('plung_full_backup_2026_10_31_loaded_v2', 'true');
    } catch(e) {}

    // Persist photos to student_photos_vault so they never get lost during sync
    try {
        let vault = JSON.parse(localStorage.getItem('student_photos_vault') || '{}');
        let vaultModified = false;
        studentProfiles.forEach(s => {
            if (s && s.id && s.photo) {
                const sId = String(s.id).trim();
                if (vault[sId] !== s.photo) {
                    vault[sId] = s.photo;
                    vaultModified = true;
                }
            }
        });
        if (vaultModified) {
            localStorage.setItem('student_photos_vault', JSON.stringify(vault));
        }
    } catch(e) {}

    localStorage.setItem(curKey, JSON.stringify(studentProfiles));
    if (window.dbSync && window.dbSync.saveKey) {
        window.dbSync.saveKey(curKey, JSON.stringify(studentProfiles));
    }
    if (window.triggerGoogleAutoSync) {
        window.triggerGoogleAutoSync(immediate);
    }
    renderTable();
}

// Sort students alphabetically (Khmer collation: ក -> អ)
window.sortStudentsAlphabetical = function() {
    const curKey = window.getKey('studentProfilesData');
    studentProfiles = JSON.parse(localStorage.getItem(curKey)) || [];

    if (!studentProfiles || studentProfiles.length === 0) {
        alert('មិនមានទិន្នន័យសិស្សដើម្បីតម្រៀបទេ!');
        return;
    }

    // Sort using standard Khmer alphabetical order (ក - អ)
    studentProfiles.sort((a, b) => {
        const nameA = (a.name || '').trim();
        const nameB = (b.name || '').trim();
        return nameA.localeCompare(nameB, 'km', { sensitivity: 'base', numeric: true });
    });

    // Save sorted list to localStorage
    localStorage.setItem(curKey, JSON.stringify(studentProfiles));

    // Re-render table
    renderTable();

    // Trigger cloud sync if available
    if (window.dbSync && window.dbSync.saveKey) {
        window.dbSync.saveKey(curKey, JSON.stringify(studentProfiles));
    }

    showSortNotification('🎉 បានតម្រៀបសិស្សតាមលំដាប់ឈ្មោះ (ក ដល់ អ) និងរក្សាទុកដោយជោគជ័យ!');
};

function showSortNotification(msg) {
    let notif = document.getElementById('sort-toast-notif');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'sort-toast-notif';
        notif.style.cssText = 'position: fixed; bottom: 25px; right: 25px; background: #0f172a; color: #f8fafc; padding: 14px 22px; border-radius: 12px; font-family: "Battambang", sans-serif; font-size: 0.92rem; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.35); border-left: 5px solid #10b981; transition: all 0.3s ease; opacity: 0; transform: translateY(20px); pointer-events: none;';
        document.body.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0)';
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(20px)';
    }, 3000);
}

// Difficulty Labels Map
const DIFFICULTY_LABELS = {
    'diff_see': 'ពិបាកក្នុងការមើល',
    'diff_hear': 'ពិបាកក្នុងការស្ដាប់',
    'diff_speak': 'ពិបាកក្នុងការនិយាយ',
    'diff_write': 'ពិបាកក្នុងការសរសេរ',
    'diff_move': 'ពិបាកក្នុងការធ្វើចលនា',
    'diff_learn': 'ពិបាកក្នុងការរៀនសូត្រ',
    'diff_mental': 'ពិបាកខាងផ្លូវចិត្ត',
    'diff_nutrition': 'ខ្វះអាហារូបត្ថម្ភធ្ងន់ធ្ងរ',
    'diff_health1': 'សុខភាព/ជំងឺប្រចាំកាយ',
    'diff_migrant': 'មកពីគ្រួសារផ្លាស់ប្ដូរទីលំនៅ',
    'diff_orphan': 'កុមារកំព្រា',
    'diff_violence': 'កុមាររងអំពើហិង្សាក្នុងគ្រួសារ',
    'diff_exploit': 'កុមាររងការកេងប្រវ័ញ្ចកម្លាំង',
    'diff_posture': 'បញ្ហាកាយវិការ',
    'diff_health2': 'ជំងឺប្រចាំកាយ',
    'diff_disabled_total': 'សិស្សពិការភាព'
};

function getSelectedDifficulties() {
    const checkboxes = document.querySelectorAll('input[name="difficulty-checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function updateDifficultyDisplay() {
    const selected = getSelectedDifficulties();
    const tagsContainer = document.getElementById('difficulty-selected-tags');
    const countBadge = document.getElementById('difficulty-count-badge');
    if (!tagsContainer) return;

    tagsContainer.innerHTML = '';
    if (selected.length === 0) {
        tagsContainer.innerHTML = '<span class="placeholder-text" style="color: #94a3b8; font-size: 0.92rem;">គ្មានបញ្ហា/ការលំបាក (ចុចដើម្បីជ្រើសរើស...)</span>';
        if (countBadge) countBadge.style.display = 'none';
    } else {
        selected.forEach(val => {
            const label = DIFFICULTY_LABELS[val] || val;
            const tag = document.createElement('span');
            tag.style.cssText = 'background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 6px; font-size: 0.84rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;';
            tag.innerHTML = `<span>${label}</span><span style="cursor: pointer; font-size: 0.85rem; opacity: 0.7; hover: opacity: 1;" title="លុប">✕</span>`;
            tag.querySelector('span:last-child').onclick = (e) => {
                e.stopPropagation();
                const cb = document.querySelector(`input[name="difficulty-checkbox"][value="${val}"]`);
                if (cb) {
                    cb.checked = false;
                    updateDifficultyDisplay();
                }
            };
            tagsContainer.appendChild(tag);
        });
        if (countBadge) {
            countBadge.textContent = `ជ្រើសរើស ${selected.length}`;
            countBadge.style.display = 'inline-block';
        }
    }
}

function setSelectedDifficulties(diffValues) {
    let list = [];
    if (Array.isArray(diffValues)) {
        list = diffValues;
    } else if (typeof diffValues === 'string' && diffValues.trim() !== '') {
        list = diffValues.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    const checkboxes = document.querySelectorAll('input[name="difficulty-checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = list.includes(cb.value);
    });
    updateDifficultyDisplay();
}

function clearSelectedDifficulties() {
    const checkboxes = document.querySelectorAll('input[name="difficulty-checkbox"]');
    checkboxes.forEach(cb => { cb.checked = false; });
    updateDifficultyDisplay();
}

function initDifficultyMultiSelect() {
    const btn = document.getElementById('difficulty-select-btn');
    const menu = document.getElementById('difficulty-dropdown-menu');
    const arrow = document.getElementById('difficulty-arrow');
    const clearBtn = document.getElementById('clear-difficulties-btn');

    if (btn && menu) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.style.display === 'block';
            menu.style.display = isOpen ? 'none' : 'block';
            if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.style.display = 'none';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            clearSelectedDifficulties();
        });
    }

    const checkboxes = document.querySelectorAll('input[name="difficulty-checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            updateDifficultyDisplay();
        });
    });
}
initDifficultyMultiSelect();

let isEditMode = false;

// Toggle Student Profile Form Modal
window.toggleStudentForm = function(show) {
    const formModal = document.getElementById('profile-form-modal');
    if (!formModal) return;

    if (show === undefined) {
        show = (formModal.style.display === 'none' || formModal.style.display === '');
    }

    if (show) {
        formModal.style.display = 'flex';
        if (!isEditMode) {
            form.reset();
            document.getElementById('student-id').readOnly = false;
            document.getElementById('student-id').style.backgroundColor = '';
            if (document.getElementById('family-members-tot')) document.getElementById('family-members-tot').value = '';
            if (document.getElementById('family-members-fem')) document.getElementById('family-members-fem').value = '';
            if (document.getElementById('orphan-status')) document.getElementById('orphan-status').value = 'មិនកំព្រា';
            if (document.getElementById('equity-card')) document.getElementById('equity-card').value = 'គ្មាន';
            if (document.getElementById('equity-card-no')) document.getElementById('equity-card-no').value = '';
            clearSelectedDifficulties();

            const titleText = document.getElementById('form-title-text');
            if (titleText) titleText.textContent = 'បញ្ចូលប្រវត្តិរូបសិស្សថ្មី';
            const formIcon = document.getElementById('form-icon');
            if (formIcon) formIcon.textContent = '➕';

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <span>រក្សាទុកទិន្នន័យ</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                `;
                submitBtn.classList.remove('pulse');
            }
        }
        setTimeout(() => {
            const idInput = document.getElementById('student-id');
            if (idInput && !idInput.readOnly) idInput.focus();
        }, 200);
    } else {
        formModal.style.display = 'none';
        if (isEditMode) {
            cancelEdit();
        }
    }
};

// Edit Student
window.editStudent = function(id) {
    const student = studentProfiles.find(s => s.id === id);
    if (!student) return;

    // Auto-heal missing mother/father info if absent
    if (!student.motherName || !student.fatherName) {
        if (recoverStudentParentInfo(student)) {
            try {
                localStorage.setItem(window.getKey('studentProfilesData'), JSON.stringify(studentProfiles));
            } catch(e){}
        }
    }

    const formModal = document.getElementById('profile-form-modal');
    if (formModal) formModal.style.display = 'flex';

    const titleText = document.getElementById('form-title-text');
    if (titleText) titleText.textContent = `កែប្រែប្រវត្តិរូបសិស្ស ៖ ${student.name}`;
    const formIcon = document.getElementById('form-icon');
    if (formIcon) formIcon.textContent = '✏️';

    document.getElementById('student-id').value = student.id;
    document.getElementById('student-id').readOnly = true; // prevent changing ID
    document.getElementById('student-id').style.backgroundColor = '#f1f5f9';
    
    // Names
    const nameParts = (student.name || '').trim().split(/\s+/);
    document.getElementById('last-name').value = student.lastName || nameParts[0] || '';
    document.getElementById('first-name').value = student.firstName || nameParts.slice(1).join(' ') || '';
    
    // Gender
    const gen = (student.gender || '').trim();
    if (gen === 'ស្រី' || gen.toLowerCase() === 'f' || gen === 'ស') {
        document.getElementById('gender').value = 'ស';
    } else {
        document.getElementById('gender').value = 'ប';
    }
    
    // Status
    const statusEl = document.getElementById('student-status');
    if (statusEl) {
        const st = (student.status || '').trim();
        statusEl.value = (st.includes('ចាស់') || st.includes('ត្រួតថ្នាក់')) ? 'សិស្សចាស់ (ត្រួតថ្នាក់)' : 'សិស្សថ្មី';
    }

    // Family Members
    const famTotEl = document.getElementById('family-members-tot');
    if (famTotEl) {
        famTotEl.value = (student.familyMembersTot !== undefined && student.familyMembersTot !== null && student.familyMembersTot !== '') 
            ? student.familyMembersTot 
            : (student.familyMembers || student.familyTotal || '');
    }
    const famFemEl = document.getElementById('family-members-fem');
    if (famFemEl) {
        famFemEl.value = (student.familyMembersFem !== undefined && student.familyMembersFem !== null && student.familyMembersFem !== '') 
            ? student.familyMembersFem 
            : (student.familyFemales || student.femaleMembers || '');
    }

    // Orphan Status (with Khmer character normalization)
    const orphanEl = document.getElementById('orphan-status');
    if (orphanEl) {
        const orph = (student.orphanStatus || '').trim().replace(/្ដ/g, '្ត').replace(/ឳ/g, 'ឪ');
        if ((orph.includes('ឪពុក') && orph.includes('ម្តាយ')) || orph.includes('ទាំងពីរ') || orph.includes('ទាំង២') || orph.toLowerCase().includes('double')) {
            orphanEl.value = 'កំព្រាទាំងឪពុកនិងម្តាយ';
        } else if (orph.includes('ឪពុក') || orph.toLowerCase().includes('father')) {
            orphanEl.value = 'កំព្រាឪពុក';
        } else if (orph.includes('ម្តាយ') || orph.toLowerCase().includes('mother')) {
            orphanEl.value = 'កំព្រាម្តាយ';
        } else {
            orphanEl.value = 'មិនកំព្រា';
        }
    }

    // Equity Card
    const equityEl = document.getElementById('equity-card');
    if (equityEl) {
        const eq = (student.equityCard || student.equityStatus || '').trim();
        if (eq.includes('ក្រ១') || eq === '1' || eq.toLowerCase().includes('poor 1') || eq.includes('ទីទាល់ក្រ')) {
            equityEl.value = 'កម្រិតក្រ១';
        } else if (eq.includes('ក្រ២') || eq === '2' || eq.toLowerCase().includes('poor 2') || eq.includes('ក្រីក្រ')) {
            equityEl.value = 'កម្រិតក្រ២';
        } else if (eq.includes('ក្រ៣') || eq === '3' || eq.toLowerCase().includes('poor 3') || eq.includes('ងាយរង')) {
            equityEl.value = 'កម្រិតក្រ៣';
        } else if (eq === 'កម្រិតក្រ១' || eq === 'កម្រិតក្រ២' || eq === 'កម្រិតក្រ៣') {
            equityEl.value = eq;
        } else {
            equityEl.value = 'គ្មាន';
        }
    }
    const equityNoEl = document.getElementById('equity-card-no');
    if (equityNoEl) {
        equityNoEl.value = student.equityCardNo || student.equityNo || '';
        if (!equityNoEl.value && student.note && student.note.includes('/')) {
            const noteParts = student.note.split('/');
            if (noteParts.length >= 2) {
                equityNoEl.value = noteParts.slice(1).join('/');
            }
        }
    }

    // Indigenous
    const indEl = document.getElementById('is-indigenous');
    if (indEl) {
        const isInd = student.isIndigenous === true || 
                      student.isIndigenous === 'ពិតមែន' || 
                      student.indigenous === true || 
                      student.indigenous === 'ពិតមែន' ||
                      student.isIndigenous === 'បាទ' ||
                      student.isIndigenous === 'yes';
        indEl.value = isInd ? 'ពិតមែន' : 'ទេ';
    }

    // Early Childhood
    const earlyEl = document.getElementById('early-childhood');
    if (earlyEl) {
        const isEarly = student.earlyChildhood === true || 
                        student.earlyChildhood === 'បានឆ្លងកាត់' || 
                        student.earlyChildhoodProgram === true || 
                        student.earlyChildhoodProgram === 'បានឆ្លងកាត់' ||
                        student.earlyChildhood === 'បាទ' ||
                        student.earlyChildhood === 'yes';
        earlyEl.value = isEarly ? 'បានឆ្លងកាត់' : 'ទេ';
    }
    
    // Multi-select Difficulty
    setSelectedDifficulties(student.difficulty);

    // DOB
    document.getElementById('dob').value = formatToInputDate(student.dob);
    document.getElementById('dob').dataset.originalDob = student.dob || '';

    // POB
    document.getElementById('pob-village').value = student.pobVillage || '';
    document.getElementById('pob-commune').value = student.pobCommune || '';
    document.getElementById('pob-district').value = student.pobDistrict || '';
    document.getElementById('pob-province').value = student.pobProvince || student.pob || '';
    
    // Parents & Guardian
    let oldFather = '', oldMother = '';
    if (student.guardian) {
        const rawG = student.guardian.toString().replace(/្ដ/g, '្ត');
        if (rawG.includes('/')) {
            const parts = rawG.split(/\s*\/\s*/);
            oldFather = (parts[0] || '').trim();
            oldMother = (parts[1] || '').trim();
        } else if (rawG.includes(' និង ')) {
            const parts = rawG.split(/\s*និង\s*/);
            oldFather = (parts[0] || '').trim();
            oldMother = (parts[1] || '').trim();
        } else if (!student.fatherName && !student.guardianName) {
            oldFather = student.guardian;
        }
    }

    const resolvedFather = student.fatherName || oldFather || '';
    const resolvedMother = student.motherName || oldMother || '';

    document.getElementById('father-name').value = resolvedFather;
    document.getElementById('father-job').value = student.fatherJob || '';
    document.getElementById('mother-name').value = resolvedMother;
    document.getElementById('mother-job').value = student.motherJob || '';
    document.getElementById('guardian-name').value = student.guardianName || (!resolvedFather && !resolvedMother ? (student.guardian || '') : '');
    document.getElementById('guardian-job').value = student.guardianJob || '';
    
    // Current Address
    document.getElementById('curr-house').value = student.currHouse || '';
    document.getElementById('curr-village').value = student.currVillage || '';
    document.getElementById('curr-commune').value = student.currCommune || '';
    document.getElementById('curr-district').value = student.currDistrict || '';
    document.getElementById('curr-province').value = student.currProvince || student.currentAddress || student.address || '';
    
    // Phone
    document.getElementById('phone').value = (student.phone || '').replace(/^\$/, '');
    
    // Photo
    setFormPhoto(student.photo || '');
    
    isEditMode = true;
    const submitBtns = form.querySelectorAll('button[type="submit"]');
    submitBtns.forEach(btn => {
        btn.innerHTML = `
            <span>កែប្រែទិន្នន័យ (Update)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        `;
        btn.classList.add('pulse');
    });

    // Always reset modal scroll to top
    const modalContainer = document.getElementById('profile-modal-container');
    if (modalContainer) {
        modalContainer.scrollTop = 0;
    }
};

function cancelEdit() {
    isEditMode = false;
    try {
        if (form && typeof form.reset === 'function') form.reset();
    } catch (e) {}

    const studentIdEl = document.getElementById('student-id');
    if (studentIdEl) {
        studentIdEl.readOnly = false;
        studentIdEl.style.backgroundColor = '';
    }
    
    const dobEl = document.getElementById('dob');
    if (dobEl) {
        delete dobEl.dataset.originalDob;
    }
    
    try {
        if (typeof window.removeStudentPhoto === 'function') {
            window.removeStudentPhoto();
        } else if (typeof removeStudentPhoto === 'function') {
            removeStudentPhoto();
        }
    } catch (e) {}
    
    if (document.getElementById('family-members-tot')) document.getElementById('family-members-tot').value = '';
    if (document.getElementById('family-members-fem')) document.getElementById('family-members-fem').value = '';
    if (document.getElementById('orphan-status')) document.getElementById('orphan-status').value = 'មិនកំព្រា';
    const equityEl = document.getElementById('equity-card');
    if (equityEl) equityEl.value = 'គ្មាន';
    const equityNoEl = document.getElementById('equity-card-no');
    if (equityNoEl) equityNoEl.value = '';
    
    try {
        if (typeof window.clearSelectedDifficulties === 'function') {
            window.clearSelectedDifficulties();
        } else if (typeof clearSelectedDifficulties === 'function') {
            clearSelectedDifficulties();
        }
    } catch (e) {}

    const titleText = document.getElementById('form-title-text');
    if (titleText) titleText.textContent = 'បញ្ចូលប្រវត្តិរូបសិស្សថ្មី';
    const formIcon = document.getElementById('form-icon');
    if (formIcon) formIcon.textContent = '➕';

    if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = `
                <span>រក្សាទុកទិន្នន័យ</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            `;
            submitBtn.classList.remove('pulse');
        }
    }
    
    const formModal = document.getElementById('profile-form-modal');
    if (formModal) formModal.style.display = 'none';
}

// Handle Form Submit Handler
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('student-id').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    const name = lastName + ' ' + firstName;
    
    const gender = document.getElementById('gender').value;
    const status = document.getElementById('student-status') ? document.getElementById('student-status').value : 'សិស្សថ្មី';
    const familyMembersTot = document.getElementById('family-members-tot') ? document.getElementById('family-members-tot').value.trim() : '';
    const familyMembersFem = document.getElementById('family-members-fem') ? document.getElementById('family-members-fem').value.trim() : '';
    const orphanStatus = document.getElementById('orphan-status') ? document.getElementById('orphan-status').value : 'មិនកំព្រា';
    const equityCard = document.getElementById('equity-card') ? document.getElementById('equity-card').value : 'គ្មាន';
    const equityCardNo = document.getElementById('equity-card-no') ? document.getElementById('equity-card-no').value.trim() : '';
    const dobInput = document.getElementById('dob').value;
    
    const pobVillage = document.getElementById('pob-village').value.trim();
    const pobCommune = document.getElementById('pob-commune').value.trim();
    const pobDistrict = document.getElementById('pob-district').value.trim();
    const pobProvince = document.getElementById('pob-province').value.trim();
    
    const fatherName = document.getElementById('father-name').value.trim();
    const fatherJob = document.getElementById('father-job').value.trim();
    const motherName = document.getElementById('mother-name').value.trim();
    const motherJob = document.getElementById('mother-job').value.trim();
    const guardianName = document.getElementById('guardian-name').value.trim();
    const guardianJob = document.getElementById('guardian-job').value.trim();
    
    const currHouse = document.getElementById('curr-house').value.trim();
    const currVillage = document.getElementById('curr-village').value.trim();
    const currCommune = document.getElementById('curr-commune').value.trim();
    const currDistrict = document.getElementById('curr-district').value.trim();
    const currProvince = document.getElementById('curr-province').value.trim();
    
    const phone = document.getElementById('phone').value.trim();
    const isIndigenous = document.getElementById('is-indigenous') ? document.getElementById('is-indigenous').value === 'ពិតមែន' : false;
    const earlyChildhood = document.getElementById('early-childhood') ? document.getElementById('early-childhood').value === 'បានឆ្លងកាត់' : false;
    const difficulty = getSelectedDifficulties();
    
    const photo = currentFormPhotoBase64 || '';
    
    const activeClassName = window.classManager ? window.classManager.getCurrentClassName() : 'ថ្នាក់ទី ៥ ក';
    const activeAcademicYear = window.classManager ? window.classManager.getCurrentAcademicYearName() : '២០២៥ - ២០២៦';

    if (isEditMode) {
        const studentIndex = studentProfiles.findIndex(s => s.id === id);
        if (studentIndex > -1) {
            const existing = studentProfiles[studentIndex];
            const originalDob = (document.getElementById('dob') && document.getElementById('dob').dataset.originalDob) || existing.dob || '';
            const dob = dobInput ? formatDOB(dobInput) : originalDob;
            const age = calculateAge(dob);

            const updatedStudent = {
                ...existing,
                id, name, lastName, firstName, gender, status,
                photo: photo || existing.photo || '',
                className: activeClassName,
                academicYear: activeAcademicYear,
                familyMembersTot, familyMembersFem, familyMembers: familyMembersTot,
                orphanStatus, equityCard, equityCardNo, isIndigenous, earlyChildhood, difficulty,
                dob, age, phone,
                pobVillage, pobCommune, pobDistrict, pobProvince,
                pob: [pobVillage ? 'ភូមិ' + pobVillage : '', pobCommune ? 'ឃុំ' + pobCommune : '', pobDistrict ? 'ស្រុក' + pobDistrict : '', pobProvince ? 'ខេត្ត' + pobProvince : ''].filter(Boolean).join(' '),
                fatherName, fatherJob,
                motherName, motherJob,
                guardianName, guardianJob,
                guardian: (fatherName && motherName) ? `${fatherName} / ${motherName}` : (fatherName || motherName || guardianName || existing.guardian || ''),
                currHouse, currVillage, currCommune, currDistrict, currProvince,
                address: [currHouse ? 'ផ្ទះ' + currHouse : '', currVillage ? 'ភូមិ' + currVillage : '', currCommune ? 'ឃុំ' + currCommune : '', currDistrict ? 'ស្រុក' + currDistrict : '', currProvince ? 'ខេត្ត' + currProvince : ''].filter(Boolean).join(' '),
                note: existing.note || (equityCard && equityCard !== 'គ្មាន' && equityCardNo ? `${equityCard}/${equityCardNo}` : '')
            };
            studentProfiles[studentIndex] = updatedStudent;
            saveData(true);
            cancelEdit();
            if (typeof window.triggerGoogleAutoSync === 'function') {
                window.triggerGoogleAutoSync(true);
            }

            // Real-time direct update to Google Sheets
            if (typeof window.updateStudentInGoogleSheets === 'function') {
                window.updateStudentInGoogleSheets(updatedStudent);
            }
            alert('ទិន្នន័យត្រូវបានកែប្រែដោយជោគជ័យ!');
        }
    } else {
        // Check if ID already exists
        if (studentProfiles.some(s => s.id === id)) {
            alert('អត្តលេខនេះមានរួចហើយ! សូមប្រើអត្តលេខផ្សេង។');
            return;
        }
        
        const dob = dobInput ? formatDOB(dobInput) : '';
        const age = calculateAge(dob);
        const studentData = { 
            id, name, lastName, firstName, gender, status, photo,
            className: activeClassName,
            academicYear: activeAcademicYear,
            familyMembersTot, familyMembersFem, familyMembers: familyMembersTot,
            orphanStatus, equityCard, equityCardNo, isIndigenous, earlyChildhood, difficulty, dob, age, phone,
            pobVillage, pobCommune, pobDistrict, pobProvince,
            pob: [pobVillage ? 'ភូមិ' + pobVillage : '', pobCommune ? 'ឃុំ' + pobCommune : '', pobDistrict ? 'ស្រុក' + pobDistrict : '', pobProvince ? 'ខេត្ត' + pobProvince : ''].filter(Boolean).join(' '),
            fatherName, fatherJob,
            motherName, motherJob,
            guardianName, guardianJob,
            guardian: (fatherName && motherName) ? `${fatherName} / ${motherName}` : (fatherName || motherName || guardianName || ''),
            currHouse, currVillage, currCommune, currDistrict, currProvince,
            address: [currHouse ? 'ផ្ទះ' + currHouse : '', currVillage ? 'ភូមិ' + currVillage : '', currCommune ? 'ឃុំ' + currCommune : '', currDistrict ? 'ស្រុក' + currDistrict : '', currProvince ? 'ខេត្ត' + currProvince : ''].filter(Boolean).join(' '),
            note: (equityCard && equityCard !== 'គ្មាន' && equityCardNo) ? `${equityCard}/${equityCardNo}` : ''
        };

        // Clear this ID from deleted list if re-added
        try {
            let deletedIds = JSON.parse(localStorage.getItem('user_deleted_student_ids') || '[]');
            deletedIds = deletedIds.filter(d => String(d).trim() !== String(id).trim());
            localStorage.setItem('user_deleted_student_ids', JSON.stringify(deletedIds));
        } catch(e) {}
        studentProfiles.push(studentData);
        saveData(true);
        if (typeof window.triggerGoogleAutoSync === 'function') {
            window.triggerGoogleAutoSync(true);
        }

        // Real-time direct add to Google Sheets
        if (typeof window.updateStudentInGoogleSheets === 'function') {
            window.updateStudentInGoogleSheets(studentData);
        }
        form.reset();
        removeStudentPhoto();
        if (document.getElementById('family-members-tot')) document.getElementById('family-members-tot').value = '';
        if (document.getElementById('family-members-fem')) document.getElementById('family-members-fem').value = '';
        if (document.getElementById('orphan-status')) document.getElementById('orphan-status').value = 'មិនកំព្រា';
        if (document.getElementById('equity-card')) document.getElementById('equity-card').value = 'គ្មាន';
        if (document.getElementById('equity-card-no')) document.getElementById('equity-card-no').value = '';
        clearSelectedDifficulties();
        document.getElementById('student-id').focus();
    }
});

// Delete Student
window.deleteStudent = function(id, btnElement) {
    // Record intentional deletion so cloud pull will not revive this student
    try {
        let deletedIds = JSON.parse(localStorage.getItem('user_deleted_student_ids') || '[]');
        const cleanId = String(id).trim();
        if (!deletedIds.includes(cleanId)) {
            deletedIds.push(cleanId);
            localStorage.setItem('user_deleted_student_ids', JSON.stringify(deletedIds));
        }
    } catch(e) {}
    if (confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះមែនទេ?')) {
        const row = btnElement ? btnElement.closest('tr') : null;
        if (row) row.classList.add('deleting');
        
        setTimeout(() => {
            studentProfiles = studentProfiles.filter(s => String(s.id).trim() !== String(id).trim());
            // Real-time Delete row in Google Sheets by ID (Column D)
            if (typeof window.deleteStudentFromGoogleSheets === 'function') {
                window.deleteStudentFromGoogleSheets(id);
            }
            try {
                let vault = JSON.parse(localStorage.getItem('student_photos_vault') || '{}');
                if (vault[String(id).trim()]) {
                    delete vault[String(id).trim()];
                    localStorage.setItem('student_photos_vault', JSON.stringify(vault));
                }
            } catch(e) {}
            
            // Clean up related grade records for this student in current class
            const months = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា'];
            months.forEach(m => {
                try {
                    const mKey = window.getKey ? window.getKey(`studentGrades_${m}`) : `studentGrades_${m}`;
                    const mData = JSON.parse(localStorage.getItem(mKey));
                    if (Array.isArray(mData)) {
                        const filtered = mData.filter(s => String(s.id).trim() !== String(id).trim());
                        if (filtered.length !== mData.length) {
                            localStorage.setItem(mKey, JSON.stringify(filtered));
                        }
                    }
                } catch(e) {}
            });

            ['semester1ExamGrades', 'semester2ExamGrades', 'annualExamGrades'].forEach(semKeyName => {
                try {
                    const semKey = window.getKey ? window.getKey(semKeyName) : semKeyName;
                    const semData = JSON.parse(localStorage.getItem(semKey));
                    if (Array.isArray(semData)) {
                        const filtered = semData.filter(s => String(s.id).trim() !== String(id).trim());
                        if (filtered.length !== semData.length) {
                            localStorage.setItem(semKey, JSON.stringify(filtered));
                        }
                    } else if (semData && typeof semData === 'object') {
                        if (semData[id]) {
                            delete semData[id];
                            localStorage.setItem(semKey, JSON.stringify(semData));
                        }
                    }
                } catch(e) {}
            });

            saveData(true);
            if (isEditMode && document.getElementById('student-id') && document.getElementById('student-id').value === id) {
                cancelEdit();
            }
        }, 300); // Wait for animation to finish
    }
};

// --- VIEW STUDENT FULL PROFILE MODAL ---
let currentViewingStudentId = null;

window.viewStudentProfile = function(id) {
    const student = studentProfiles.find(s => s.id === id);
    if (!student) return;

    currentViewingStudentId = id;
    const modal = document.getElementById('view-profile-modal');
    if (!modal) return;

    // Header & Hero
    document.getElementById('view-modal-name-header').textContent = `ប្រវត្តិរូបសិស្ស ៖ ${student.name}`;
    document.getElementById('view-modal-name').textContent = student.name || '-';
    document.getElementById('view-modal-id').textContent = student.id || '-';
    document.getElementById('view-modal-dob').textContent = formatDOB(student.dob);
    document.getElementById('view-modal-age').textContent = calculateAge(student.dob) || '-';
    document.getElementById('view-modal-phone').textContent = student.phone || 'គ្មានលេខទូរស័ព្ទ';

    // Gender Badge
    const gText = student.gender === 'ស' || student.gender === 'ស្រី' || student.gender === 'F' ? 'ស្រី (Female)' : 'ប្រុស (Male)';
    document.getElementById('view-modal-gender-badge').textContent = `ភេទ ៖ ${gText}`;

    // Status Badge
    const isRepeater = student.status === 'សិស្សចាស់ (ត្រួតថ្នាក់)' || student.status === 'ត្រួតថ្នាក់' || student.status === 'សិស្សចាស់';
    const statusBadgeEl = document.getElementById('view-modal-status-badge');
    if (statusBadgeEl) {
        if (isRepeater) {
            statusBadgeEl.textContent = 'សិស្សចាស់ (ត្រួតថ្នាក់)';
            statusBadgeEl.style.background = '#fef3c7';
            statusBadgeEl.style.color = '#b45309';
            statusBadgeEl.style.borderColor = '#fde68a';
        } else {
            statusBadgeEl.textContent = 'សិស្សថ្មី';
            statusBadgeEl.style.background = '#dcfce7';
            statusBadgeEl.style.color = '#15803d';
            statusBadgeEl.style.borderColor = '#bbf7d0';
        }
    }

    // Photo Display
    const photoImg = document.getElementById('view-modal-photo');
    const photoPlaceholder = document.getElementById('view-modal-photo-placeholder');
    if (student.photo) {
        photoImg.src = student.photo;
        photoImg.style.display = 'block';
        photoPlaceholder.style.display = 'none';
    } else {
        photoImg.src = '';
        photoImg.style.display = 'none';
        photoPlaceholder.style.display = 'flex';
    }

    // POB
    document.getElementById('view-modal-pob-vil').textContent = student.pobVillage || '-';
    document.getElementById('view-modal-pob-com').textContent = student.pobCommune || '-';
    document.getElementById('view-modal-pob-dis').textContent = student.pobDistrict || '-';
    document.getElementById('view-modal-pob-prov').textContent = student.pobProvince || student.pob || '-';

    // Residence
    document.getElementById('view-modal-curr-house').textContent = student.currHouse || '-';
    document.getElementById('view-modal-curr-vil').textContent = student.currVillage || '-';
    document.getElementById('view-modal-curr-com').textContent = student.currCommune || '-';
    const disProv = [student.currDistrict, student.currProvince].filter(Boolean).join(' - ');
    document.getElementById('view-modal-curr-disprov').textContent = disProv || '-';

    // Family
    let fFallback = '', mFallback = '';
    if (student.guardian) {
        const rawG = student.guardian.toString().replace(/្ដ/g, '្ត');
        if (rawG.includes('/')) {
            const parts = rawG.split(/\s*\/\s*/);
            fFallback = (parts[0] || '').trim();
            mFallback = (parts[1] || '').trim();
        } else if (rawG.includes(' និង ')) {
            const parts = rawG.split(/\s*និង\s*/);
            fFallback = (parts[0] || '').trim();
            mFallback = (parts[1] || '').trim();
        }
    }
    const dispFather = student.fatherName || fFallback || '-';
    const dispMother = student.motherName || mFallback || '-';

    document.getElementById('view-modal-father').textContent = dispFather;
    document.getElementById('view-modal-father-job').textContent = student.fatherJob ? `(${student.fatherJob})` : '';
    document.getElementById('view-modal-mother').textContent = dispMother;
    document.getElementById('view-modal-mother-job').textContent = student.motherJob ? `(${student.motherJob})` : '';
    document.getElementById('view-modal-guardian').textContent = student.guardianName || (dispFather === '-' && dispMother === '-' ? student.guardian : '') || '-';
    document.getElementById('view-modal-guardian-job').textContent = student.guardianJob ? `(${student.guardianJob})` : '';

    const tot = student.familyMembersTot !== undefined && student.familyMembersTot !== '' ? student.familyMembersTot : (student.familyMembers || '');
    const fem = student.familyMembersFem !== undefined && student.familyMembersFem !== '' ? student.familyMembersFem : (student.familyFemales || '');
    let famStr = '-';
    if (tot && fem) famStr = `${tot} នាក់ (ស្រី ${fem} នាក់)`;
    else if (tot) famStr = `${tot} នាក់`;
    else if (fem) famStr = `ស្រី ${fem} នាក់`;
    document.getElementById('view-modal-family-count').textContent = famStr;

    // Orphan Status
    const orph = (student.orphanStatus || '').trim();
    const orphEl = document.getElementById('view-modal-orphan-badge');
    if (orphEl) {
        if (orph === 'កំព្រាឪពុក') {
            orphEl.innerHTML = `<span style="background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700;">កំព្រាឪពុក</span>`;
        } else if (orph === 'កំព្រាម្តាយ') {
            orphEl.innerHTML = `<span style="background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 2px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700;">កំព្រាម្តាយ</span>`;
        } else if (orph === 'កំព្រាទាំងឪពុកនិងម្តាយ' || orph.includes('ទាំង')) {
            orphEl.innerHTML = `<span style="background: #7f1d1d; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-size: 0.82rem; font-weight: 700;">កំព្រាទាំងពីរ</span>`;
        } else {
            orphEl.innerHTML = `<span style="color: #64748b; font-weight: 600;">មិនកំព្រា</span>`;
        }
    }

    // Equity Card
    const eq = student.equityCard;
    const eqEl = document.getElementById('view-modal-equity-badge');
    if (eqEl) {
        const no = student.equityCardNo ? ` (#${student.equityCardNo})` : '';
        if (eq === 'កម្រិតក្រ១' || eq === 'ក្រ១') {
            eqEl.innerHTML = `<strong style="color: #b91c1c; background: #fee2e2; border: 1px solid #fca5a5; padding: 2px 8px; border-radius: 6px;">កម្រិតក្រ១ (ទីទាល់ក្រ)${no}</strong>`;
        } else if (eq === 'កម្រិតក្រ២' || eq === 'ក្រ២') {
            eqEl.innerHTML = `<strong style="color: #b45309; background: #fef3c7; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 6px;">កម្រិតក្រ២ (ក្រីក្រ)${no}</strong>`;
        } else if (eq === 'កម្រិតក្រ៣' || eq === 'ក្រ៣') {
            eqEl.innerHTML = `<strong style="color: #4338ca; background: #e0e7ff; border: 1px solid #c7d2fe; padding: 2px 8px; border-radius: 6px;">កម្រិតក្រ៣ (ងាយរង)${no}</strong>`;
        } else {
            eqEl.innerHTML = `<span style="color: #64748b;">គ្មានប័ណ្ណសមធម៌</span>`;
        }
    }

    document.getElementById('view-modal-indigenous').textContent = (student.isIndigenous || student.indigenous === 'ពិតមែន' || student.indigenous === true) ? 'ពិតមែន' : 'ទេ';
    document.getElementById('view-modal-early-childhood').textContent = (student.earlyChildhood || student.earlyChildhoodProgram) ? 'បានឆ្លងកាត់' : 'ទេ';

    // Difficulties Tags
    const diffContainer = document.getElementById('view-modal-difficulties-tags');
    if (diffContainer) {
        diffContainer.innerHTML = '';
        let diffList = [];
        if (Array.isArray(student.difficulty)) {
            diffList = student.difficulty;
        } else if (typeof student.difficulty === 'string' && student.difficulty.trim() !== '') {
            diffList = student.difficulty.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (diffList.length === 0) {
            diffContainer.innerHTML = '<span style="color: #94a3b8; font-size: 0.84rem;">គ្មានការលំបាក</span>';
        } else {
            diffList.forEach(d => {
                const label = DIFFICULTY_LABELS[d] || d;
                const isHighlight = d === 'diff_disabled_total';
                const tag = document.createElement('span');
                tag.style.cssText = isHighlight 
                    ? 'background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.82rem;'
                    : 'background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 0.82rem;';
                tag.textContent = label;
                diffContainer.appendChild(tag);
            });
        }
    }

    // Modal Button Actions
    const editBtn = document.getElementById('view-modal-edit-btn');
    if (editBtn) {
        editBtn.onclick = () => {
            closeViewProfileModal();
            editStudent(student.id);
        };
    }

    const cardBtn = document.getElementById('view-modal-card-btn');
    if (cardBtn) {
        cardBtn.onclick = () => {
            window.location.href = `student-id-card.html?studentId=${student.id}`;
        };
    }

    modal.style.display = 'flex';
};

window.openEditSection = function(sectionType) {
    if (!currentViewingStudentId) return;
    const studentId = currentViewingStudentId;
    closeViewProfileModal();
    editStudent(studentId);

    // Scroll to specific section target in the form
    setTimeout(() => {
        let targetEl = null;
        if (sectionType === 'pob') {
            targetEl = document.getElementById('pob-village');
        } else if (sectionType === 'residence') {
            targetEl = document.getElementById('curr-house');
        } else if (sectionType === 'family') {
            targetEl = document.getElementById('father-name');
        } else if (sectionType === 'equity') {
            targetEl = document.getElementById('equity-card');
        }
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.focus();
        }
    }, 250);
};

window.closeViewProfileModal = function() {
    const modal = document.getElementById('view-profile-modal');
    if (modal) modal.style.display = 'none';
};

window.printStudentProfileCard = function() {
    const printContent = document.getElementById('printable-profile-card');
    if (!printContent) return;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="km">
        <head>
            <meta charset="UTF-8">
            <title>ប្រវត្តិរូបសិស្ស</title>
            <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Moul&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Battambang', sans-serif; color: #000; padding: 20px; }
                h3 { font-family: 'Moul', cursive, serif; margin: 0; }
                @page { size: A4 portrait; margin: 1.5cm; }
                * { box-sizing: border-box; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            ${printContent.innerHTML}
        </body>
        </html>
    `);
    printWin.document.close();
};

// Clear Data Modal Handlers & Comprehensive Clear Logic
window.openClearDataModal = function() {
    const modal = document.getElementById('clear-data-modal');
    const className = (window.classManager && typeof window.classManager.getCurrentClassName === 'function') 
        ? window.classManager.getCurrentClassName() 
        : 'ថ្នាក់បច្ចុប្បន្ន';
    const curKey = window.getKey('studentProfilesData');
    let currentProfiles = [];
    try {
        currentProfiles = JSON.parse(localStorage.getItem(curKey)) || [];
    } catch (e) {}

    if (modal) {
        const classLabels = modal.querySelectorAll('.active-class-name-placeholder');
        classLabels.forEach(el => el.textContent = className);

        const countLabels = modal.querySelectorAll('.active-class-count-placeholder');
        countLabels.forEach(el => el.textContent = currentProfiles.length);

        modal.style.display = 'flex';
    } else {
        // Fallback to direct prompt if modal is absent
        window.executeClearCurrentClass();
    }
};

window.closeClearDataModal = function() {
    const modal = document.getElementById('clear-data-modal');
    if (modal) modal.style.display = 'none';
};

// 1. Clear Active Class Data
window.executeClearCurrentClass = function() {
    const className = (window.classManager && typeof window.classManager.getCurrentClassName === 'function') 
        ? window.classManager.getCurrentClassName() 
        : 'ថ្នាក់បច្ចុប្បន្ន';
    const classId = (window.classManager && typeof window.classManager.getActiveClassId === 'function')
        ? window.classManager.getActiveClassId()
        : 'default';
    const curKey = window.getKey('studentProfilesData');
    
    let currentProfiles = [];
    try { currentProfiles = JSON.parse(localStorage.getItem(curKey)) || []; } catch(e){}
    const count = currentProfiles.length;

    if (!confirm(`តើអ្នកពិតជាចង់សម្អាតទិន្នន័យសិស្សទាំងអស់ (${count} នាក់) ក្នុង «${className}» នេះមែនទេ?\n\n⚠️ សកម្មភាពនេះនឹងលុបបញ្ជីសិស្ស និងពិន្ទុក្នុងថ្នាក់នេះចេញ។`)) {
        return;
    }

    try {
        // Clear student profiles for this class
        // Record all cleared student IDs so cloud pull will never restore them
        try {
            let deletedIds = JSON.parse(localStorage.getItem('user_deleted_student_ids') || '[]');
            currentProfiles.forEach(p => {
                if (p && p.id && !deletedIds.includes(String(p.id).trim())) {
                    deletedIds.push(String(p.id).trim());
                }
            });
            localStorage.setItem('user_deleted_student_ids', JSON.stringify(deletedIds));
        } catch(e) {}

        studentProfiles = [];
        localStorage.setItem(curKey, JSON.stringify([]));

        // Call clear on Google Sheets directly
        if (typeof window.clearGoogleSheetClass === 'function') {
            window.clearGoogleSheetClass(className, (window.classManager ? window.classManager.getCurrentAcademicYearName() : '២០២៦ - ២០២៧'));
        }

        // Clear all grades associated with this class
        const months = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា'];
        months.forEach(m => {
            const gKey = (window.classManager && typeof window.classManager.getKey === 'function')
                ? window.classManager.getKey(`studentGrades_${m}`, classId)
                : `studentGrades_${m}_${classId}`;
            localStorage.removeItem(gKey);
        });

        // Semester & annual grades
        const sem1Key = (window.classManager && typeof window.classManager.getKey === 'function')
            ? window.classManager.getKey('semester1ExamGrades', classId)
            : `semester1ExamGrades_${classId}`;
        const sem2Key = (window.classManager && typeof window.classManager.getKey === 'function')
            ? window.classManager.getKey('semester2ExamGrades', classId)
            : `semester2ExamGrades_${classId}`;
        const annKey = (window.classManager && typeof window.classManager.getKey === 'function')
            ? window.classManager.getKey('annualExamGrades', classId)
            : `annualExamGrades_${classId}`;
        localStorage.removeItem(sem1Key);
        localStorage.removeItem(sem2Key);
        localStorage.removeItem(annKey);

        // Mark as user-cleared so auto-restore will NEVER reseed
        localStorage.setItem('data_cleared_by_user', 'true');
        localStorage.setItem('system_initialized', 'true');

        if (window.dbSync && window.dbSync.saveKey) {
            window.dbSync.saveKey(curKey, JSON.stringify([]));
        }

        // Safe reset form
        if (typeof cancelEdit === 'function') {
            try { cancelEdit(); } catch(e) { console.warn(e); }
        }

        // Close modal
        window.closeClearDataModal();

        // Render table
        renderTable();

        // Safe auto-sync
        if (typeof window.triggerGoogleAutoSync === 'function') {
            try { window.triggerGoogleAutoSync(true); } catch(e){}
        }

        showSortNotification(`🗑️ បានសម្អាតទិន្នន័យសិស្សក្នុង «${className}» ដោយជោគជ័យ!`);
    } catch (err) {
        console.error('Error in executeClearCurrentClass:', err);
        alert('មានបញ្ហាក្នុងការសម្អាតទិន្នន័យ៖ ' + err.message);
    }
};

// 2. Clear All Classes Data Across School
window.executeClearAllSchoolData = function() {
    if (!confirm('⚠️ ការព្រមានសំខាន់បំផុត ៖\n\nតើអ្នកពិតជាចង់សម្អាតទិន្នន័យសិស្ស និងពិន្ទុ «គ្រប់ថ្នាក់ទាំងអស់ក្នុងសាលា» (ថ្នាក់ទី ១ ដល់ ទី ៦) មែនទេ?\n\n👉 សកម្មភាពនេះនឹងលុបសិស្សគំរូចាស់ៗទាំងអស់ចេញ ដើម្បីឱ្យអ្នកបញ្ចូលទិន្នន័យសាលារៀនផ្លុងថ្មីសុទ្ធសាធ។\n\nចុច OK ដើម្បីបន្តការសម្អាត។')) {
        return;
    }

    try {
        const keysToRemove = [];
        const keysToEmptyArray = [];

        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;

            if (k.startsWith('studentProfilesData')) {
                keysToEmptyArray.push(k);
            } else if (
                k.startsWith('studentGrades_') ||
                k.startsWith('semester1ExamGrades') ||
                k.startsWith('semester2ExamGrades') ||
                k.startsWith('annualExamGrades') ||
                k.startsWith('attendance_') ||
                k.startsWith('seatPlan_') ||
                k.startsWith('student_duties_') ||
                k.startsWith('inventory_') ||
                k.startsWith('classroomInventory_') ||
                k.startsWith('timetable_') ||
                k.startsWith('classCouncil_')
            ) {
                keysToRemove.push(k);
            }
        }

        // Empty all student profile keys
        keysToEmptyArray.forEach(k => localStorage.setItem(k, JSON.stringify([])));
        localStorage.setItem('studentProfilesData', JSON.stringify([]));

        // Remove old grade and attendance keys
        keysToRemove.forEach(k => localStorage.removeItem(k));

        // Mark permanently as cleared so auto-seed NEVER brings back old data
        localStorage.setItem('data_cleared_by_user', 'true');
        localStorage.setItem('system_initialized', 'true');

        // Safe reset form
        studentProfiles = [];
        if (typeof cancelEdit === 'function') {
            try { cancelEdit(); } catch(e) { console.warn(e); }
        }

        // Close modal
        window.closeClearDataModal();

        // Render table
        renderTable();

        // Safe auto-sync
        if (typeof window.triggerGoogleAutoSync === 'function') {
            try { window.triggerGoogleAutoSync(true); } catch(e){}
        }

        showSortNotification('🎉 បានសម្អាតទិន្នន័យសិស្ស និងពិន្ទុគ្រប់ថ្នាក់ទាំងអស់ក្នុងសាលាដោយជោគជ័យ!');
    } catch (err) {
        console.error('Error in executeClearAllSchoolData:', err);
        alert('មានបញ្ហាក្នុងការសម្អាតទិន្នន័យ៖ ' + err.message);
    }
};

// Global entry point triggered by button
window.clearAllStudentData = function() {
    window.openClearDataModal();
};

if (clearBtn) {
    clearBtn.addEventListener('click', window.clearAllStudentData);
}

// Reload when active class changes
window.addEventListener('classChanged', () => {
    const curKey = window.getKey('studentProfilesData');
    studentProfiles = JSON.parse(localStorage.getItem(curKey)) || [];
    if (typeof window.cleanupStudentProfilesData === 'function') {
        window.cleanupStudentProfilesData();
    }
    if (typeof cancelEdit === 'function') {
        cancelEdit();
    }
    renderTable();
});

// Real-time Collaborative Sync: Update view when cloud changes from other devices
window.addEventListener('cloudDataUpdated', () => {
    if (typeof isEditMode !== 'undefined' && isEditMode) return;
    const curKey = window.getKey('studentProfilesData');
    studentProfiles = JSON.parse(localStorage.getItem(curKey)) || [];
    if (typeof window.cleanupStudentProfilesData === 'function') {
        window.cleanupStudentProfilesData();
    }
    if (typeof renderTable === 'function') {
        renderTable();
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredStudents = studentProfiles.filter(student => 
        student.name.toLowerCase().includes(searchTerm) || 
        student.id.toLowerCase().includes(searchTerm) ||
        (student.status && student.status.toLowerCase().includes(searchTerm)) ||
        (student.orphanStatus && student.orphanStatus.toLowerCase().includes(searchTerm)) ||
        (student.familyMembers && String(student.familyMembers).toLowerCase().includes(searchTerm)) ||
        (student.familyMembersTot && String(student.familyMembersTot).toLowerCase().includes(searchTerm)) ||
        (student.familyMembersFem && String(student.familyMembersFem).toLowerCase().includes(searchTerm)) ||
        (student.equityCard && student.equityCard.toLowerCase().includes(searchTerm)) ||
        (student.equityCardNo && student.equityCardNo.toLowerCase().includes(searchTerm))
    );
    renderTable(filteredStudents);
});

// Initial Render
renderTable();

// --- IMPORT EXCEL LOGIC ---
window.openImportModal = function() {
    document.getElementById('import-modal').style.display = 'flex';
    document.getElementById('import-textarea').value = '';
    document.getElementById('import-file').value = '';
    document.getElementById('import-textarea').focus();
}

window.closeImportModal = function() {
    document.getElementById('import-modal').style.display = 'none';
}

window.processImport = function() {
    const fileInput = document.getElementById('import-file');
    const textarea = document.getElementById('import-textarea');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = window.XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const csv = window.XLSX.utils.sheet_to_csv(worksheet);
                    parseImportData(csv, ',');
                } catch(err) {
                    alert('បរាជ័យក្នុងការអានឯកសារ Excel! សូមពិនិត្យមើលឯកសារឡើងវិញ។');
                    console.error(err);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            reader.onload = function(e) {
                parseImportData(e.target.result, ',');
            };
            // Use UTF-8 to correctly read Khmer text
            reader.readAsText(file, 'UTF-8');
        }
    } else {
        const text = textarea.value.trim();
        if (!text) {
            alert('សូមជ្រើសរើសឯកសារ CSV ឬ Paste ទិន្នន័យជាមុនសិន!');
            return;
        }
        parseImportData(text, '\t');
    }
}

function parseImportData(text, separator) {
    const rows = text.split('\n');
    let importedCount = 0;
    let skippedCount = 0;

    rows.forEach(row => {
        let cols;
        if (separator === ',') {
            // Robust CSV split that handles commas inside quotes
            cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
        } else {
            // Tab separated for Excel paste
            cols = row.split('\t').map(c => c.trim());
        }
        
        if (cols.length >= 3 && cols[0]) {
            const id = cols[0].replace(/^\$/, '');
            const lastName = cols[1];
            const firstName = cols[2];
            
            // Skip header row if it exists (exact match)
            if (id.toLowerCase() === 'id' || id === 'អត្តលេខ' || lastName === 'នាមត្រកូល' || firstName === 'នាមខ្លួន' || !id) return;

            // Check if ID already exists, skip if so
            if (studentProfiles.some(s => s.id === id)) {
                skippedCount++;
                return;
            }

            const name = lastName + ' ' + firstName;
            const gender = cols[3] || 'ប';
            
            // Detect if cols[4] is status or date
            let status = 'សិស្សថ្មី';
            let dobIndex = 4;
            if (cols[4] && (cols[4].includes('ត្រួត') || cols[4].includes('ចាស់') || cols[4].includes('ថ្មី'))) {
                status = cols[4].includes('ត្រួត') || cols[4].includes('ចាស់') ? 'សិស្សចាស់ (ត្រួតថ្នាក់)' : 'សិស្សថ្មី';
                dobIndex = 5;
            }

            // Parse date from DD/MM/YYYY, MM/DD/YY, or DD-MM-YYYY to YYYY-MM-DD
            let dob = cols[dobIndex] || '';
            if (dob) {
                const parts = dob.split(/[\/\-]/);
                if (parts.length === 3) {
                    if (parts[0].length === 4) {
                        dob = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
                    } else if (parts[2].length === 4) { 
                        dob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    } else if (parts[2].length === 2) {
                        let p0 = parseInt(parts[0]);
                        let p1 = parseInt(parts[1]);
                        let y = '20' + parts[2];
                        let m, d;
                        if (p0 > 12) { d = p0; m = p1; }
                        else { m = p0; d = p1; }
                        dob = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                    }
                }
            }
            
            const pobVillage = cols[dobIndex + 1] || '';
            const pobCommune = cols[dobIndex + 2] || '';
            const pobDistrict = cols[dobIndex + 3] || '';
            const pobProvince = cols[dobIndex + 4] || '';
            
            const fatherName = cols[dobIndex + 5] || '';
            const fatherJob = cols[dobIndex + 6] || '';
            const motherName = cols[dobIndex + 7] || '';
            const motherJob = cols[dobIndex + 8] || '';
            const guardianName = cols[dobIndex + 9] || '';
            const guardianJob = cols[dobIndex + 10] || '';
            
            const familyMembersTot = cols[dobIndex + 11] || '';
            const familyMembersFem = cols[dobIndex + 12] || '';
            
            let orphanStatus = 'មិនកំព្រា';
            const rawOrphan = (cols[dobIndex + 13] || '').trim();
            if (rawOrphan.includes('ឪពុក') && rawOrphan.includes('ម្តាយ')) orphanStatus = 'កំព្រាទាំងឪពុកនិងម្តាយ';
            else if (rawOrphan.includes('ឪពុក')) orphanStatus = 'កំព្រាឪពុក';
            else if (rawOrphan.includes('ម្តាយ')) orphanStatus = 'កំព្រាម្តាយ';
            else if (rawOrphan && rawOrphan !== 'មិនកំព្រា') orphanStatus = rawOrphan;

            const currHouse = cols[dobIndex + 14] || '';
            const currVillage = cols[dobIndex + 15] || '';
            const currCommune = cols[dobIndex + 16] || '';
            const currDistrict = cols[dobIndex + 17] || '';
            const currProvince = cols[dobIndex + 18] || '';
            
            const phone = (cols[dobIndex + 19] || '').replace(/^\$/, '');

            // Parse Equity Card & Card Number if present
            let rawEquity = (cols[dobIndex + 20] || '').trim();
            let equityCard = 'គ្មាន';
            if (rawEquity) {
                if (rawEquity.includes('ក្រ១') || rawEquity === '1' || rawEquity.toLowerCase().includes('poor 1') || rawEquity.toLowerCase().includes('level 1') || rawEquity.includes('ទីទាល់ក្រ')) {
                    equityCard = 'កម្រិតក្រ១';
                } else if (rawEquity.includes('ក្រ២') || rawEquity === '2' || rawEquity.toLowerCase().includes('poor 2') || rawEquity.toLowerCase().includes('level 2')) {
                    equityCard = 'កម្រិតក្រ២';
                } else if (rawEquity.includes('ក្រ៣') || rawEquity === '3' || rawEquity.toLowerCase().includes('poor 3') || rawEquity.toLowerCase().includes('level 3') || rawEquity.includes('ងាយរង')) {
                    equityCard = 'កម្រិតក្រ៣';
                } else if (rawEquity.includes('ក្រ')) {
                    equityCard = 'កម្រិតក្រ១';
                } else {
                    equityCard = 'គ្មាន';
                }
            }
            const equityCardNo = (cols[dobIndex + 21] || '').trim().replace(/^\$/, '');

            studentProfiles.push({
                id, name, gender, status,
                familyMembersTot, familyMembersFem, familyMembers: familyMembersTot,
                orphanStatus, equityCard, equityCardNo, dob: formatDOB(dob), phone,
                pobVillage, pobCommune, pobDistrict, pobProvince,
                fatherName, fatherJob,
                motherName, motherJob,
                guardianName, guardianJob,
                currHouse, currVillage, currCommune, currDistrict, currProvince
            });
            importedCount++;
        }
    });

    if (importedCount > 0) {
        saveData(true);
        closeImportModal();
        if (typeof window.triggerGoogleAutoSync === 'function') {
            window.triggerGoogleAutoSync(true);
        }
        let msg = `ទិន្នន័យសិស្សត្រូវបាននាំចូលដោយជោគជ័យចំនួន ${importedCount} នាក់!`;
        if (skippedCount > 0) {
            msg += `\n\nចំណាំ៖ សិស្សចំនួន ${skippedCount} នាក់ត្រូវបានរំលង ដោយសារអត្តលេខរបស់ពួកគេមាននៅក្នុងប្រព័ន្ធរួចហើយ។`;
        }
        alert(msg);
        renderTable();
    } else {
        alert('មិនមានទិន្នន័យត្រូវបាននាំចូលទេ។ (អាចមកពីទម្រង់ខុស ឬសិស្សទាំងអស់នោះមានអត្តលេខស្ទួនក្នុងប្រព័ន្ធរួចហើយ)');
    }
}

window.downloadTemplate = function(type = 'xlsx') {
    const headers = [
        'អត្តលេខ', 'នាមត្រកូល', 'នាមខ្លួន', 'ភេទ', 'ស្ថានភាព (សិស្សថ្មី/សិស្សចាស់ (ត្រួតថ្នាក់))', 'ថ្ងៃកំណើត (dd/mm/yyyy)', 
        'ភូមិកំណើត', 'ឃុំកំណើត', 'ស្រុកកំណើត', 'ខេត្តកំណើត', 
        'ឈ្មោះឪពុក', 'មុខរបរឪពុក', 'ឈ្មោះម្តាយ', 'មុខរបរម្តាយ', 'ឈ្មោះអាណាព្យាបាល', 'មុខរបរអាណាព្យាបាល',
        'សមាជិកគ្រួសារ (សរុប)', 'សមាជិកគ្រួសារ (ស្រី)', 'ស្ថានភាពកំព្រា (មិនកំព្រា/កំព្រាឪពុក/កំព្រាម្តាយ/កំព្រាទាំងឪពុកនិងម្តាយ)',
        'លេខផ្ទះ', 'ភូមិ/ក្រុម', 'ឃុំ/សង្កាត់', 'ស្រុក/ខណ្ឌ', 'ខេត្ត/ក្រុង', 'លេខទូរស័ព្ទ',
        'ប័ណ្ណសមធម៌ (គ្មាន/កម្រិតក្រ១/កម្រិតក្រ២/កម្រិតក្រ៣)', 'លេខប័ណ្ណសមធម៌'
    ];
    const sampleRows = [
        ['S-001', 'សេង', 'ហុង', 'ប', 'សិស្សថ្មី', '12/05/2010', 'តាខេ', 'ត្នោត', 'បាទី', 'តាកែវ', 'សេង ហាក់', 'កសិករ', 'លី គឹមអេង', 'មេផ្ទះ', 'សេង ហាក់', 'កសិករ', '៥', '២', 'មិនកំព្រា', '១២A', 'ត្រពាំងក្រសាំង', 'បែកចាន', 'អង្គស្នួល', 'កណ្តាល', '012345678', 'កម្រិតក្រ១', '0102030401'],
        ['S-002', 'កែវ', 'ធីតា', 'ស', 'សិស្សចាស់ (ត្រួតថ្នាក់)', '08/10/2009', 'ព្រៃធំ', 'ស្វាយ', 'ព្រៃកប្បាស', 'តាកែវ', 'កែវ សំអុល', 'ពាណិជ្ជករ', 'ម៉ៅ សុខា', 'គ្រូបង្រៀន', 'កែវ សំអុល', 'ពាណិជ្ជករ', '៤', '៣', 'កំព្រាឪពុក', '០៥', 'ព្រៃធំ', 'ស្វាយ', 'ព្រៃកប្បាស', 'តាកែវ', '098765432', 'គ្មាន', '']
    ];

    if (type === 'xlsx' && typeof window.XLSX !== 'undefined') {
        const ws = window.XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
        
        // Define full borders for all cells
        const borderThin = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        };

        const headerStyle = {
            font: { bold: true, color: { rgb: '000000' }, name: 'Khmer OS Siemreap', sz: 11 },
            fill: { fgColor: { rgb: 'D9E1F2' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: borderThin
        };

        const dataStyle = {
            font: { name: 'Khmer OS Siemreap', sz: 10 },
            alignment: { vertical: 'center' },
            border: borderThin
        };

        const range = window.XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = window.XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
                ws[cellRef].s = (R === 0) ? headerStyle : dataStyle;
            }
        }

        // Add 10 empty bordered rows so the user can easily start typing with borders already drawn
        const initialMaxRow = range.e.r;
        for (let extraR = initialMaxRow + 1; extraR <= initialMaxRow + 15; ++extraR) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = window.XLSX.utils.encode_cell({ r: extraR, c: C });
                ws[cellRef] = { t: 's', v: '', s: dataStyle };
            }
        }
        ws['!ref'] = window.XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: initialMaxRow + 15, c: range.e.c } });

        // Column widths
        ws['!cols'] = [
            {wch: 12}, // អត្តលេខ
            {wch: 14}, // នាមត្រកូល
            {wch: 14}, // នាមខ្លួន
            {wch: 8},  // ភេទ
            {wch: 32}, // ស្ថានភាព
            {wch: 22}, // ថ្ងៃកំណើត
            {wch: 14}, // ភូមិកំណើត
            {wch: 14}, // ឃុំកំណើត
            {wch: 14}, // ស្រុកកំណើត
            {wch: 14}, // ខេត្តកំណើត
            {wch: 16}, // ឈ្មោះឪពុក
            {wch: 14}, // មុខរបរឪពុក
            {wch: 16}, // ឈ្មោះម្តាយ
            {wch: 14}, // មុខរបរម្តាយ
            {wch: 18}, // ឈ្មោះអាណាព្យាបាល
            {wch: 16}, // មុខរបរអាណាព្យាបាល
            {wch: 20}, // សមាជិកគ្រួសារ (សរុប)
            {wch: 20}, // សមាជិកគ្រួសារ (ស្រី)
            {wch: 28}, // ស្ថានភាពកំព្រា
            {wch: 12}, // លេខផ្ទះ
            {wch: 16}, // ភូមិ/ក្រុម
            {wch: 16}, // ឃុំ/សង្កាត់
            {wch: 16}, // ស្រុក/ខណ្ឌ
            {wch: 16}, // ខេត្ត/ក្រុង
            {wch: 16}, // លេខទូរស័ព្ទ
            {wch: 30}, // ប័ណ្ណសមធម៌
            {wch: 18}  // លេខប័ណ្ណសមធម៌
        ];

        // Row heights
        ws['!rows'] = [{ hpt: 30 }, { hpt: 22 }, { hpt: 22 }];

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "គំរូបញ្ជីសិស្ស");
        window.XLSX.writeFile(wb, "Student_Import_Template.xlsx");
    } else {
        const csvContent = headers.join(',') + '\n' + sampleRows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Student_Import_Template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ==========================================
// EXPORT & DATA PULLING FEATURES
// ==========================================

function getActiveClassName() {
    if (window.classManager && typeof window.classManager.getCurrentClassName === 'function') {
        return window.classManager.getCurrentClassName();
    }
    if (window.classManager && typeof window.classManager.getActiveClass === 'function') {
        const ac = window.classManager.getActiveClass();
        if (ac && ac.name) return ac.name;
    }
    return 'ថ្នាក់រៀន';
}

window.openExportModal = function() {
    const modal = document.getElementById('export-modal');
    if (modal) {
        modal.style.display = 'flex';
        const sub = document.getElementById('export-modal-subtitle');
        const className = getActiveClassName();
        if (sub) {
            sub.textContent = `ថ្នាក់បច្ចុប្បន្ន ៖ ${className} (សិស្សសរុប ${studentProfiles.length} នាក់)`;
        }
    }
};

window.closeExportModal = function() {
    const modal = document.getElementById('export-modal');
    if (modal) modal.style.display = 'none';
};

window.exportStudentsToExcel = function() {
    if (!studentProfiles || studentProfiles.length === 0) {
        alert('មិនមានទិន្នន័យសិស្សសម្រាប់ទាញយកទេ!');
        return;
    }

    const className = getActiveClassName();

    const headers = [
        'ល.រ', 'អត្តលេខ', 'នាមត្រកូល', 'នាមខ្លួន', 'ឈ្មោះពេញ', 'ភេទ', 'ស្ថានភាពសិស្ស', 'ថ្ងៃខែឆ្នាំកំណើត', 'អាយុ',
        'ភូមិកំណើត', 'ឃុំកំណើត', 'ស្រុកកំណើត', 'ខេត្តកំណើត',
        'ឈ្មោះឪពុក', 'មុខរបរឪពុក', 'ឈ្មោះម្តាយ', 'មុខរបរម្តាយ', 'ឈ្មោះអាណាព្យាបាល', 'មុខរបរអាណាព្យាបាល',
        'សមាជិកគ្រួសារ (សរុប)', 'សមាជិកគ្រួសារ (ស្រី)', 'ស្ថានភាពកំព្រា', 'ឆ្លងកាត់កុមារតូច', 'ការលំបាក/ពិការភាព',
        'លេខផ្ទះ', 'ភូមិ/ក្រុម', 'ឃុំ/សង្កាត់', 'ស្រុក/ខណ្ឌ', 'ខេត្ត/ក្រុង', 'លេខទូរស័ព្ទ',
        'ប័ណ្ណសមធម៌', 'លេខប័ណ្ណសមធម៌'
    ];

    const dataRows = studentProfiles.map((s, idx) => {
        let lastName = s.lastName || '';
        let firstName = s.firstName || '';
        let fullName = s.name || '';
        if (!lastName && !firstName && fullName) {
            const parts = fullName.trim().split(/\s+/);
            if (parts.length > 1) {
                lastName = parts[0];
                firstName = parts.slice(1).join(' ');
            } else {
                firstName = fullName;
            }
        }
        if (!fullName) fullName = `${lastName} ${firstName}`.trim();

        let ageStr = '';
        if (s.dob) {
            const birthDate = new Date(s.dob);
            if (!isNaN(birthDate)) {
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                ageStr = `${age} ឆ្នាំ`;
            }
        }

        let diffStr = 'គ្មាន';
        if (s.difficulties && s.difficulties.length > 0) {
            if (Array.isArray(s.difficulties)) {
                diffStr = s.difficulties.map(k => DIFFICULTY_LABELS[k] || k).join(', ');
            } else {
                diffStr = s.difficulties.toString();
            }
        }

        return [
            (idx + 1).toString(),
            s.id || '',
            lastName,
            firstName,
            fullName,
            s.gender || '',
            s.status || 'សិស្សថ្មី',
            formatDOB(s.dob),
            ageStr,
            s.pobVillage || '',
            s.pobCommune || '',
            s.pobDistrict || '',
            s.pobProvince || '',
            s.fatherName || '',
            s.fatherJob || '',
            s.motherName || '',
            s.motherJob || '',
            s.guardianName || s.guardian || '',
            s.guardianJob || '',
            s.familyMembersTot || s.familyMembers || '',
            s.familyMembersFem || '',
            s.orphanStatus || 'មិនកំព្រា',
            s.earlyChildhood || 'ទេ',
            diffStr,
            s.currHouse || '',
            s.currVillage || '',
            s.currCommune || '',
            s.currDistrict || '',
            s.currProvince || '',
            s.phone || '',
            s.equityCard || 'គ្មាន',
            s.equityCardNo || ''
        ];
    });

    if (typeof window.XLSX !== 'undefined') {
        const ws = window.XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

        const borderThin = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
        };

        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Khmer OS Siemreap', sz: 11 },
            fill: { fgColor: { rgb: '0284C7' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: borderThin
        };

        const dataStyleLeft = {
            font: { name: 'Khmer OS Siemreap', sz: 10 },
            alignment: { vertical: 'center', horizontal: 'left' },
            border: borderThin
        };

        const dataStyleCenter = {
            font: { name: 'Khmer OS Siemreap', sz: 10 },
            alignment: { vertical: 'center', horizontal: 'center' },
            border: borderThin
        };

        const centerCols = new Set([0, 1, 5, 6, 7, 8, 19, 20, 21, 22, 24, 29, 30, 31]);

        const range = window.XLSX.utils.decode_range(ws['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = window.XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };
                if (R === 0) {
                    ws[cellRef].s = headerStyle;
                } else {
                    ws[cellRef].s = centerCols.has(C) ? dataStyleCenter : dataStyleLeft;
                }
            }
        }

        ws['!cols'] = [
            { wch: 6 },  // ល.រ
            { wch: 12 }, // អត្តលេខ
            { wch: 14 }, // នាមត្រកូល
            { wch: 14 }, // នាមខ្លួន
            { wch: 20 }, // ឈ្មោះពេញ
            { wch: 8 },  // ភេទ
            { wch: 22 }, // ស្ថានភាព
            { wch: 16 }, // ថ្ងៃខែឆ្នាំកំណើត
            { wch: 10 }, // អាយុ
            { wch: 15 }, // ភូមិកំណើត
            { wch: 15 }, // ឃុំកំណើត
            { wch: 15 }, // ស្រុកកំណើត
            { wch: 15 }, // ខេត្តកំណើត
            { wch: 18 }, // ឈ្មោះឪពុក
            { wch: 15 }, // មុខរបរឪពុក
            { wch: 18 }, // ឈ្មោះម្តាយ
            { wch: 15 }, // មុខរបរម្តាយ
            { wch: 18 }, // ឈ្មោះអាណាព្យាបាល
            { wch: 15 }, // មុខរបរអាណាព្យាបាល
            { wch: 18 }, // សមាជិកគ្រួសារ (សរុប)
            { wch: 18 }, // សមាជិកគ្រួសារ (ស្រី)
            { wch: 24 }, // ស្ថានភាពកំព្រា
            { wch: 18 }, // ឆ្លងកាត់កុមារតូច
            { wch: 28 }, // ពិការភាព
            { wch: 10 }, // លេខផ្ទះ
            { wch: 15 }, // ភូមិ/ក្រុម
            { wch: 15 }, // ឃុំ/សង្កាត់
            { wch: 15 }, // ស្រុក/ខណ្ឌ
            { wch: 15 }, // ខេត្ត/ក្រុង
            { wch: 16 }, // លេខទូរស័ព្ទ
            { wch: 18 }, // ប័ណ្ណសមធម៌
            { wch: 18 }  // លេខប័ណ្ណសមធម៌
        ];

        ws['!rows'] = [{ hpt: 30 }];

        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "ប្រវត្តិរូបសិស្ស");
        const cleanName = className.replace(/[^a-zA-Z0-9\u1780-\u17FF_-]/g, '_');
        const fileName = `បញ្ជីប្រវត្តិរូបសិស្ស_${cleanName}.xlsx`;
        window.XLSX.writeFile(wb, fileName);
        closeExportModal();
        showSortNotification(`🎉 បានទាញយកឯកសារ Excel «${fileName}» ដោយជោគជ័យ!`);
    } else {
        exportStudentsToCSV();
    }
};

window.exportStudentsToCSV = function() {
    if (!studentProfiles || studentProfiles.length === 0) {
        alert('មិនមានទិន្នន័យសិស្សសម្រាប់ទាញយកទេ!');
        return;
    }

    const className = getActiveClassName();
    const headers = [
        'ល.រ', 'អត្តលេខ', 'នាមត្រកូល', 'នាមខ្លួន', 'ឈ្មោះពេញ', 'ភេទ', 'ស្ថានភាពសិស្ស', 'ថ្ងៃខែឆ្នាំកំណើត',
        'ភូមិកំណើត', 'ឃុំកំណើត', 'ស្រុកកំណើត', 'ខេត្តកំណើត',
        'ឈ្មោះឪពុក', 'មុខរបរឪពុក', 'ឈ្មោះម្តាយ', 'មុខរបរម្តាយ', 'ឈ្មោះអាណាព្យាបាល', 'មុខរបរអាណាព្យាបាល',
        'សមាជិកគ្រួសារ_សរុប', 'សមាជិកគ្រួសារ_ស្រី', 'ស្ថានភាពកំព្រា', 'ឆ្លងកាត់កុមារតូច', 'ពិការភាព_ការលំបាក',
        'លេខផ្ទះ', 'ភូមិ_ក្រុម', 'ឃុំ_សង្កាត់', 'ស្រុក_ខណ្ឌ', 'ខេត្ត_ក្រុង', 'លេខទូរស័ព្ទ',
        'ប័ណ្ណសមធម៌', 'លេខប័ណ្ណសមធម៌'
    ];

    const rows = studentProfiles.map((s, idx) => {
        let lastName = s.lastName || '';
        let firstName = s.firstName || '';
        let fullName = s.name || '';
        if (!lastName && !firstName && fullName) {
            const parts = fullName.trim().split(/\s+/);
            if (parts.length > 1) {
                lastName = parts[0];
                firstName = parts.slice(1).join(' ');
            } else {
                firstName = fullName;
            }
        }
        if (!fullName) fullName = `${lastName} ${firstName}`.trim();

        let diffStr = 'គ្មាន';
        if (s.difficulties && s.difficulties.length > 0) {
            if (Array.isArray(s.difficulties)) {
                diffStr = s.difficulties.map(k => DIFFICULTY_LABELS[k] || k).join('; ');
            } else {
                diffStr = s.difficulties.toString();
            }
        }

        return [
            idx + 1,
            s.id || '',
            lastName,
            firstName,
            fullName,
            s.gender || '',
            s.status || 'សិស្សថ្មី',
            formatDOB(s.dob),
            s.pobVillage || '',
            s.pobCommune || '',
            s.pobDistrict || '',
            s.pobProvince || '',
            s.fatherName || '',
            s.fatherJob || '',
            s.motherName || '',
            s.motherJob || '',
            s.guardianName || s.guardian || '',
            s.guardianJob || '',
            s.familyMembersTot || s.familyMembers || '',
            s.familyMembersFem || '',
            s.orphanStatus || 'មិនកំព្រា',
            s.earlyChildhood || 'ទេ',
            diffStr,
            s.currHouse || '',
            s.currVillage || '',
            s.currCommune || '',
            s.currDistrict || '',
            s.currProvince || '',
            s.phone || '',
            s.equityCard || 'គ្មាន',
            s.equityCardNo || ''
        ];
    });

    const csvContent = headers.join(',') + '\n' + rows.map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const cleanName = className.replace(/[^a-zA-Z0-9\u1780-\u17FF_-]/g, '_');
    link.setAttribute("href", url);
    link.setAttribute("download", `បញ្ជីប្រវត្តិរូបសិស្ស_${cleanName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeExportModal();
    showSortNotification(`🎉 បានទាញយកឯកសារ CSV ដោយជោគជ័យ!`);
};

window.exportStudentsToJSON = function() {
    if (!studentProfiles || studentProfiles.length === 0) {
        alert('មិនមានទិន្នន័យសិស្សសម្រាប់ទាញយកទេ!');
        return;
    }

    const className = getActiveClassName();
    const curKey = window.getKey ? window.getKey('studentProfilesData') : 'studentProfilesData';
    const backupObj = {
        exportDate: new Date().toISOString(),
        className: className,
        storageKey: curKey,
        totalStudents: studentProfiles.length,
        data: studentProfiles
    };

    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanName = className.replace(/[^a-zA-Z0-9\u1780-\u17FF_-]/g, '_');
    link.href = url;
    link.download = `student_profiles_backup_${cleanName}.json`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeExportModal();
    showSortNotification(`🎉 បានទាញយកឯកសារ Backup (.json) ដោយជោគជ័យ!`);
};

window.pullStudentsFromGrades = function() {
    const months = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា'];
    let pulledCount = 0;
    const existingIds = new Set(studentProfiles.map(s => (s.id || '').toString().trim()));

    months.forEach(m => {
        const key = window.getKey ? window.getKey(`studentGrades_${m}`) : `studentGrades_${m}`;
        const raw = localStorage.getItem(key);
        if (raw) {
            try {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    list.forEach(g => {
                        const id = (g.id || '').toString().trim();
                        const name = (g.name || '').toString().trim();
                        if (id && name && !existingIds.has(id)) {
                            existingIds.add(id);
                            studentProfiles.push({
                                id: id,
                                name: name,
                                gender: g.gender === 'ប្រុស' ? 'ប' : (g.gender === 'ស្រី' ? 'ស' : (g.gender || 'ប')),
                                status: 'សិស្សថ្មី',
                                dob: '',
                                pobVillage: '', pobCommune: '', pobDistrict: '', pobProvince: '',
                                fatherName: '', fatherJob: '',
                                motherName: '', motherJob: '',
                                guardianName: '', guardianJob: '',
                                familyMembersTot: '', familyMembersFem: '',
                                orphanStatus: 'មិនកំព្រា',
                                currHouse: '', currVillage: '', currCommune: '', currDistrict: '', currProvince: '',
                                phone: '',
                                equityCard: 'គ្មាន',
                                equityCardNo: ''
                            });
                            pulledCount++;
                        }
                    });
                }
            } catch (e) {}
        }
    });

    if (pulledCount > 0) {
        saveData();
        renderTable();
        closeExportModal();
        alert(`🎉 បានទាញទិន្នន័យសិស្សថ្មីចំនួន ${pulledCount} នាក់ពីបញ្ជីពិន្ទុដោយជោគជ័យ!`);
    } else {
        alert('ℹ️ មិនមានឈ្មោះសិស្សថ្មីនៅក្នុងបញ្ជីពិន្ទុដែលមិនទាន់មានក្នុងប្រវត្តិរូបសិស្សទេ។');
    }
};


// =========================================================================
// GOOGLE SHEETS INTEGRATION FOR STUDENT PROFILE
// =========================================================================
window.exportStudentsToGoogleSheets = async function() {
    let sheetUrl = (typeof window.getGoogleSheetsUrl === 'function') ? window.getGoogleSheetsUrl() : '';
    if (!sheetUrl) {
        window.configureGoogleSheetsUrlDirectly();
        sheetUrl = (typeof window.getGoogleSheetsUrl === 'function') ? window.getGoogleSheetsUrl() : '';
        if (!sheetUrl) return;
    }

    const pushBtn = document.getElementById('push-sheets-btn');
    const origHtml = pushBtn ? pushBtn.innerHTML : '';
    if (pushBtn) {
        pushBtn.disabled = true;
        pushBtn.innerHTML = '<span>⏳ កំពុង Push...</span>';
    }

    try {
        if (typeof window.syncAllToGoogleSheets === 'function') {
            await window.syncAllToGoogleSheets(false);
            if (typeof renderTable === 'function') renderTable();
        } else {
            alert('⚠️ មិនអាចរកឃើញម៉ូឌុល Google Sync បានទេ! សូម refresh ទំព័ររួចសាកល្បងម្ដងទៀត។');
        }
    } catch(err) {
        console.error('Push error:', err);
        alert('⚠️ មានបញ្ហាក្នុងការបញ្ជូនទៅ Google Sheets៖ ' + (err.message || err));
    } finally {
        if (pushBtn) {
            pushBtn.disabled = false;
            pushBtn.innerHTML = origHtml;
        }
    }
};

window.configureGoogleSheetsUrlDirectly = function() {
    const curUrl = (typeof window.getGoogleSheetsUrl === 'function') ? window.getGoogleSheetsUrl() : (localStorage.getItem('google_sheets_url_plung') || '');
    const newUrl = prompt(
        '⚙️ កំណត់ Google Apps Script Web App URL សម្រាប់សាលាបឋមសិក្សា ផ្លុង៖\n\n' +
        '👉 សូមបិទភ្ជាប់ (Paste) Web App URL ដែលបញ្ចប់ដោយ "/exec"៖',
        curUrl
    );

    if (newUrl === null) return;
    const trimmed = newUrl.trim();
    if (!trimmed) {
        alert('⚠️ URL មិនអាចទទេបានឡើយ!');
        return;
    }

    if (!trimmed.includes('/macros/s/') || !trimmed.endsWith('/exec')) {
        alert('⚠️ URL មិនទាន់ត្រឹមត្រូវទេ!\n\nWeb App URL ត្រូវតែចាប់ផ្ដើមដោយ "https://script.google.com/macros/s/..." ហើយបញ្ចប់ដោយ "/exec"');
        return;
    }

    localStorage.setItem('google_sheets_url_plung', trimmed);
    localStorage.setItem('google_sheets_url', trimmed);
    localStorage.setItem('google_sheets_web_app_url', trimmed);

    if (typeof window.updateSyncStatus === 'function') {
        window.updateSyncStatus('success');
    }

    alert('✅ បានរក្សាទុក Google Sheets Web App URL ដោយជោគជ័យ!\n\nប្រព័ន្ធនឹងចាប់ផ្ដើមបញ្ជូន (Push) ទិន្នន័យសិស្ស និងពិន្ទុទាំងអស់ទៅកាន់ Google Sheets ភ្លាមៗ...');
    if (typeof window.syncAllToGoogleSheets === 'function') {
        window.syncAllToGoogleSheets(false);
    }
};
