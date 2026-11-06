/**
 * ============================================================================
 * GOOGLE APPS SCRIPT FOR STUDENT GRADE & RECORDS MANAGEMENT SYSTEM
 * សាលាបឋមសិក្សា ផ្លុង - ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស និងពិន្ទុគ្រប់ថ្នាក់
 * កំណែរៀបចំដាច់ដោយឡែកតាម «ថ្នាក់នីមួយៗ» និង «ឆ្នាំសិក្សានីមួយៗ» ១០០%
 * ============================================================================
 * 
 * រចនាសម្ព័ន្ធថ្មីដែលបានកំណត់យ៉ាងច្បាស់លាស់ ៖
 * ១. បែងចែកតាមឆ្នាំសិក្សាដាច់ដោយឡែកពីគ្នា (ឧ. ២០២៥ - ២០២៦ និង ២០២៦ - ២០២៧ នៅក្នុង Sheet ផ្សេងគ្នាដាច់ស្រឡះ)។
 * ២. បែងចែកពិន្ទុតាមថ្នាក់នីមួយៗ (សន្លឹកកិច្ចការមួយ គឺសម្រាប់ពិន្ទុមួយថ្នាក់ពេញមួយឆ្នាំសិក្សា ចាប់ពីខែតុលា ដល់ កក្កដា) ៖
 *    - «ពិន្ទុ_ថ្នាក់ទី១ក (២០២៥ - ២០២៦)» ៖ សម្រាប់តែពិន្ទុថ្នាក់ទី ១ ក
 *    - «ពិន្ទុ_ថ្នាក់ទី២ក (២០២៥ - ២០២៦)» ៖ សម្រាប់តែពិន្ទុថ្នាក់ទី ២ ក
 *    - «ពិន្ទុ_ថ្នាក់ទី៣ក (២០២៥ - ២០២៦)» ៖ សម្រាប់តែពិន្ទុថ្នាក់ទី ៣ ក
 *    - «ពិន្ទុ_ថ្នាក់ទី៤ក (២០២៥ - ២០២៦)» ៖ សម្រាប់តែពិន្ទុថ្នាក់ទី ៤ ក
 *    - «ពិន្ទុ_ថ្នាក់ទី៥ក (២០២៥ - ២០២៦)» ៖ សម្រាប់តែពិន្ទុថ្នាក់ទី ៥ ក
 *    - «ពិន្ទុ_ថ្នាក់ទី៦ក (២០២៥ - ២០២៦)» ៖ សម្រាប់តែពិន្ទុថ្នាក់ទី ៦ ក
 * ៣. ប្រវត្តិរូបសិស្សក៏បែងចែកតាមថ្នាក់ និងតាមឆ្នាំសិក្សាដូចគ្នា ៖
 *    - «ប្រវត្តិរូប_រួម (២០២៥ - ២០២៦)»
 *    - «ប្រវត្តិរូប_ថ្នាក់ទី១ក (២០២៥ - ២០២៦)», «ប្រវត្តិរូប_ថ្នាក់ទី២ក (២០២៥ - ២០២៦)», ...
 * ៤. ប្រសិនបើខែណា ឬថ្នាក់ណាមិនទាន់បានបញ្ចូលពិន្ទុ គឺបង្ហាញតែឈ្មោះសិស្សទទេ ត្រៀមទុកសម្រាប់ដាក់ពិន្ទុ មិនច្របូកច្របល់ឡើយ។
 * ៥. លុបសន្លឹកកិច្ចការចាស់ៗរញ៉េរញ៉ៃទាំងអស់ (លុបសន្លឹកតាមខែចាស់ៗ, សន្លឹក conflict, និងសន្លឹកគ្មានឆ្នាំសិក្សា)។
 */

// ប្រសិនបើបង្កើត Apps Script ចេញពីក្នុង Google Sheet ថ្មី (Extensions > Apps Script)
// ប្រព័ន្ធនឹងស្គាល់ Google Sheet ថ្មីនោះដោយស្វ័យប្រវត្តិ ១០០% (មិនបាច់ដាក់ ID ក៏បាន)។
// ឬប្រសិនបើចង់ដាក់ ID នៃ Google Sheet ថ្មីផ្ទាល់ ក៏អាចដាក់នៅចន្លោះសញ្ញា "" ខាងក្រោមបាន៖
var SPREADSHEET_ID = "1KDyJaUQwD7lRDEGZhC152wr3yIfZ_-PoNfakQ_6dnA0";

var SCHOOL_MONTHS = ['តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា'];

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStudentSheet(ss) {
  if (!ss) return null;
  var sheets = ss.getSheets();
  if (!sheets || sheets.length === 0) return null;

  // 1. Try finding a sheet with "ប្រវត្តិរូប"
  for (var i = 0; i < sheets.length; i++) {
    var n = sheets[i].getName();
    if (n.indexOf("ប្រវត្តិរូប") !== -1 && (n.indexOf("៦") !== -1 || n.indexOf("6") !== -1)) {
      return sheets[i];
    }
  }
  for (var i = 0; i < sheets.length; i++) {
    var n = sheets[i].getName();
    if (n.indexOf("ប្រវត្តិរូប") !== -1) {
      return sheets[i];
    }
  }

  // 2. Look for sheet with header row containing student columns
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    if (sh.getName() === "_CLOUD_DATA_SYNC") continue;
    if (sh.getLastRow() >= 1 && sh.getLastColumn() >= 3) {
      var hRow = sh.getRange(1, 1, 1, Math.min(10, sh.getLastColumn())).getValues()[0];
      var joined = hRow.join(" ");
      if (joined.indexOf("អត្តលេខ") !== -1 || joined.indexOf("ឈ្មោះ") !== -1 || joined.indexOf("ល.រ") !== -1) {
        return sh;
      }
    }
  }

  // 3. Fallback: first non-system sheet
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== "_CLOUD_DATA_SYNC") {
      return sheets[i];
    }
  }
  return sheets[0];
}

function findStudentRowById(sheet, targetId) {
  if (!sheet || !targetId) return -1;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var cleanTarget = String(targetId).trim().toLowerCase();

  var lastCol = Math.max(6, sheet.getLastColumn());
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  for (var r = 0; r < data.length; r++) {
    var row = data[r];
    // Column D (index 3) is Student ID (e.g. S-203)
    var colD = String(row[3] || '').trim().toLowerCase();
    if (colD === cleanTarget) {
      return r + 2;
    }
    // Column E (index 4) is Student Name
    var colE = String(row[4] || '').trim().toLowerCase();
    if (colE === cleanTarget) {
      return r + 2;
    }
    // Search across all columns in row as fallback
    for (var c = 0; c < row.length; c++) {
      if (String(row[c] || '').trim().toLowerCase() === cleanTarget) {
        return r + 2;
      }
    }
  }
  return -1;
}

function getTargetSpreadsheet() {
  try {
    var activeSs = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSs && activeSs.getId()) return activeSs;
  } catch (e) { }

  if (SPREADSHEET_ID && SPREADSHEET_ID.trim()) {
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
      if (ss) return ss;
    } catch (err) { }
  }
  return null;
}

/**
 * កំណត់លំដាប់លេខរៀងថ្នាក់ (ថ្នាក់ទី ១ ដល់ ទី ៦)
 */
function getClassOrder(cName) {
  if (!cName) return 99;
  var str = cName.toString();
  if (str.indexOf('១') !== -1 || str.indexOf('1') !== -1) return 1;
  if (str.indexOf('២') !== -1 || str.indexOf('2') !== -1) return 2;
  if (str.indexOf('៣') !== -1 || str.indexOf('3') !== -1) return 3;
  if (str.indexOf('៤') !== -1 || str.indexOf('4') !== -1) return 4;
  if (str.indexOf('៥') !== -1 || str.indexOf('5') !== -1) return 5;
  if (str.indexOf('៦') !== -1 || str.indexOf('6') !== -1) return 6;
  return 99;
}

/**
 * សម្អាត និងលុបសន្លឹកកិច្ចការចាស់ៗដែលរញ៉េរញ៉ៃទាំងអស់
 */
function removeDeprecatedSheets(ss) {
  // 🛡️ CRITICAL DATA PROTECTION:
  // NEVER delete any sheet that contains rows of data!
  if (!ss) return;
  var allSheets = ss.getSheets();

  allSheets.forEach(function (sh) {
    var name = sh.getName();
    // If the sheet has more than 1 row (contains user data), NEVER DELETE IT!
    if (sh.getLastRow() > 1) return;

    var shouldDelete = false;
    // Only delete empty temporary sheets if there is more than 1 sheet in spreadsheet
    if (name.indexOf("conflict") !== -1 || (sh.getLastRow() <= 1 && (name === "Sheet1" || name === "Sheet 1" || name === "សន្លឹកកិច្ចការ១"))) {
      shouldDelete = true;
    }

    if (shouldDelete && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(sh);
        Logger.log("✅ បានលុបសន្លឹកទទេចេញដោយជោគជ័យ៖ " + name);
      } catch (err) { }
    }
  });
}

function pad2(n) {
  var s = String(n || '');
  return s.length < 2 ? '0' + s : s;
}

function calculateKhmerAge(dobString) {
  if (!dobString) return "";
  var formatted = formatGasDate(dobString);
  if (!formatted) return "";
  var p = formatted.split('-');
  if (p.length !== 3) return "";
  var birthYear = parseInt(p[2], 10);
  if (isNaN(birthYear) || birthYear < 1900) return "";
  var curYear = new Date().getFullYear();
  var age = curYear - birthYear;
  if (age < 0 || age > 100) return "";
  var khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  return String(age).split('').map(function(d) { return khmerNums[parseInt(d, 10)] || d; }).join('') + ' ឆ្នាំ';
}

function formatGasDate(val) {
  if (!val) return "";
  if (val instanceof Date || (typeof val === 'object' && typeof val.getFullYear === 'function')) {
    var d = pad2(val.getDate());
    var m = pad2(val.getMonth() + 1);
    var y = val.getFullYear();
    return d + '-' + m + '-' + y;
  }
  var str = String(val).trim().replace(/[០-៩]/g, function (d) {
    return '០១២៣៤៥៦៧៨៩'.indexOf(d);
  });
  if (!str || str === '-' || str === 'null' || str === 'undefined') return "";

  // GMT / ISO / Indochina strings e.g. "Wed Jun 03 2015 00:00:00 GMT+0700 (Indochina Time)"
  if (str.indexOf('GMT') !== -1 || str.indexOf('Indochina') !== -1 || str.indexOf('T') !== -1 || (isNaN(str) && str.indexOf('-') === -1 && str.indexOf('/') === -1 && !isNaN(Date.parse(str)))) {
    var parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      var d2 = pad2(parsed.getDate());
      var m2 = pad2(parsed.getMonth() + 1);
      var y2 = parsed.getFullYear();
      if (y2 > 1900 && y2 < 2100) return d2 + '-' + m2 + '-' + y2;
    }
  }

  // YYYY-MM-DD or DD-MM-YYYY
  if (str.indexOf('-') !== -1) {
    var parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return pad2(parts[2]) + '-' + pad2(parts[1]) + '-' + parts[0];
      } else if (parts[2].length === 4) {
        return pad2(parts[0]) + '-' + pad2(parts[1]) + '-' + parts[2];
      }
    }
  }

  // YYYY/MM/DD or DD/MM/YYYY
  if (str.indexOf('/') !== -1) {
    var parts2 = str.split('/');
    if (parts2.length === 3) {
      if (parts2[0].length === 4) {
        return pad2(parts2[2]) + '-' + pad2(parts2[1]) + '-' + parts2[0];
      } else if (parts2[2].length === 4) {
        return pad2(parts2[0]) + '-' + pad2(parts2[1]) + '-' + parts2[2];
      }
    }
  }

  return str;
}

/**
 * ជំនួយការ៖ សរសេរសន្លឹកប្រវត្តិរូបសិស្ស (មានឆ្នាំសិក្សា & តាមថ្នាក់នីមួយៗ)
 */
function writeStudentProfilesSheet(ss, sheetName, students, headerColor) {
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  try { sheet.setHiddenGridlines(false); } catch (gridErr) { }

  var headers = [
    "ល.រ", "ឆ្នាំសិក្សា", "ថ្នាក់រៀន", "អត្តលេខ (ID)", "គោត្តនាម និងនាម", "ភេទ", "ថ្ងៃខែឆ្នាំកំណើត",
    "អាយុ", "ស្ថានភាព", "ឈ្មោះឪពុក", "មុខរបរឪពុក", "ឈ្មោះម្ដាយ", "មុខរបរម្ដាយ",
    "អាណាព្យាបាល / ឪពុកម្ដាយ", "មុខរបរអាណាព្យាបាល", "លេខទូរសព្ទ", "ទីកន្លែងកំណើត",
    "ទីលំនៅបច្ចុប្បន្ន", "ប័ណ្ណសមធម៌", "លេខប័ណ្ណ", "ស្ថានភាពកំព្រា",
    "សមាជិកគ្រួសារ", "ពិការភាព/ការលំបាក"
  ];

  var rows = [headers];
  if (students && students.length > 0) {
    var sorted = students.slice();
    try {
      sorted.sort(function (a, b) {
        var idA = parseInt(a.id, 10);
        var idB = parseInt(b.id, 10);
        if (!isNaN(idA) && !isNaN(idB) && idA !== idB) return idA - idB;
        if (a.id !== b.id) return String(a.id || '').localeCompare(String(b.id || ''));
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
    } catch (sortErr) { }

    var seenKeys = {};
    var rowIndex = 1;

    sorted.forEach(function (s) {
      if (!s || (!s.id && !s.name)) return;
      var sId = (s.id || "").toString().trim();
      var sName = (s.name || "").toString().trim();
      var yStr = (s.academicYear || "២០២៦ - ២០២៧").toString().trim();
      var cStr = (s.className || "").toString().trim();

      var dedupeKey = yStr + '_' + cStr + '_' + (sId || sName);
      if (seenKeys[dedupeKey]) return;
      seenKeys[dedupeKey] = true;

      var calculatedAge = s.age || (s.dob ? calculateKhmerAge(s.dob) : "");

      rows.push([
        rowIndex++,
        yStr,
        cStr,
        sId,
        sName,
        s.gender === 'ប្រុស' ? 'ប' : (s.gender === 'ស្រី' ? 'ស' : (s.gender || "")),
        formatGasDate(s.dob),
        calculatedAge,
        s.status || "សិស្សថ្មី",
        s.fatherName || "",
        s.fatherJob || "",
        s.motherName || "",
        s.motherJob || "",
        s.guardianName || s.guardian || ((s.fatherName && s.motherName) ? (s.fatherName + ' / ' + s.motherName) : (s.fatherName || s.motherName || "")),
        s.guardianJob || s.fatherJob || s.motherJob || "",
        s.phone || "",
        s.pob || s.pobProvince || "",
        s.address || s.currProvince || "",
        s.equityCard || "",
        s.equityCardNo || "",
        s.orphanStatus || "",
        s.familyMembers || "",
        s.difficulty || ""
      ]);
    });
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

  var hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground(headerColor || "#0f766e")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.setFrozenRows(1);

  if (rows.length > 1) {
    sheet.getRange(2, 1, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 2, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 3, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 4, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 6, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 7, rows.length - 1, 1).setHorizontalAlignment("center").setNumberFormat("@");
    sheet.getRange(2, 8, rows.length - 1, 1).setHorizontalAlignment("center");
  }

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * ជំនួយការមេ៖ សរសេរសន្លឹកពិន្ទុប្រចាំឆ្នាំសម្រាប់ថ្នាក់នីមួយៗ (សន្លឹកមួយសម្រាប់មួយថ្នាក់ រួមបញ្ចូលគ្រប់ខែពីតុលា ដល់ កក្កដា)
 * ប្រសិនបើមិនទាន់មានពិន្ទុ គឺបង្ហាញតែឈ្មោះទទេរង់ចាំដាក់ពិន្ទុ មិនច្រឡំគ្នាជាមួយថ្នាក់ផ្សេងឡើយ
 */
function writeClassMonthlyGradesSheet(ss, sheetName, className, academicYear, classStudents, scoreMap, headerColor) {
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  try { sheet.setHiddenGridlines(false); } catch (gridErr) { }

  var headers = [
    "ល.រ", "ឆ្នាំសិក្សា", "ថ្នាក់រៀន", "ខែ", "អត្តលេខ (ID)", "គោត្តនាម និងនាម", "ភេទ",
    "ភាសាខ្មែរ", "គណិតវិទ្យា", "វិទ្យាសាស្ត្រ", "សិក្សាសង្គម", "បំណិន/សុខភាព",
    "ភាសាអង់គ្លេស", "អវត្តមាន/គំនូរ", "ពិន្ទុសរុប", "មធ្យមភាគ", "ចំណាត់ថ្នាក់"
  ];

  var rows = [headers];

  if (classStudents && classStudents.length > 0) {
    // Sort students by roster order: ID -> Name
    var sortedStudents = classStudents.slice().sort(function (a, b) {
      var idA = parseInt(a.id, 10);
      var idB = parseInt(b.id, 10);
      if (!isNaN(idA) && !isNaN(idB) && idA !== idB) return idA - idB;
      if (a.id !== b.id) return String(a.id || '').localeCompare(String(b.id || ''), 'km', { numeric: true });
      return (a.name || "").localeCompare(b.name || "", 'km');
    });

    var rowIndex = 1;

    // For each of the 10 school months (តុលា ដល់ កក្កដា)
    SCHOOL_MONTHS.forEach(function (mName) {
      sortedStudents.forEach(function (s) {
        var sId = (s.id || "").toString().trim();
        var sName = (s.name || "").toString().trim();
        var sGen = (s.gender || "").toString().trim();

        // Check if student has scores for this month
        var scKey1 = academicYear + '_' + className + '_' + mName + '_' + sId;
        var scKey2 = mName + '_' + sId;
        var sc = (scoreMap && (scoreMap[scKey1] || scoreMap[scKey2])) ? (scoreMap[scKey1] || scoreMap[scKey2]) : {};

        rows.push([
          rowIndex++,
          academicYear,
          className,
          mName,
          sId,
          sName,
          sGen,
          sc.khmer !== "" && sc.khmer !== undefined ? sc.khmer : "",
          sc.math !== "" && sc.math !== undefined ? sc.math : "",
          sc.science !== "" && sc.science !== undefined ? sc.science : "",
          sc.social !== "" && sc.social !== undefined ? sc.social : "",
          sc.pe !== "" && sc.pe !== undefined ? sc.pe : "",
          sc.english !== "" && sc.english !== undefined ? sc.english : "",
          sc.absences !== "" && sc.absences !== undefined ? sc.absences : "",
          sc.total !== "" && sc.total !== undefined ? sc.total : "",
          sc.average !== "" && sc.average !== undefined ? sc.average : "",
          sc.rank !== "" && sc.rank !== undefined ? sc.rank : ""
        ]);
      });
    });
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

  // Styling
  var hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground(headerColor || "#15803d")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.setFrozenRows(1);

  if (rows.length > 1) {
    sheet.getRange(2, 1, rows.length - 1, 1).setHorizontalAlignment("center"); // ល.រ
    sheet.getRange(2, 2, rows.length - 1, 1).setHorizontalAlignment("center"); // ឆ្នាំសិក្សា
    sheet.getRange(2, 3, rows.length - 1, 1).setHorizontalAlignment("center"); // ថ្នាក់រៀន
    sheet.getRange(2, 4, rows.length - 1, 1).setHorizontalAlignment("center"); // ខែ
    sheet.getRange(2, 5, rows.length - 1, 1).setHorizontalAlignment("center"); // អត្តលេខ
    sheet.getRange(2, 7, rows.length - 1, 1).setHorizontalAlignment("center"); // ភេទ
    sheet.getRange(2, 17, rows.length - 1, 1).setHorizontalAlignment("center"); // ចំណាត់ថ្នាក់
  }

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * ជំនួយការ៖ សរសេរសន្លឹកពិន្ទុឆមាស (បែងចែកតាមឆ្នាំសិក្សា)
 */
function writeSemesterGradesSheet(ss, sheetName, academicYear, semGrades, headerColor) {
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  try { sheet.setHiddenGridlines(false); } catch (gridErr) { }

  var headers = [
    "ល.រ", "ឆ្នាំសិក្សា", "ថ្នាក់រៀន", "ឆមាស", "អត្តលេខ (ID)", "គោត្តនាម និងនាម", "ភេទ",
    "ពិន្ទុសរុប", "មធ្យមភាគ", "ចំណាត់ថ្នាក់"
  ];
  var rows = [headers];

  if (semGrades && semGrades.length > 0) {
    var sorted = semGrades.slice().sort(function (a, b) {
      var oA = getClassOrder(a.className);
      var oB = getClassOrder(b.className);
      if (oA !== oB) return oA - oB;

      var semA = (a.semester || "").toString();
      var semB = (b.semester || "").toString();
      if (semA !== semB) return semA.localeCompare(semB, 'km');

      var idA = parseInt(a.id, 10);
      var idB = parseInt(b.id, 10);
      if (!isNaN(idA) && !isNaN(idB) && idA !== idB) return idA - idB;
      return (a.name || "").localeCompare(b.name || "", 'km');
    });

    var seenSemMap = {};
    var rowIndex = 1;

    sorted.forEach(function (sg) {
      var cStr = (sg.className || "").toString().trim();
      var semStr = (sg.semester || "").toString().trim();
      var sId = (sg.id || "").toString().trim();
      var sName = (sg.name || "").toString().trim();

      var dedupeKey = academicYear + '_' + cStr + '_' + semStr + '_' + (sId || sName);
      if (seenSemMap[dedupeKey]) return;
      seenSemMap[dedupeKey] = true;

      rows.push([
        rowIndex++,
        academicYear,
        cStr,
        semStr,
        sId,
        sName,
        sg.gender || "",
        sg.total !== "" && sg.total !== undefined ? sg.total : "",
        sg.average !== "" && sg.average !== undefined ? sg.average : "",
        sg.rank !== "" && sg.rank !== undefined ? sg.rank : ""
      ]);
    });
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

  var hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground(headerColor || "#7c3aed")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.setFrozenRows(1);

  if (rows.length > 1) {
    sheet.getRange(2, 1, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 2, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 3, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 4, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 5, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 7, rows.length - 1, 1).setHorizontalAlignment("center");
    sheet.getRange(2, 10, rows.length - 1, 1).setHorizontalAlignment("center");
  }

  sheet.autoResizeColumns(1, headers.length);
}

/**
 * មុខងារចុចដំណើរការ (Run) ផ្ទាល់៖ សម្អាតសន្លឹកចាស់ៗទាំងអស់ និងរៀបចំតាមឆ្នាំសិក្សាភ្លាមៗ
 */
function cleanAndSyncAllDataNow() {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    Logger.log("រកមិនឃើញ Google Sheet ទេ! សូមពិនិត្យមើល SPREADSHEET_ID។");
    return;
  }

  Logger.log("កំពុងចាប់ផ្ដើមសម្អាតសន្លឹកចាស់ៗចេញពី Google Sheet: " + ss.getName());
  removeDeprecatedSheets(ss);

  Logger.log("🎉 បានសម្អាតសន្លឹកកិច្ចការចាស់ៗ និងសន្លឹក conflict រួចរាល់ ១០០%!");
  Logger.log("👉 ជំហានបន្ទាប់៖ សូមចូលទៅកាន់កម្មវិធីគេហទំព័រ ហើយចុចប៊ូតុង «Sync ចូល Google Sheets»។ ប្រព័ន្ធនឹងបង្កើត Sheet តាមថ្នាក់ និងតាមឆ្នាំសិក្សាថ្មីយ៉ាងស្អាត និងមានរបៀបរៀបរយបំផុត!");
}

/**
 * Endpoint ពិនិត្យមើលស្ថានភាព Server និងទាញយកទិន្នន័យចុងក្រោយ (Two-way collaborative sync)
 */
function doGet(e) {
  var ss = getTargetSpreadsheet();
  if (!ss) {
    return createJsonResponse({ status: "error", message: "មិនអាចភ្ជាប់ទៅកាន់ Google Spreadsheet បានទេ" });
  }

  // ស្រង់ទិន្នន័យសិស្សទាំងអស់ចេញពី Sheet ផ្ទាល់ (សម្រាប់ Vue 3 onMounted auto-fetch)
  var targetSheet = getStudentSheet(ss);
  var studentsList = [];

  if (targetSheet && targetSheet.getLastRow() >= 2) {
    var lastRow = targetSheet.getLastRow();
    var lastCol = Math.max(17, targetSheet.getLastColumn());
    var rows = targetSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    rows.forEach(function (r, idx) {
      var sId = String(r[3] || '').trim();
      var sName = String(r[4] || '').trim();
      if (sId || sName) {
        studentsList.push({
          no: r[0] || (idx + 1),
          academicYear: String(r[1] || '២០២៦ - ២០២៧').trim(),
          className: String(r[2] || 'ថ្នាក់ទី ៦ ក').trim(),
          id: sId || ('S-' + (201 + idx)),
          name: sName,
          gender: String(r[5] || '').trim(),
          dob: formatGasDate(r[6]),
          age: r[7] ? String(r[7]).trim() : '',
          status: String(r[8] || 'សិស្សថ្មី').trim(),
          fatherName: String(r[9] || '').trim(),
          fatherJob: String(r[10] || '').trim(),
          motherName: String(r[11] || '').trim(),
          motherJob: String(r[12] || '').trim(),
          guardianName: String(r[13] || '').trim(),
          guardianJob: String(r[14] || '').trim(),
          phone: String(r[15] || '').trim(),
          pobProvince: String(r[16] || '').trim(),
          address: String(r[16] || '').trim()
        });
      }
    });
  }

  // ទិន្នន័យបម្រុងទុកសម្រាប់ Legacy Web App Sync
  var cloudData = {};
  var backupState = getCloudBackup(ss);
  if (backupState && backupState.data) {
    for (var bk in backupState.data) { cloudData[bk] = backupState.data[bk]; }
  }
  var extractedFromSheets = extractAllDataFromSheets(ss);
  for (var ek in extractedFromSheets) {
    if (!cloudData[ek]) cloudData[ek] = extractedFromSheets[ek];
  }
  cloudData['studentProfilesData'] = JSON.stringify(studentsList);
  cloudData['studentProfilesData_class_g6_k_ay_2026_2027'] = JSON.stringify(studentsList);

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    timestamp: new Date().toISOString(),
    count: studentsList.length,
    students: studentsList,
    data: cloudData
  })).setMimeType(ContentService.MimeType.JSON);
}

function extractAllDataFromSheets(ss) {
  var result = {};
  if (!ss) return result;

  var allSheets = ss.getSheets();

  function getClassIdFromName(cName) {
    if (!cName) return 'default';
    if (cName.indexOf('១') !== -1 || cName.indexOf('1') !== -1) return 'class_g1_k';
    if (cName.indexOf('២') !== -1 || cName.indexOf('2') !== -1) return 'class_g2_k';
    if (cName.indexOf('៣') !== -1 || cName.indexOf('3') !== -1) return 'class_g3_k';
    if (cName.indexOf('៤') !== -1 || cName.indexOf('4') !== -1) return 'class_g4_k';
    if (cName.indexOf('៥') !== -1 || cName.indexOf('5') !== -1) return 'default';
    if (cName.indexOf('៦') !== -1 || cName.indexOf('6') !== -1) return 'class_g6_k';
    return 'default';
  }

  function getYearIdFromName(yName) {
    if (!yName) return 'ay_2025_2026';
    var clean = yName.toString().replace(/[\s\-_]/g, '');
    if (clean.indexOf('២០២៣') !== -1 || clean.indexOf('2023') !== -1) return 'ay_2023_2024';
    if (clean.indexOf('២០២៤') !== -1 || clean.indexOf('2024') !== -1) return 'ay_2024_2025';
    if (clean.indexOf('២០២៥') !== -1 || clean.indexOf('2025') !== -1) return 'ay_2025_2026';
    if (clean.indexOf('២០២៦') !== -1 || clean.indexOf('2026') !== -1) return 'ay_2026_2027';
    if (clean.indexOf('២០២៧') !== -1 || clean.indexOf('2027') !== -1) return 'ay_2027_2028';
    return 'ay_2025_2026';
  }

  allSheets.forEach(function (sheet) {
    var name = sheet.getName();
    if (name === "_CLOUD_DATA_SYNC") return;

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 4) return;

    var rows = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    if (!rows || rows.length < 2) return;

    // A. សន្លឹកប្រវត្តិរូបសិស្ស (ប្រវត្តិរូប_រួម..., ប្រវត្តិរូប_ថ្នាក់ទី...)
    if (name.indexOf("ប្រវត្តិរូប") !== -1) {
      var profilesByGroup = {};
      for (var i = 1; i < rows.length; i++) {
        var r = rows[i];
        var sId = (r[3] !== undefined && r[3] !== null) ? String(r[3]).trim() : "";
        var sName = (r[4] !== undefined && r[4] !== null) ? String(r[4]).trim() : "";
        if (!sId && !sName) continue;

        var yName = (r[1] !== undefined && r[1] !== null) ? String(r[1]).trim() : "";
        var cName = (r[2] !== undefined && r[2] !== null) ? String(r[2]).trim() : "";
        if (!yName) yName = name;
        if (!cName) cName = name;
        var cId = getClassIdFromName(cName);
        var yId = getYearIdFromName(yName);
        var groupKey = cId + '___' + yId;

        if (!profilesByGroup[groupKey]) profilesByGroup[groupKey] = [];
        profilesByGroup[groupKey].push({
          id: sId,
          name: sName,
          gender: (r[5] !== undefined && r[5] !== null) ? String(r[5]).trim() : "",
          dob: formatGasDate(r[6]),
          age: r[7] || "",
          status: (r[8] !== undefined && r[8] !== null) ? String(r[8]).trim() : "សិស្សថ្មី",
          fatherName: (r[9] !== undefined && r[9] !== null) ? String(r[9]).trim() : "",
          fatherJob: (r[10] !== undefined && r[10] !== null) ? String(r[10]).trim() : "",
          motherName: (r[11] !== undefined && r[11] !== null) ? String(r[11]).trim() : "",
          motherJob: (r[12] !== undefined && r[12] !== null) ? String(r[12]).trim() : "",
          guardianName: (r[13] !== undefined && r[13] !== null) ? String(r[13]).trim() : "",
          guardianJob: (r[14] !== undefined && r[14] !== null) ? String(r[14]).trim() : "",
          phone: (r[15] !== undefined && r[15] !== null) ? String(r[15]).trim() : "",
          pob: (r[16] !== undefined && r[16] !== null) ? String(r[16]).trim() : "",
          address: (r[17] !== undefined && r[17] !== null) ? String(r[17]).trim() : "",
          equityCard: (r[18] !== undefined && r[18] !== null) ? String(r[18]).trim() : "គ្មាន",
          equityCardNo: (r[19] !== undefined && r[19] !== null) ? String(r[19]).trim() : "",
          orphanStatus: (r[20] !== undefined && r[20] !== null) ? String(r[20]).trim() : "មិនកំព្រា",
          familyMembers: (r[21] !== undefined && r[21] !== null) ? String(r[21]).trim() : "",
          difficulty: (r[22] !== undefined && r[22] !== null) ? String(r[22]).trim() : "",
          academicYear: yName || "២០២៥ - ២០២៦",
          className: cName || "ថ្នាក់ទី ៥ ក"
        });
      }

      for (var gk in profilesByGroup) {
        var parts = gk.split('___');
        var curCId = parts[0];
        var curYId = parts[1];
        var pList = profilesByGroup[gk];
        var isBase = (curYId === 'ay_2025_2026');

        if (isBase) {
          var k1 = (curCId === 'default' ? 'studentProfilesData' : 'studentProfilesData_' + curCId);
          result[k1] = JSON.stringify(pList);
          result['studentProfilesData_' + curCId + '_ay_2025_2026'] = JSON.stringify(pList);
        } else {
          var k2 = (curCId === 'default' ? 'studentProfilesData_' + curYId : 'studentProfilesData_' + curCId + '_' + curYId);
          result[k2] = JSON.stringify(pList);
        }
      }
    }
    // B. សន្លឹកពិន្ទុតាមខែ (ពិន្ទុ_ថ្នាក់ទី... មិនមែនឆមាស)
    else if (name.indexOf("ពិន្ទុ") !== -1 && name.indexOf("ឆមាស") === -1 && name.indexOf("ប្រចាំឆ្នាំ") === -1) {
      var gradesByGroup = {};
      for (var j = 1; j < rows.length; j++) {
        var rG = rows[j];
        var gId = (rG[4] !== undefined && rG[4] !== null) ? String(rG[4]).trim() : "";
        var gName = (rG[5] !== undefined && rG[5] !== null) ? String(rG[5]).trim() : "";
        var gMonth = (rG[3] !== undefined && rG[3] !== null) ? String(rG[3]).trim() : "";
        if (!gId && !gName) continue;

        var gYName = (rG[1] !== undefined && rG[1] !== null) ? String(rG[1]).trim() : "";
        var gCName = (rG[2] !== undefined && rG[2] !== null) ? String(rG[2]).trim() : "";
        if (!gYName) gYName = name;
        if (!gCName) gCName = name;
        var gCId = getClassIdFromName(gCName);
        var gYId = getYearIdFromName(gYName);
        var gGroupKey = gCId + '___' + gYId + '___' + gMonth;

        if (!gradesByGroup[gGroupKey]) gradesByGroup[gGroupKey] = [];
        gradesByGroup[gGroupKey].push({
          id: gId,
          name: gName,
          gender: (rG[6] !== undefined && rG[6] !== null) ? String(rG[6]).trim() : "",
          grades: {
            kh_1: rG[7] !== "" && rG[7] !== undefined ? String(rG[7]) : "",
            kh_2: "", kh_3: "", kh_4: "",
            ma_1: rG[8] !== "" && rG[8] !== undefined ? String(rG[8]) : "",
            ma_2: "", ma_3: "", ma_4: "", ma_5: "",
            sc_1: rG[9] !== "" && rG[9] !== undefined ? String(rG[9]) : "",
            sc_2: "", sc_3: "", sc_4: "",
            so_1: rG[10] !== "" && rG[10] !== undefined ? String(rG[10]) : "",
            so_2: "", so_3: "", so_4: "",
            sp_1: rG[11] !== "" && rG[11] !== undefined ? String(rG[11]) : "",
            sp_2: "",
            ls_1: "",
            en_1: rG[12] !== "" && rG[12] !== undefined ? String(rG[12]) : "",
            abs_1: rG[13] !== "" && rG[13] !== undefined ? String(rG[13]) : ""
          },
          total: parseFloat(rG[14]) || 0,
          average: parseFloat(rG[15]) || 0,
          rank: parseInt(rG[16], 10) || 0
        });
      }

      for (var ggk in gradesByGroup) {
        var gParts = ggk.split('___');
        var gClassId = gParts[0];
        var gYearId = gParts[1];
        var monthName = gParts[2];
        var gList = gradesByGroup[ggk];
        var isGbase = (gYearId === 'ay_2025_2026');

        if (isGbase) {
          var gk1 = (gClassId === 'default' ? 'studentGrades_' + monthName : 'studentGrades_' + monthName + '_' + gClassId);
          result[gk1] = JSON.stringify(gList);
          result['studentGrades_' + monthName + '_' + gClassId + '_ay_2025_2026'] = JSON.stringify(gList);
        } else {
          var gk2 = (gClassId === 'default' ? 'studentGrades_' + monthName + '_' + gYearId : 'studentGrades_' + monthName + '_' + gClassId + '_' + gYearId);
          result[gk2] = JSON.stringify(gList);
        }
      }
    }
    // C. សន្លឹកពិន្ទុឆមាស (ពិន្ទុប្រឡងឆមាស)
    else if (name.indexOf("ឆមាស") !== -1) {
      var semGradesByGroup = {};
      for (var k = 1; k < rows.length; k++) {
        var rS = rows[k];
        var sSemId = (rS[4] !== undefined && rS[4] !== null) ? String(rS[4]).trim() : "";
        var sSemName = (rS[5] !== undefined && rS[5] !== null) ? String(rS[5]).trim() : "";
        var sSem = (rS[3] !== undefined && rS[3] !== null) ? String(rS[3]).trim() : "ឆមាសទី១";
        if (!sSemId && !sSemName) continue;

        var sYName = (rS[1] !== undefined && rS[1] !== null) ? String(rS[1]).trim() : "";
        var sCName = (rS[2] !== undefined && rS[2] !== null) ? String(rS[2]).trim() : "";
        if (!sYName) sYName = name;
        if (!sCName) sCName = name;
        var sCId = getClassIdFromName(sCName);
        var sYId = getYearIdFromName(sYName);
        var sKey = (sSem.indexOf('២') !== -1 ? 'semester2ExamGrades' : 'semester1ExamGrades') + '_' + sCId;
        if (sYId !== 'ay_2025_2026') sKey += '_' + sYId;

        if (!semGradesByGroup[sKey]) semGradesByGroup[sKey] = [];
        semGradesByGroup[sKey].push({
          id: sSemId,
          name: sSemName,
          gender: (rS[6] !== undefined && rS[6] !== null) ? String(rS[6]).trim() : "",
          exam_avg: parseFloat(rS[8]) || 0,
          sem_avg: parseFloat(rS[8]) || 0,
          total: parseFloat(rS[7]) || 0,
          average: parseFloat(rS[8]) || 0,
          rank: parseInt(rS[9], 10) || 0
        });
      }

      for (var sk in semGradesByGroup) {
        result[sk] = JSON.stringify(semGradesByGroup[sk]);
      }
    }
  });

  return result;
}

/**
 * រក្សាទុកទិន្នន័យប្រព័ន្ធទាំងមូលក្នុង Sheet ពិសេសមួយ (_CLOUD_DATA_SYNC) ដើម្បីឲ្យកុំព្យូទ័រដទៃអាចទាញបាន
 */
function saveCloudBackup(ss, backupJsonStr) {
  try {
    if (!ss || !backupJsonStr) return;
    var sheet = ss.getSheetByName("_CLOUD_DATA_SYNC");
    if (!sheet) {
      sheet = ss.insertSheet("_CLOUD_DATA_SYNC");
      try { sheet.hideSheet(); } catch (hErr) { }
    }
    sheet.clear();
    sheet.getRange(1, 1).setValue(new Date().toISOString());

    var chunkSize = 45000;
    var chunks = [];
    for (var i = 0; i < backupJsonStr.length; i += chunkSize) {
      chunks.push([backupJsonStr.substring(i, i + chunkSize)]);
    }
    if (chunks.length > 0) {
      sheet.getRange(2, 1, chunks.length, 1).setValues(chunks);
    }
  } catch (e) {
    Logger.log("Save cloud backup notice: " + e.toString());
  }
}

/**
 * អានទិន្នន័យប្រព័ន្ធដែលបានរក្សាទុកក្នុង Sheet ពិសេស (_CLOUD_DATA_SYNC)
 */
function getCloudBackup(ss) {
  try {
    if (!ss) return null;
    var sheet = ss.getSheetByName("_CLOUD_DATA_SYNC");
    if (!sheet) return null;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;
    var timestamp = sheet.getRange(1, 1).getValue();
    var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var joined = "";
    for (var i = 0; i < values.length; i++) {
      joined += values[i][0];
    }
    return { timestamp: timestamp, data: JSON.parse(joined) };
  } catch (e) {
    Logger.log("Get cloud backup notice: " + e.toString());
    return null;
  }
}

/**
 * ទទួលទិន្នន័យ Auto-Sync POST ពី Website និងរៀបចំដាច់ដោយឡែកតាម «ថ្នាក់នីមួយៗ» និង «ឆ្នាំសិក្សានីមួយៗ»
 */
function doPost(e) {
  try {
    var rawData = "";
    if (e && e.postData && e.postData.contents) {
      rawData = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      rawData = e.parameter.data;
    }

    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data received" })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = null;
    try {
      var envelope = JSON.parse(rawData);
      if (envelope && envelope.students) {
        data = envelope;
      } else if (envelope && envelope.encoded && envelope.data) {
        try {
          var decodedStr = decodeURIComponent(envelope.data);
          data = JSON.parse(decodedStr);
        } catch (decErr) {
          try {
            var unescaped = unescape(envelope.data);
            data = JSON.parse(unescaped);
          } catch (unErr) { }
        }
      } else if (envelope && envelope.data && typeof envelope.data === 'object') {
        data = envelope.data;
      }
    } catch (envErr) { }

    if (!data) {
      try {
        data = JSON.parse(rawData);
      } catch (jsonErr) {
        try {
          var bytes = Utilities.base64Decode(rawData);
          var utf8Str = Utilities.newBlob(bytes).getDataAsString("UTF-8");
          data = JSON.parse(utf8Str);
        } catch (b64Err) {
          return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "JSON parse failed" })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    var ss = getTargetSpreadsheet();
    if (!ss) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Cannot access spreadsheet" })).setMimeType(ContentService.MimeType.JSON);

    // =========================================================================
    // សកម្មភាពទោល (Single Student Actions: create, update, delete)
    // សម្រាប់ Real-time Sync ជាមួយ Vue 3 និង Frontend
    // =========================================================================
    var action = (data.action || (e && e.parameter && e.parameter.action) || "").toLowerCase().trim();

    if (action === 'clear_class' || action === 'clear_all') {
      var clsName = data.className || "ថ្នាក់ទី ៦ ក";
      var yrName = data.academicYear || "២០២៦ - ២០២៧";
      var targetSheet = getStudentSheet(ss);
      if (targetSheet) {
        var last = targetSheet.getLastRow();
        if (last >= 2) {
          targetSheet.deleteRows(2, last - 1);
        }
      }
      var allShs = ss.getSheets();
      allShs.forEach(function(sh) {
        if (sh.getName().indexOf("ប្រវត្តិរូប") !== -1) {
          var l = sh.getLastRow();
          if (l >= 2) {
            sh.deleteRows(2, l - 1);
          }
        }
      });
      var cloudSh = ss.getSheetByName("_CLOUD_DATA_SYNC");
      if (cloudSh) {
        cloudSh.clear();
      }
      return createJsonResponse({
        status: "success",
        action: "clear_class",
        message: "បានសម្អាតទិន្នន័យសិស្សក្នុង " + clsName + " ចេញពី Google Sheet រួចរាល់!"
      });
    }

    if (action === 'delete') {
      var targetId = data.id || (data.student && data.student.id) || (e && e.parameter && e.parameter.id);
      if (!targetId) {
        return createJsonResponse({ status: "error", message: "សូមបញ្ជាក់ ID សិស្សដែលត្រូវលុប" });
      }

      var allSheets = ss.getSheets();
      var deletedInSheets = 0;

      allSheets.forEach(function (sheet) {
        var sName = sheet.getName();
        if (sName === "_CLOUD_DATA_SYNC") return;

        var rowIdx = findStudentRowById(sheet, targetId);
        while (rowIdx !== -1) {
          sheet.deleteRow(rowIdx);
          deletedInSheets++;

          // រៀបចំលេខរៀងជួរឈរ A (ល.រ) ឡើងវិញឱ្យមានលំដាប់ ១, ២, ៣...
          var newLast = sheet.getLastRow();
          if (newLast >= 2) {
            var numArr = [];
            for (var n = 1; n <= newLast - 1; n++) { numArr.push([n]); }
            sheet.getRange(2, 1, numArr.length, 1).setValues(numArr);
          }
          rowIdx = findStudentRowById(sheet, targetId);
        }
      });

      return createJsonResponse({
        status: "success",
        action: "delete",
        id: targetId,
        message: "បានលុបសិស្សអត្តលេខ " + targetId + " ចេញពីគ្រប់សន្លឹកកិច្ចការ Google Sheet ដោយជោគជ័យ!"
      });
    }

    if (action === 'update') {
      var s = data.student || data;
      var targetId = s.id || (e && e.parameter && e.parameter.id);
      if (!targetId) {
        return createJsonResponse({ status: "error", message: "សូមបញ្ជាក់ ID សិស្សដែលត្រូវកែប្រែ" });
      }

      var formattedDob = formatGasDate(s.dob);
      var calculatedAge = s.age || (s.dob ? calculateKhmerAge(s.dob) : "");
      var guardian = s.guardianName || s.guardian || ((s.fatherName && s.motherName) ? (s.fatherName + ' / ' + s.motherName) : (s.fatherName || s.motherName || ''));
      var guardianJob = s.guardianJob || s.fatherJob || s.motherJob || 'កសិករ';
      var pobStr = s.pob || [s.pobVillage ? 'ភូមិ' + s.pobVillage : '', s.pobCommune ? 'ឃុំ' + s.pobCommune : '', s.pobDistrict ? 'ស្រុក' + s.pobDistrict : '', s.pobProvince ? 'ខេត្ត' + s.pobProvince : ''].filter(Boolean).join(' ') || s.pobProvince || '';
      var addrStr = s.address || [s.currHouse ? 'ផ្ទះ' + s.currHouse : '', s.currVillage ? 'ភូមិ' + s.currVillage : '', s.currCommune ? 'ឃុំ' + s.currCommune : '', s.currDistrict ? 'ស្រុក' + s.currDistrict : '', s.currProvince ? 'ខេត្ត' + s.currProvince : ''].filter(Boolean).join(' ') || s.currProvince || '';
      var famStr = s.familyMembers || (s.familyMembersTot ? (s.familyMembersTot + ' នាក់' + (s.familyMembersFem ? ' (ស្រី ' + s.familyMembersFem + ')' : '')) : '');

      var updateVals = [
        s.academicYear || "២០២៦ - ២០២៧",
        s.className || "ថ្នាក់ទី ៦ ក",
        s.id,
        s.name || "",
        s.gender === 'ប្រុស' ? 'ប' : (s.gender === 'ស្រី' ? 'ស' : (s.gender || "")),
        formattedDob,
        calculatedAge,
        s.status || "សិស្សថ្មី",
        s.fatherName || "",
        s.fatherJob || "",
        s.motherName || "",
        s.motherJob || "",
        guardian,
        guardianJob,
        s.phone || "",
        pobStr,
        addrStr,
        s.equityCard || "",
        s.equityCardNo || "",
        s.orphanStatus || "",
        famStr,
        s.difficulty || ""
      ];

      var allSheets = ss.getSheets();
      var updatedCount = 0;

      allSheets.forEach(function (sheet) {
        var sName = sheet.getName();
        if (sName === "_CLOUD_DATA_SYNC") return;

        // 1. Update in Profile sheets
        if (sName.indexOf("ប្រវត្តិរូប") !== -1) {
          var rowIdx = findStudentRowById(sheet, targetId);
          if (rowIdx !== -1) {
            sheet.getRange(rowIdx, 2, 1, updateVals.length).setValues([updateVals]);
            updatedCount++;
          }
        }

        // 2. Update name and gender in Monthly Grade sheets
        if (sName.indexOf("ពិន្ទុ") !== -1) {
          var lastRow = sheet.getLastRow();
          if (lastRow >= 2) {
            var dataCol = sheet.getRange(2, 4, lastRow - 1, 3).getValues(); // Cols D, E, F (ID, Name, Gender)
            for (var r = 0; r < dataCol.length; r++) {
              if (String(dataCol[r][0] || '').trim().toLowerCase() === String(targetId).trim().toLowerCase()) {
                var targetRow = r + 2;
                sheet.getRange(targetRow, 5, 1, 2).setValues([[s.name || "", (s.gender === 'ប្រុស' ? 'ប' : (s.gender === 'ស្រី' ? 'ស' : (s.gender || "")))]]);
                updatedCount++;
              }
            }
          }
        }
      });

      // If student was not found in any profile sheet, append to master profile sheet
      if (updatedCount === 0) {
        var targetSheet = getStudentSheet(ss);
        if (targetSheet) {
          var nextNo = Math.max(1, targetSheet.getLastRow());
          var appendRow = [nextNo].concat(updateVals);
          targetSheet.appendRow(appendRow);
          updatedCount++;
        }
      }

      return createJsonResponse({
        status: "success",
        action: "update",
        id: targetId,
        message: "បានកែប្រែទិន្នន័យសិស្ស " + targetId + " ក្នុង Google Sheet រួចរាល់!"
      });
    }

    if (action === 'create' || action === 'add') {
      var s = data.student || data;
      var targetSheet = getStudentSheet(ss);
      var nextNo = Math.max(1, targetSheet ? targetSheet.getLastRow() : 1);
      var sId = s.id || ("S-" + (200 + nextNo));

      var formattedDob = formatGasDate(s.dob);
      var calculatedAge = s.age || (s.dob ? calculateKhmerAge(s.dob) : "");
      var guardian = s.guardianName || s.guardian || ((s.fatherName && s.motherName) ? (s.fatherName + ' / ' + s.motherName) : (s.fatherName || s.motherName || ''));
      var guardianJob = s.guardianJob || s.fatherJob || s.motherJob || 'កសិករ';
      var pobStr = s.pob || [s.pobVillage ? 'ភូមិ' + s.pobVillage : '', s.pobCommune ? 'ឃុំ' + s.pobCommune : '', s.pobDistrict ? 'ស្រុក' + s.pobDistrict : '', s.pobProvince ? 'ខេត្ត' + s.pobProvince : ''].filter(Boolean).join(' ') || s.pobProvince || '';
      var addrStr = s.address || [s.currHouse ? 'ផ្ទះ' + s.currHouse : '', s.currVillage ? 'ភូមិ' + s.currVillage : '', s.currCommune ? 'ឃុំ' + s.currCommune : '', s.currDistrict ? 'ស្រុក' + s.currDistrict : '', s.currProvince ? 'ខេត្ត' + s.currProvince : ''].filter(Boolean).join(' ') || s.currProvince || '';
      var famStr = s.familyMembers || (s.familyMembersTot ? (s.familyMembersTot + ' នាក់' + (s.familyMembersFem ? ' (ស្រី ' + s.familyMembersFem + ')' : '')) : '');

      var newRow = [
        nextNo,
        s.academicYear || "២០២៦ - ២០២៧",
        s.className || "ថ្នាក់ទី ៦ ក",
        sId,
        s.name || "",
        s.gender === 'ប្រុស' ? 'ប' : (s.gender === 'ស្រី' ? 'ស' : (s.gender || "")),
        formattedDob,
        calculatedAge,
        s.status || "សិស្សថ្មី",
        s.fatherName || "",
        s.fatherJob || "",
        s.motherName || "",
        s.motherJob || "",
        guardian,
        guardianJob,
        s.phone || "",
        pobStr,
        addrStr,
        s.equityCard || "",
        s.equityCardNo || "",
        s.orphanStatus || "",
        famStr,
        s.difficulty || ""
      ];
      if (targetSheet) {
        targetSheet.appendRow(newRow);
      }
      return createJsonResponse({
        status: "success",
        action: "create",
        id: sId,
        message: "បានបង្កើតសិស្សថ្មី " + sId + " ក្នុង Google Sheet ជោគជ័យ!"
      });
    }


    // រក្សាទុកទិន្នន័យបម្រុងសម្រាប់ Sync រវាងកុំព្យូទ័រផ្សេងគ្នា
    if (data.backupJson) {
      saveCloudBackup(ss, data.backupJson);
    }

    // លុបសន្លឹកចាស់ៗទាំងអស់ (សន្លឹកតាមខែចាស់, conflict, ពេញលេញ...)
    removeDeprecatedSheets(ss);

    // Standard primary classes list (ថ្នាក់ទី ១ ក ដល់ ថ្នាក់ទី ៦ ក)
    var standardClasses = ["ថ្នាក់ទី ១ ក", "ថ្នាក់ទី ២ ក", "ថ្នាក់ទី ៣ ក", "ថ្នាក់ទី ៤ ក", "ថ្នាក់ទី ៥ ក", "ថ្នាក់ទី ៦ ក"];
    if (data.classes && Array.isArray(data.classes)) {
      data.classes.forEach(function (c) {
        var cName = (c.name || "").trim();
        if (cName && standardClasses.indexOf(cName) === -1) {
          standardClasses.push(cName);
        }
      });
    }

    standardClasses.sort(function (a, b) {
      var oA = getClassOrder(a);
      var oB = getClassOrder(b);
      if (oA !== oB) return oA - oB;
      return a.localeCompare(b, 'km');
    });

    function normalizeClassName(c) {
      if (!c) return 'ថ្នាក់ទី ៥ ក';
      var clean = String(c).replace(/[\s\-_]/g, '');
      if (clean.indexOf('១') !== -1 || clean.indexOf('1') !== -1) return 'ថ្នាក់ទី ១ ក';
      if (clean.indexOf('២') !== -1 || clean.indexOf('2') !== -1) return 'ថ្នាក់ទី ២ ក';
      if (clean.indexOf('៣') !== -1 || clean.indexOf('3') !== -1) return 'ថ្នាក់ទី ៣ ក';
      if (clean.indexOf('៤') !== -1 || clean.indexOf('4') !== -1) return 'ថ្នាក់ទី ៤ ក';
      if (clean.indexOf('៥') !== -1 || clean.indexOf('5') !== -1) return 'ថ្នាក់ទី ៥ ក';
      if (clean.indexOf('៦') !== -1 || clean.indexOf('6') !== -1) return 'ថ្នាក់ទី ៦ ក';
      return String(c).trim();
    }

    function normalizeYearName(y) {
      if (!y) return '២០២៥ - ២០២៦';
      var clean = String(y).replace(/[\s\-_]/g, '');
      if (clean.indexOf('២០២៣') !== -1 || clean.indexOf('2023') !== -1) return '២០២៣ - ២០២៤';
      if (clean.indexOf('២០២៤') !== -1 || clean.indexOf('2024') !== -1) return '២០២៤ - ២០២៥';
      if (clean.indexOf('២០២៥') !== -1 || clean.indexOf('2025') !== -1) return '២០២៥ - ២០២៦';
      if (clean.indexOf('២០២៦') !== -1 || clean.indexOf('2026') !== -1) return '២០២៦ - ២០២៧';
      if (clean.indexOf('២០២៧') !== -1 || clean.indexOf('2027') !== -1) return '២០២៧ - ២០២៨';
      return String(y).trim();
    }

    // 1. Group student profiles by Academic Year, then Class
    var studentsByYear = {};
    if (data.students && Array.isArray(data.students)) {
      data.students.forEach(function (s) {
        var yr = normalizeYearName(s.academicYear || data.activeAcademicYear);
        var cls = normalizeClassName(s.className);
        s.academicYear = yr;
        s.className = cls;
        s.dob = formatGasDate(s.dob);
        if (!studentsByYear[yr]) studentsByYear[yr] = {};
        if (!studentsByYear[yr][cls]) studentsByYear[yr][cls] = [];
        studentsByYear[yr][cls].push(s);
      });
    }

    // 2. Build fast lookup map for monthly scores
    var monthlyScoreMap = {};
    if (data.monthlyGrades && Array.isArray(data.monthlyGrades)) {
      data.monthlyGrades.forEach(function (g) {
        var yr = (g.academicYear || data.activeAcademicYear || "២០២៥ - ២០២៦").toString().trim();
        var cls = (g.className || "").toString().trim();
        var m = (g.month || "").toString().trim();
        var sId = (g.id || "").toString().trim();
        if (m && sId) {
          monthlyScoreMap[yr + '_' + cls + '_' + m + '_' + sId] = g;
          monthlyScoreMap[m + '_' + sId] = g;
        }
      });
    }

    // 3. Group semester exam grades by Academic Year
    var semGradesByYear = {};
    if (data.semesterGrades && Array.isArray(data.semesterGrades)) {
      data.semesterGrades.forEach(function (sg) {
        var yr = (sg.academicYear || data.activeAcademicYear || "២០២៥ - ២០២៦").toString().trim();
        if (!semGradesByYear[yr]) semGradesByYear[yr] = [];
        semGradesByYear[yr].push(sg);
      });
    }

    // Determine all distinct academic years
    var allYearsSet = {};
    if (data.activeAcademicYear) allYearsSet[data.activeAcademicYear] = true;
    for (var y in studentsByYear) allYearsSet[y] = true;
    for (var y in semGradesByYear) allYearsSet[y] = true;

    var sortedYears = Object.keys(allYearsSet).sort(function (a, b) {
      return a.localeCompare(b, 'km');
    });

    if (sortedYears.length === 0) {
      sortedYears = ["២០២៥ - ២០២៦"];
    }

    // PROCESS EACH ACADEMIC YEAR INDEPENDENTLY
    sortedYears.forEach(function (yr) {
      var classMapForYear = studentsByYear[yr] || {};

      // A. Master student profiles sheet for this academic year (includes all classes without missing any)
      var masterProfilesList = [];
      for (var kCls in classMapForYear) {
        if (classMapForYear.hasOwnProperty(kCls)) {
          masterProfilesList = masterProfilesList.concat(classMapForYear[kCls]);
        }
      }

      writeStudentProfilesSheet(ss, "ប្រវត្តិរូប_រួម (" + yr + ")", masterProfilesList, "#0f766e");

      // B. Individual Student Profile Sheets per Class
      standardClasses.forEach(function (cName) {
        var sList = classMapForYear[cName] || [];
        var cleanClassName = cName.replace(/\s+/g, '');
        var profileSheetTitle = "ប្រវត្តិរូប_" + cleanClassName + " (" + yr + ")";
        writeStudentProfilesSheet(ss, profileSheetTitle, sList, "#0284c7");
      });

      // C. INDIVIDUAL GRADE SHEET PER CLASS (ONE SHEET PER CLASS FOR ALL MONTHS!)
      standardClasses.forEach(function (cName) {
        var sList = classMapForYear[cName] || [];
        var cleanClassName = cName.replace(/\s+/g, '');
        var gradeSheetTitle = "ពិន្ទុ_" + cleanClassName + " (" + yr + ")";
        writeClassMonthlyGradesSheet(ss, gradeSheetTitle, cName, yr, sList, monthlyScoreMap, "#15803d");
      });

      // D. Semester Exam Grades for this Academic Year
      var yrSemGrades = semGradesByYear[yr] || [];
      writeSemesterGradesSheet(ss, "ពិន្ទុ_ឆមាស (" + yr + ")", yr, yrSemGrades, "#7c3aed");
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Sync completed! All sheets partitioned strictly by Class and Academic Year."
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
