var KhmerCalendar = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

  // node_modules/khmer-chhankitek-calendar/dist/index.js
  var index_exports = {};
  __export(index_exports, {
    ANIMAL_YEARS: () => ANIMAL_YEARS,
    ANIMAL_YEARS_EN: () => ANIMAL_YEARS_EN,
    ANIMAL_YEARS_EN_BY_KM: () => ANIMAL_YEARS_EN_BY_KM,
    DAYS_OF_WEEK_EN: () => DAYS_OF_WEEK_EN,
    DAYS_OF_WEEK_EN_BY_KM: () => DAYS_OF_WEEK_EN_BY_KM,
    DAYS_OF_WEEK_KM: () => DAYS_OF_WEEK_KM,
    GREGORIAN_MONTHS_KM: () => GREGORIAN_MONTHS_KM,
    KHMER_MONTHS: () => KHMER_MONTHS,
    KHMER_MONTHS_EN: () => KHMER_MONTHS_EN,
    KHMER_MONTHS_EN_BY_KM: () => KHMER_MONTHS_EN_BY_KM,
    MOON_STATUS_EN: () => MOON_STATUS_EN,
    MOON_STATUS_KM: () => MOON_STATUS_KM,
    SAKS: () => SAKS,
    SAKS_EN: () => SAKS_EN,
    SAKS_EN_BY_KM: () => SAKS_EN_BY_KM,
    formatKhmerDate: () => formatKhmerDate,
    getAnimalYear: () => getAnimalYear,
    getKhmerHolidays: () => getKhmerHolidays,
    getKhmerMonth: () => getKhmerMonth,
    getKhmerYear: () => getKhmerYear,
    getSak: () => getSak,
    isSilDay: () => isSilDay,
    toKhmerLunarDate: () => toKhmerLunarDate,
    toKhmerNumber: () => toKhmerNumber
  });
  var KHMER_MONTHS = [
    "\u1785\u17C1\u178F\u17D2\u179A",
    "\u1796\u17B7\u179F\u17B6\u1781",
    "\u1787\u17C1\u179F\u17D2\u178B",
    "\u17A2\u17B6\u179F\u17B6\u178D",
    "\u1794\u178B\u1798\u17B6\u179F\u17B6\u178D",
    "\u1791\u17BB\u178F\u17B7\u1799\u17B6\u179F\u17B6\u178D",
    "\u179F\u17D2\u179A\u17B6\u1796\u178E\u17CD",
    "\u1797\u1791\u17D2\u179A\u1794\u1791",
    "\u17A2\u179F\u17D2\u179F\u17BB\u1787",
    "\u1780\u178F\u17D2\u178F\u17B7\u1780",
    "\u1798\u17B7\u1782\u179F\u17B7\u179A",
    "\u1794\u17BB\u179F\u17D2\u179F",
    "\u1798\u17B6\u1783",
    "\u1795\u179B\u17D2\u1782\u17BB\u1793"
  ];
  var KHMER_MONTHS_EN = [
    "Chet",
    "Vesak",
    "Je\u1E6D\u1E6Dha",
    "Asadha",
    "Pathamasadha",
    "Tutiyasadha",
    "Srapon",
    "Photrobot",
    "Assuj",
    "Kattik",
    "Migasir",
    "Pous",
    "Magha",
    "Phalguna"
  ];
  var KHMER_MONTHS_EN_BY_KM = {
    \u1785\u17C1\u178F\u17D2\u179A: "Chet",
    \u1796\u17B7\u179F\u17B6\u1781: "Vesak",
    \u1787\u17C1\u179F\u17D2\u178B: "Je\u1E6D\u1E6Dha",
    \u17A2\u17B6\u179F\u17B6\u178D: "Asadha",
    \u1794\u178B\u1798\u17B6\u179F\u17B6\u178D: "Pathamasadha",
    \u1791\u17BB\u178F\u17B7\u1799\u17B6\u179F\u17B6\u178D: "Tutiyasadha",
    \u179F\u17D2\u179A\u17B6\u1796\u178E\u17CD: "Srapon",
    \u1797\u1791\u17D2\u179A\u1794\u1791: "Photrobot",
    \u17A2\u179F\u17D2\u179F\u17BB\u1787: "Assuj",
    \u1780\u178F\u17D2\u178F\u17B7\u1780: "Kattik",
    \u1798\u17B7\u1782\u179F\u17B7\u179A: "Migasir",
    \u1794\u17BB\u179F\u17D2\u179F: "Pous",
    \u1798\u17B6\u1783: "Magha",
    \u1795\u179B\u17D2\u1782\u17BB\u1793: "Phalguna"
  };
  var ANIMAL_YEARS = [
    "\u1787\u17BC\u178F",
    "\u1786\u17D2\u179B\u17BC\u179C",
    "\u1781\u17B6\u179B",
    "\u1790\u17C4\u17C7",
    "\u179A\u17C4\u1784",
    "\u1798\u17D2\u179F\u17B6\u1789\u17CB",
    "\u1798\u1798\u17B8",
    "\u1798\u1798\u17C2",
    "\u179C\u1780",
    "\u179A\u1780\u17B6",
    "\u1785",
    "\u1780\u17BB\u179A"
  ];
  var ANIMAL_YEARS_EN = [
    "Rat",
    "Ox",
    "Tiger",
    "Rabbit",
    "Dragon",
    "Snake",
    "Horse",
    "Goat",
    "Monkey",
    "Rooster",
    "Dog",
    "Pig"
  ];
  var ANIMAL_YEARS_EN_BY_KM = {
    \u1787\u17BC\u178F: "Rat",
    \u1786\u17D2\u179B\u17BC\u179C: "Ox",
    \u1781\u17B6\u179B: "Tiger",
    \u1790\u17C4\u17C7: "Rabbit",
    \u179A\u17C4\u1784: "Dragon",
    \u1798\u17D2\u179F\u17B6\u1789\u17CB: "Snake",
    \u1798\u1798\u17B8: "Horse",
    \u1798\u1798\u17C2: "Goat",
    \u179C\u1780: "Monkey",
    \u179A\u1780\u17B6: "Rooster",
    \u1785: "Dog",
    \u1780\u17BB\u179A: "Pig"
  };
  var SAKS = [
    "\u17AF\u1780\u179F\u17D0\u1780",
    "\u1791\u17C4\u179F\u17D0\u1780",
    "\u178F\u17D2\u179A\u17B8\u179F\u17D0\u1780",
    "\u1785\u178F\u17D2\u179C\u17B6\u179F\u17D0\u1780",
    "\u1794\u1789\u17D2\u1785\u179F\u17D0\u1780",
    "\u1786\u179F\u17D0\u1780",
    "\u179F\u1794\u17D2\u178F\u179F\u17D0\u1780",
    "\u17A2\u178A\u17D2\u178B\u179F\u17D0\u1780",
    "\u1793\u1796\u17D2\u179C\u179F\u17D0\u1780",
    "\u179F\u17C6\u179A\u17B9\u1791\u17D2\u1792\u17B7\u179F\u17D0\u1780"
  ];
  var SAKS_EN = [
    "Aekasak",
    "Tosak",
    "Treisak",
    "Chatvasak",
    "Panchasak",
    "Chhasak",
    "Saptasak",
    "Atthasak",
    "Navasak",
    "Samriddhisak"
  ];
  var SAKS_EN_BY_KM = {
    \u17AF\u1780\u179F\u17D0\u1780: "Aekasak",
    \u1791\u17C4\u179F\u17D0\u1780: "Tosak",
    \u178F\u17D2\u179A\u17B8\u179F\u17D0\u1780: "Treisak",
    \u1785\u178F\u17D2\u179C\u17B6\u179F\u17D0\u1780: "Chatvasak",
    \u1794\u1789\u17D2\u1785\u179F\u17D0\u1780: "Panchasak",
    \u1786\u179F\u17D0\u1780: "Chhasak",
    \u179F\u1794\u17D2\u178F\u179F\u17D0\u1780: "Saptasak",
    \u17A2\u178A\u17D2\u178B\u179F\u17D0\u1780: "Atthasak",
    \u1793\u1796\u17D2\u179C\u179F\u17D0\u1780: "Navasak",
    \u179F\u17C6\u179A\u17B9\u1791\u17D2\u1792\u17B7\u179F\u17D0\u1780: "Samriddhisak"
  };
  var MOON_STATUS_KM = {
    waxing: "\u1780\u17BE\u178F",
    waning: "\u179A\u17C4\u1785"
  };
  var MOON_STATUS_EN = {
    waxing: "Waxing",
    waning: "Waning"
  };
  var DAYS_OF_WEEK_KM = [
    "\u17A2\u17B6\u1791\u17B7\u178F\u17D2\u1799",
    "\u1785\u1793\u17D2\u1791",
    "\u17A2\u1784\u17D2\u1782\u17B6\u179A",
    "\u1796\u17BB\u1792",
    "\u1796\u17D2\u179A\u17A0\u179F\u17D2\u1794\u178F\u17B7\u17CD",
    "\u179F\u17BB\u1780\u17D2\u179A",
    "\u179F\u17C5\u179A\u17CD"
  ];
  var DAYS_OF_WEEK_EN = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  var DAYS_OF_WEEK_EN_BY_KM = {
    \u17A2\u17B6\u1791\u17B7\u178F\u17D2\u1799: "Sunday",
    \u1785\u1793\u17D2\u1791: "Monday",
    \u17A2\u1784\u17D2\u1782\u17B6\u179A: "Tuesday",
    \u1796\u17BB\u1792: "Wednesday",
    \u1796\u17D2\u179A\u17A0\u179F\u17D2\u1794\u178F\u17B7\u17CD: "Thursday",
    \u179F\u17BB\u1780\u17D2\u179A: "Friday",
    \u179F\u17C5\u179A\u17CD: "Saturday"
  };
  var GREGORIAN_MONTHS_KM = [
    "\u1798\u1780\u179A\u17B6",
    "\u1780\u17BB\u1798\u17D2\u1797\u17C8",
    "\u1798\u17B8\u1793\u17B6",
    "\u1798\u17C1\u179F\u17B6",
    "\u17A7\u179F\u1797\u17B6",
    "\u1798\u17B7\u1790\u17BB\u1793\u17B6",
    "\u1780\u1780\u17D2\u1780\u178A\u17B6",
    "\u179F\u17B8\u17A0\u17B6",
    "\u1780\u1789\u17D2\u1789\u17B6",
    "\u178F\u17BB\u179B\u17B6",
    "\u179C\u17B7\u1785\u17D2\u1786\u17B7\u1780\u17B6",
    "\u1792\u17D2\u1793\u17BC"
  ];
  var ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
  var ISO_DATE_TIME_WITH_TIME_ZONE_RE = /^(\d{4})-(\d{2})-(\d{2})T.+(?:Z|[+-]\d{2}:?\d{2})$/i;
  var MIN_SUPPORTED_GREGORIAN_YEAR = 1900;
  function assertSupportedGregorianYear(year) {
    if (year < MIN_SUPPORTED_GREGORIAN_YEAR) {
      throw new Error(`Dates before ${MIN_SUPPORTED_GREGORIAN_YEAR}-01-01 are not supported.`);
    }
  }
  function createLocalDate(year, month, day) {
    const normalized = new Date(year, month - 1, day);
    if (normalized.getFullYear() !== year || normalized.getMonth() !== month - 1 || normalized.getDate() !== day) {
      throw new Error("Invalid date provided.");
    }
    assertSupportedGregorianYear(year);
    return normalized;
  }
  function normalizeDate(date) {
    if (date instanceof Date) {
      const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      if (Number.isNaN(normalized.getTime())) {
        throw new Error("Invalid date provided.");
      }
      assertSupportedGregorianYear(normalized.getFullYear());
      return normalized;
    }
    if (typeof date === "string") {
      const value = date.trim();
      const match = ISO_DATE_ONLY_RE.exec(value);
      if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        return createLocalDate(year, month, day);
      }
      const zonedDateTimeMatch = ISO_DATE_TIME_WITH_TIME_ZONE_RE.exec(value);
      if (zonedDateTimeMatch) {
        createLocalDate(
          Number(zonedDateTimeMatch[1]),
          Number(zonedDateTimeMatch[2]),
          Number(zonedDateTimeMatch[3])
        );
        const parsed2 = new Date(value);
        if (Number.isNaN(parsed2.getTime())) {
          throw new Error("Invalid date provided.");
        }
        return createLocalDate(
          parsed2.getUTCFullYear(),
          parsed2.getUTCMonth() + 1,
          parsed2.getUTCDate()
        );
      }
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid date provided.");
    }
    assertSupportedGregorianYear(parsed.getFullYear());
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  function formatISODate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  var KHMER_DIGITS = ["\u17E0", "\u17E1", "\u17E2", "\u17E3", "\u17E4", "\u17E5", "\u17E6", "\u17E7", "\u17E8", "\u17E9"];
  function toKhmerNumber(input) {
    return input.toString().replace(/\d/g, (digit) => KHMER_DIGITS[Number.parseInt(digit, 10)]);
  }
  var KHMER_EPOCH_YEAR = 1900;
  var KHMER_EPOCH_MONTH = 2;
  var KHMER_EPOCH_DAY = 1;
  var NORMAL_KHMER_YEAR_DAYS = 354;
  var LEAP_DAY_KHMER_YEAR_DAYS = 355;
  var LEAP_MONTH_KHMER_YEAR_DAYS = 384;
  var MONTH_LENGTH_SHORT = 29;
  var MONTH_LENGTH_LONG = 30;
  var SONGKRAN_SEARCH_START_MONTH = 3;
  var SONGKRAN_SEARCH_START_DAY = 10;
  var SONGKRAN_SEARCH_END_MONTH = 5;
  var SONGKRAN_SEARCH_END_DAY = 15;
  var NORMAL_MONTHS_BY_NUMBER = [
    "\u1798\u17B7\u1782\u179F\u17B7\u179A",
    "\u1794\u17BB\u179F\u17D2\u179F",
    "\u1798\u17B6\u1783",
    "\u1795\u179B\u17D2\u1782\u17BB\u1793",
    "\u1785\u17C1\u178F\u17D2\u179A",
    "\u1796\u17B7\u179F\u17B6\u1781",
    "\u1787\u17C1\u179F\u17D2\u178B",
    "\u17A2\u17B6\u179F\u17B6\u178D",
    "\u179F\u17D2\u179A\u17B6\u1796\u178E\u17CD",
    "\u1797\u1791\u17D2\u179A\u1794\u1791",
    "\u17A2\u179F\u17D2\u179F\u17BB\u1787",
    "\u1780\u178F\u17D2\u178F\u17B7\u1780"
  ];
  var LEAP_MONTHS_BY_NUMBER = [
    "\u1798\u17B7\u1782\u179F\u17B7\u179A",
    "\u1794\u17BB\u179F\u17D2\u179F",
    "\u1798\u17B6\u1783",
    "\u1795\u179B\u17D2\u1782\u17BB\u1793",
    "\u1785\u17C1\u178F\u17D2\u179A",
    "\u1796\u17B7\u179F\u17B6\u1781",
    "\u1787\u17C1\u179F\u17D2\u178B",
    "\u1794\u178B\u1798\u17B6\u179F\u17B6\u178D",
    "\u1791\u17BB\u178F\u17B7\u1799\u17B6\u179F\u17B6\u178D",
    "\u179F\u17D2\u179A\u17B6\u1796\u178E\u17CD",
    "\u1797\u1791\u17D2\u179A\u1794\u1791",
    "\u17A2\u179F\u17D2\u179F\u17BB\u1787",
    "\u1780\u178F\u17D2\u178F\u17B7\u1780"
  ];
  var holidayCache = /* @__PURE__ */ new Map();
  var khmerNewYearCache = /* @__PURE__ */ new Map();
  var buddhistEraBoundaryCache = /* @__PURE__ */ new Map();
  var DYNAMIC_LUNAR_HOLIDAY_RULES = [
    {
      nameKm: "\u1798\u17B6\u1783\u1794\u17BC\u1787\u17B6",
      nameEn: "Meak Bochea",
      type: "religious",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1798\u17B6\u1783" && lunarDate.moonStatus === "\u1780\u17BE\u178F" && lunarDate.moonDay === 15
    },
    {
      nameKm: "\u179C\u17B7\u179F\u17B6\u1781\u1794\u17BC\u1787\u17B6",
      nameEn: "Visak Bochea",
      type: "religious",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1796\u17B7\u179F\u17B6\u1781" && lunarDate.moonStatus === "\u1780\u17BE\u178F" && lunarDate.moonDay === 15
    },
    {
      nameKm: "\u179C\u17B7\u179F\u17B6\u1781\u1794\u17BC\u1787\u17B6",
      nameEn: "Visak Bochea Day",
      type: "public",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1796\u17B7\u179F\u17B6\u1781" && lunarDate.moonStatus === "\u1780\u17BE\u178F" && lunarDate.moonDay === 15
    },
    {
      nameKm: "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1785\u17D2\u179A\u178F\u17CB\u1796\u17D2\u179A\u17C7\u1793\u1784\u17D2\u1782\u17D0\u179B",
      nameEn: "Royal Ploughing Ceremony",
      type: "public",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1796\u17B7\u179F\u17B6\u1781" && lunarDate.moonStatus === "\u179A\u17C4\u1785" && lunarDate.moonDay === 4
    },
    {
      nameKm: "\u1797\u17D2\u1787\u17BB\u17C6\u1794\u17B7\u178E\u17D2\u178C",
      nameEn: "Pchum Ben",
      type: "religious",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1797\u1791\u17D2\u179A\u1794\u1791" && lunarDate.moonStatus === "\u179A\u17C4\u1785" && lunarDate.moonDay === 15
    },
    {
      nameKm: "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799\u1797\u17D2\u1787\u17BB\u17C6\u1794\u17B7\u178E\u17D2\u178C",
      nameEn: "Pchum Ben Festival",
      type: "public",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1797\u1791\u17D2\u179A\u1794\u1791" && lunarDate.moonStatus === "\u179A\u17C4\u1785" && [14, 15].includes(lunarDate.moonDay) || lunarDate.khmerMonth === "\u17A2\u179F\u17D2\u179F\u17BB\u1787" && lunarDate.moonStatus === "\u1780\u17BE\u178F" && lunarDate.moonDay === 1
    },
    {
      nameKm: "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799\u17A2\u17BB\u17C6\u1791\u17BC\u1780",
      nameEn: "Water Festival",
      type: "traditional",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1780\u178F\u17D2\u178F\u17B7\u1780" && lunarDate.moonStatus === "\u1780\u17BE\u178F" && [14, 15].includes(lunarDate.moonDay)
    },
    {
      nameKm: "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799\u17A2\u17BB\u17C6\u1791\u17BC\u1780",
      nameEn: "Water Festival",
      type: "public",
      matches: (lunarDate) => lunarDate.khmerMonth === "\u1780\u178F\u17D2\u178F\u17B7\u1780" && (lunarDate.moonStatus === "\u1780\u17BE\u178F" && [14, 15].includes(lunarDate.moonDay) || lunarDate.moonStatus === "\u179A\u17C4\u1785" && lunarDate.moonDay === 1)
    }
  ];
  function mod(value, divisor) {
    return (value % divisor + divisor) % divisor;
  }
  function cloneDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  function addDays(date, days) {
    const result = cloneDate(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  function isSameOrAfterDate(date, boundary) {
    return cloneDate(date).getTime() >= cloneDate(boundary).getTime();
  }
  function findGregorianDateForKhmerCivilDate(year, boundaryDate) {
    const cursor = new Date(year, SONGKRAN_SEARCH_START_MONTH, SONGKRAN_SEARCH_START_DAY);
    const end = new Date(year, SONGKRAN_SEARCH_END_MONTH, SONGKRAN_SEARCH_END_DAY);
    while (cursor <= end) {
      const normalized = cloneDate(cursor);
      const khmerCivilDate = getKhmerCivilDate(normalized);
      if (khmerCivilDate.khmerMonth === boundaryDate.khmerMonth && khmerCivilDate.monthDay === boundaryDate.monthDay) {
        return normalized;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    throw new Error(`Unable to locate Khmer boundary date for Gregorian year ${year}.`);
  }
  function reduceRasey(rasey, angsa, liba) {
    let nextRasey = rasey;
    let nextAngsa = angsa;
    let nextLiba = liba;
    while (nextLiba >= 60) {
      nextLiba -= 60;
      nextAngsa += 1;
    }
    while (nextLiba < 0) {
      nextLiba += 60;
      nextAngsa -= 1;
    }
    while (nextAngsa >= 30) {
      nextAngsa -= 30;
      nextRasey += 1;
    }
    while (nextAngsa < 0) {
      nextAngsa += 30;
      nextRasey -= 1;
    }
    nextRasey = mod(nextRasey, 12);
    return [nextRasey, nextAngsa, nextLiba];
  }
  function addRasey(a, b) {
    return reduceRasey(a[0] + b[0], a[1] + b[1], a[2] + b[2]);
  }
  function subtractRasey(minuend, subtrahend) {
    return reduceRasey(
      minuend[0] - subtrahend[0],
      minuend[1] - subtrahend[1],
      minuend[2] - subtrahend[2]
    );
  }
  function getKromtupol(jolakSakarajYear) {
    const total = jolakSakarajYear * 292207 + 373;
    return 800 - mod(total, 800);
  }
  function getMatyom(kromtupol, sotin) {
    const total = sotin * 800 + kromtupol;
    const rasey = Math.floor(total / 24350);
    const mod1 = total % 24350;
    const angsa = Math.floor(mod1 / 811);
    const mod2 = mod1 % 811;
    const liba = Math.floor(mod2 / 14) - 3;
    return [rasey, angsa, liba];
  }
  function getPhalLumet(matyom) {
    const raseyDiff = matyom[0] - 2;
    const angsaDiff = matyom[1] - 20;
    const ken = [raseyDiff, angsaDiff, matyom[2]];
    let phal;
    switch (raseyDiff) {
      case 0:
      case 1:
      case 2:
        phal = [raseyDiff, 0, 0];
        break;
      case 3:
      case 4:
      case 5:
        phal = subtractRasey([5, 29, 60], ken);
        break;
      case 6:
      case 7:
      case 8:
        phal = subtractRasey(ken, [6, 0, 0]);
        break;
      default:
        phal = subtractRasey([11, 29, 60], ken);
        break;
    }
    const kon = phal[0] * 2 + 1;
    const total = ((phal[1] - 15) * 60 + 30) * kon;
    const lup = Math.floor(total / 900);
    const withChaya = lup + 129;
    return [0, Math.floor(withChaya / 60), withChaya % 60];
  }
  function getSomphotSun(matyom, phalLumet) {
    return addRasey(matyom, phalLumet);
  }
  function hasDuplicateAngsa(values) {
    const counts = /* @__PURE__ */ new Map();
    for (const value of values) {
      counts.set(value[1], (counts.get(value[1]) ?? 0) + 1);
    }
    return Array.from(counts.values()).some((count) => count > 1);
  }
  function getSongkranVonobotDays(year) {
    const jolakSakarajYear = year - 638;
    const kromtupol = getKromtupol(jolakSakarajYear - 1);
    const somphotValues = [];
    for (let offset = 0; offset < 4; offset += 1) {
      const matyom = getMatyom(kromtupol, 363 + offset);
      const phalLumet = getPhalLumet(matyom);
      somphotValues.push(getSomphotSun(matyom, phalLumet));
    }
    return hasDuplicateAngsa(somphotValues) ? 2 : 1;
  }
  function getLeungsakLunarDate(year) {
    const bodithey = getBodithey(year);
    if (bodithey >= 6) {
      return {
        khmerMonth: "\u1785\u17C1\u178F\u17D2\u179A",
        monthDay: bodithey + (getBoditheyLeapType(year - 1) === 3 ? 1 : 0)
      };
    }
    return {
      khmerMonth: "\u1796\u17B7\u179F\u17B6\u1781",
      monthDay: bodithey + 1
    };
  }
  function getKhmerNewYearInfo(year) {
    const cached = khmerNewYearCache.get(year);
    if (cached) {
      return {
        gregorianStartDate: cloneDate(cached.gregorianStartDate),
        totalDays: cached.totalDays
      };
    }
    const vonobotDays = getSongkranVonobotDays(year);
    const leungsakGregorianDate = findGregorianDateForKhmerCivilDate(year, getLeungsakLunarDate(year));
    const info = {
      gregorianStartDate: addDays(leungsakGregorianDate, -(vonobotDays + 1)),
      totalDays: vonobotDays + 2
    };
    khmerNewYearCache.set(year, info);
    return {
      gregorianStartDate: cloneDate(info.gregorianStartDate),
      totalDays: info.totalDays
    };
  }
  function getKhmerReferenceYear(date) {
    const year = date.getFullYear();
    const { gregorianStartDate } = getKhmerNewYearInfo(year);
    return isSameOrAfterDate(date, gregorianStartDate) ? year : year - 1;
  }
  function getAnimalYearForReferenceYear(referenceYear) {
    return ANIMAL_YEARS[mod(referenceYear - 2020, ANIMAL_YEARS.length)];
  }
  function getSakForReferenceYear(referenceYear) {
    return SAKS[mod(referenceYear - 2019, SAKS.length)];
  }
  function isGregorianLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  function getGregorianYearDays(year) {
    return isGregorianLeapYear(year) ? 366 : 365;
  }
  function getBuddhistEraYearForCalculation(year) {
    return year + 544;
  }
  function getAharkun(year) {
    return Math.floor((getBuddhistEraYearForCalculation(year) * 292207 + 499) / 800) + 4;
  }
  function getAvoman(year) {
    return (11 * getAharkun(year) + 25) % 692;
  }
  function getBodithey(year) {
    const aharkun = getAharkun(year);
    return (Math.floor((11 * aharkun + 25) / 692) + aharkun + 29) % 30;
  }
  function isKhmerSolarLeapYear(year) {
    const aharkunMod = (getBuddhistEraYearForCalculation(year) * 292207 + 499) % 800;
    return 800 - aharkunMod <= 207;
  }
  function getBoditheyLeapType(year) {
    const avoman = getAvoman(year);
    const bodithey = getBodithey(year);
    let hasLeapMonth = bodithey >= 25 || bodithey <= 5;
    let hasLeapDay = false;
    if (isKhmerSolarLeapYear(year)) {
      hasLeapDay = avoman <= 126;
    } else if (avoman <= 137) {
      hasLeapDay = getAvoman(year + 1) !== 0;
    }
    if (bodithey === 25 && getBodithey(year + 1) === 5) {
      hasLeapMonth = false;
    }
    if (bodithey === 24 && getBodithey(year + 1) === 6) {
      hasLeapMonth = true;
    }
    if (hasLeapMonth && hasLeapDay) {
      return 3;
    }
    if (hasLeapMonth) {
      return 1;
    }
    return hasLeapDay ? 2 : 0;
  }
  function getKhmerYearType(year) {
    const boditheyLeapType = getBoditheyLeapType(year);
    if (boditheyLeapType === 3 || boditheyLeapType === 1) {
      return "leap-month";
    }
    if (boditheyLeapType === 2 || getBoditheyLeapType(year - 1) === 3) {
      return "leap-day";
    }
    return "normal";
  }
  function getKhmerYearDays(year) {
    const yearType = getKhmerYearType(year);
    if (yearType === "leap-month") {
      return LEAP_MONTH_KHMER_YEAR_DAYS;
    }
    return yearType === "leap-day" ? LEAP_DAY_KHMER_YEAR_DAYS : NORMAL_KHMER_YEAR_DAYS;
  }
  function getMonthCount(year) {
    return getKhmerYearType(year) === "leap-month" ? LEAP_MONTHS_BY_NUMBER.length : NORMAL_MONTHS_BY_NUMBER.length;
  }
  function normalizeKhmerMonthNumber(month, year) {
    const monthCount = getMonthCount(year);
    return mod(month - 1, monthCount) + 1;
  }
  function getKhmerMonthName(month, year) {
    const normalizedMonth = normalizeKhmerMonthNumber(month, year);
    const months = getKhmerYearType(year) === "leap-month" ? LEAP_MONTHS_BY_NUMBER : NORMAL_MONTHS_BY_NUMBER;
    return months[normalizedMonth - 1];
  }
  function getKhmerMonthLength(month, year) {
    const normalizedMonth = normalizeKhmerMonthNumber(month, year);
    const yearType = getKhmerYearType(year);
    if (yearType === "leap-month") {
      if (normalizedMonth === 8 || normalizedMonth === 9) {
        return MONTH_LENGTH_LONG;
      }
      const normalMonthNumber = normalizedMonth > 9 ? normalizedMonth - 1 : normalizedMonth;
      return normalMonthNumber % 2 === 0 ? MONTH_LENGTH_LONG : MONTH_LENGTH_SHORT;
    }
    if (normalizedMonth === 7) {
      return yearType === "leap-day" ? MONTH_LENGTH_LONG : MONTH_LENGTH_SHORT;
    }
    return normalizedMonth % 2 === 0 ? MONTH_LENGTH_LONG : MONTH_LENGTH_SHORT;
  }
  function getDaysSinceStartOfYear(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.round((date.getTime() - startOfYear.getTime()) / 864e5);
  }
  function advanceKhmerCivilDate(month, day, year, days) {
    let currentMonth = month;
    let currentDay = day;
    for (let i = 0; i < days; i += 1) {
      currentDay += 1;
      if (currentDay > getKhmerMonthLength(currentMonth, year)) {
        currentDay = 1;
        currentMonth = normalizeKhmerMonthNumber(currentMonth + 1, year);
      }
    }
    return { month: currentMonth, day: currentDay };
  }
  function getKhmerCivilDateAtGregorianYearStart(year) {
    let month = KHMER_EPOCH_MONTH;
    let day = KHMER_EPOCH_DAY;
    for (let currentYear = KHMER_EPOCH_YEAR; currentYear < year; currentYear += 1) {
      day += getGregorianYearDays(currentYear) - getKhmerYearDays(currentYear);
      while (day > getKhmerMonthLength(month, currentYear)) {
        day -= getKhmerMonthLength(month, currentYear);
        month = normalizeKhmerMonthNumber(month + 1, currentYear);
      }
      while (day <= 0) {
        month = normalizeKhmerMonthNumber(month - 1, currentYear);
        day += getKhmerMonthLength(month, currentYear);
      }
    }
    return { month, day };
  }
  function getKhmerCivilDate(date) {
    const year = date.getFullYear();
    const yearStart = getKhmerCivilDateAtGregorianYearStart(year);
    const civilDate = advanceKhmerCivilDate(
      yearStart.month,
      yearStart.day,
      year,
      getDaysSinceStartOfYear(date)
    );
    const monthLength = getKhmerMonthLength(civilDate.month, year);
    return {
      khmerMonth: getKhmerMonthName(civilDate.month, year),
      monthDay: civilDate.day,
      monthLength,
      yearType: getKhmerYearType(year)
    };
  }
  function getBuddhistEraBoundary(year) {
    const cached = buddhistEraBoundaryCache.get(year);
    if (cached) {
      return cloneDate(cached);
    }
    const boundary = findGregorianDateForKhmerCivilDate(year, {
      khmerMonth: "\u1796\u17B7\u179F\u17B6\u1781",
      monthDay: 16
    });
    buddhistEraBoundaryCache.set(year, boundary);
    return cloneDate(boundary);
  }
  function getMoonPhase(monthDay) {
    const isWaxing = monthDay <= 15;
    return {
      moonStatus: isWaxing ? MOON_STATUS_KM.waxing : MOON_STATUS_KM.waning,
      moonDay: isWaxing ? monthDay : monthDay - 15
    };
  }
  function isLeapAsadhaMonth(khmerMonth) {
    return khmerMonth === "\u1794\u178B\u1798\u17B6\u179F\u17B6\u178D" || khmerMonth === "\u1791\u17BB\u178F\u17B7\u1799\u17B6\u179F\u17B6\u178D";
  }
  function isBuddhistHolyDay(monthDay, monthLength) {
    return monthDay === 8 || monthDay === 15 || monthDay === 23 || monthDay === monthLength;
  }
  function getObservanceText(monthDay, moonStatus, isSilDay2) {
    if (monthDay === 15 && moonStatus === MOON_STATUS_KM.waxing) {
      return "\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7 \u1787\u17B6\u1790\u17D2\u1784\u17C3\u179F\u17B8\u179B \u1793\u17B7\u1784\u1796\u17C1\u1789\u1794\u17BC\u178E\u17CC\u1798\u17B8";
    }
    if (isSilDay2) {
      return "\u1790\u17D2\u1784\u17C3\u1793\u17C1\u17C7 \u1787\u17B6\u1790\u17D2\u1784\u17C3\u179F\u17B8\u179B";
    }
    return void 0;
  }
  function buildKhmerLunarDateText(dayOfWeek, moonDay, moonStatus, khmerMonth, animalYear, sak, buddhistEraYear) {
    return `\u1790\u17D2\u1784\u17C3${dayOfWeek} ${toKhmerNumber(moonDay)}${moonStatus} \u1781\u17C2${khmerMonth} \u1786\u17D2\u1793\u17B6\u17C6${animalYear} ${sak} \u1796\u17BB\u1791\u17D2\u1792\u179F\u1780\u179A\u17B6\u1787 ${toKhmerNumber(buddhistEraYear)}`;
  }
  function buildKhmerGregorianDateText(date) {
    const dayText = buildKhmerGregorianDayValue(date);
    const monthText = buildKhmerGregorianMonthValue(date);
    const yearText = buildKhmerGregorianYearValue(date);
    return `\u1790\u17D2\u1784\u17C3\u1791\u17B8${dayText} \u1781\u17C2${monthText} \u1786\u17D2\u1793\u17B6\u17C6${yearText}`;
  }
  function buildKhmerGregorianDayValue(date) {
    return toKhmerNumber(date.getDate());
  }
  function buildKhmerGregorianMonthValue(date) {
    return GREGORIAN_MONTHS_KM[date.getMonth()];
  }
  function buildKhmerGregorianYearValue(date) {
    return toKhmerNumber(date.getFullYear());
  }
  function buildKhmerFullText(lunarDateText, gregorianDateText, observanceText) {
    const baseText = `${lunarDateText} \u178F\u17D2\u179A\u17BC\u179C\u1793\u17B9\u1784${gregorianDateText}`;
    return observanceText ? `${baseText} ${observanceText}` : baseText;
  }
  function convertCore(date) {
    const referenceYear = getKhmerReferenceYear(date);
    const khmerCivilDate = getKhmerCivilDate(date);
    const { moonStatus, moonDay } = getMoonPhase(khmerCivilDate.monthDay);
    const buddhistEraYear = isSameOrAfterDate(date, getBuddhistEraBoundary(date.getFullYear())) ? date.getFullYear() + 544 : date.getFullYear() + 543;
    const khmerYear = buddhistEraYear;
    const animalYear = getAnimalYearForReferenceYear(referenceYear);
    const sak = getSakForReferenceYear(referenceYear);
    const dayOfWeek = DAYS_OF_WEEK_KM[date.getDay()];
    const isSilDay2 = isBuddhistHolyDay(khmerCivilDate.monthDay, khmerCivilDate.monthLength);
    const observanceText = getObservanceText(khmerCivilDate.monthDay, moonStatus, isSilDay2);
    const buddhistEraYearKhmer = toKhmerNumber(buddhistEraYear);
    const khmerYearKhmer = toKhmerNumber(khmerYear);
    const moonDayKhmer = toKhmerNumber(moonDay);
    const lunarDateText = buildKhmerLunarDateText(
      dayOfWeek,
      moonDay,
      moonStatus,
      khmerCivilDate.khmerMonth,
      animalYear,
      sak,
      buddhistEraYear
    );
    const gregorianDateText = buildKhmerGregorianDateText(date);
    const gregorianDayText = buildKhmerGregorianDayValue(date);
    const gregorianMonthText = buildKhmerGregorianMonthValue(date);
    const gregorianYearText = buildKhmerGregorianYearValue(date);
    return {
      gregorianDate: formatISODate(date),
      dayOfWeek,
      buddhistEraYear,
      buddhistEraYearKhmer,
      khmerYear,
      khmerYearKhmer,
      khmerMonth: khmerCivilDate.khmerMonth,
      moonStatus,
      moonDay,
      moonDayKhmer,
      animalYear,
      sak,
      isLeapMonth: isLeapAsadhaMonth(khmerCivilDate.khmerMonth),
      isSilDay: isSilDay2,
      lunarDateText,
      gregorianDateText,
      gregorianDayText,
      gregorianMonthText,
      gregorianYearText,
      observanceText,
      fullText: buildKhmerFullText(lunarDateText, gregorianDateText, observanceText)
    };
  }
  function createHoliday(date, nameKm, nameEn, type) {
    return { date, nameKm, nameEn, type };
  }
  function cloneHoliday(holiday) {
    return { ...holiday };
  }
  function addHoliday(accumulator, holiday) {
    const existingIndex = accumulator.findIndex(
      (item) => item.date === holiday.date && (item.nameEn === holiday.nameEn || item.nameKm === holiday.nameKm)
    );
    if (existingIndex === -1) {
      accumulator.push(holiday);
      return;
    }
    if (accumulator[existingIndex].type !== "public" && holiday.type === "public") {
      accumulator[existingIndex] = holiday;
    }
  }
  function addDynamicLunarHolidaysForDate(accumulator, lunarDate, gregorianDate) {
    for (const rule of DYNAMIC_LUNAR_HOLIDAY_RULES) {
      if (rule.matches(lunarDate)) {
        addHoliday(
          accumulator,
          createHoliday(gregorianDate, rule.nameKm, rule.nameEn, rule.type)
        );
      }
    }
  }
  function getFixedPublicHolidays(year) {
    return [
      createHoliday(`${year}-01-01`, "\u1794\u17BB\u178E\u17D2\u1799\u1785\u17BC\u179B\u1786\u17D2\u1793\u17B6\u17C6\u179F\u1780\u179B", "International New Year's Day", "public"),
      createHoliday(
        `${year}-01-07`,
        "\u1791\u17B7\u179C\u17B6\u1787\u17D0\u1799\u1787\u1798\u17D2\u1793\u17C7\u179B\u17BE\u179A\u1794\u1794\u1794\u17D2\u179A\u179B\u17D0\u1799\u1796\u17BC\u1787\u179F\u17B6\u179F\u1793\u17CD",
        "Victory over Genocide Day",
        "public"
      ),
      createHoliday(`${year}-03-08`, "\u1791\u17B7\u179C\u17B6\u1793\u17B6\u179A\u17B8\u17A2\u1793\u17D2\u178F\u179A\u1787\u17B6\u178F\u17B7", "International Women's Day", "public"),
      ...getKhmerNewYearHolidays(year),
      createHoliday(`${year}-05-01`, "\u1791\u17B7\u179C\u17B6\u1796\u179B\u1780\u1798\u17D2\u1798\u17A2\u1793\u17D2\u178F\u179A\u1787\u17B6\u178F\u17B7", "International Labour Day", "public"),
      createHoliday(
        `${year}-05-14`,
        "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1785\u1798\u17D2\u179A\u17BE\u1793\u1796\u17D2\u179A\u17C7\u1787\u1793\u17D2\u1798 \u1796\u17D2\u179A\u17C7\u1798\u17A0\u17B6\u1780\u17D2\u179F\u178F\u17D2\u179A",
        "King's Birthday",
        "public"
      ),
      createHoliday(
        `${year}-06-18`,
        "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1785\u1798\u17D2\u179A\u17BE\u1793\u1796\u17D2\u179A\u17C7\u1787\u1793\u17D2\u1798 \u1796\u17D2\u179A\u17C7\u1798\u17A0\u17B6\u1780\u17D2\u179F\u178F\u17D2\u179A\u17B8",
        "Queen Mother's Birthday",
        "public"
      ),
      createHoliday(`${year}-09-24`, "\u1791\u17B7\u179C\u17B6\u179A\u178A\u17D2\u178B\u1792\u1798\u17D2\u1798\u1793\u17BB\u1789\u17D2\u1789", "Constitution Day", "public"),
      createHoliday(
        `${year}-10-15`,
        "\u1791\u17B7\u179C\u17B6\u1782\u17C4\u179A\u1796\u1796\u17D2\u179A\u17C7\u179C\u17B7\u1789\u17D2\u1789\u17B6\u178E\u1780\u17D2\u1781\u1793\u17D2\u1792 \u1796\u17D2\u179A\u17C7\u1794\u179A\u1798\u179A\u178F\u1793\u1780\u17C4\u178A\u17D2\u178B",
        "Commemoration Day of King's Father",
        "public"
      ),
      createHoliday(`${year}-10-29`, "\u1796\u17D2\u179A\u17C7\u179A\u17B6\u1787\u1796\u17B7\u1792\u17B8\u1782\u17D2\u179A\u1784\u179A\u17B6\u1787\u17D2\u1799", "Coronation Day", "public"),
      createHoliday(`${year}-11-09`, "\u1794\u17BB\u178E\u17D2\u1799\u17AF\u1780\u179A\u17B6\u1787\u17D2\u1799\u1787\u17B6\u178F\u17B7", "Independence Day", "public"),
      createHoliday(`${year}-12-29`, "\u1791\u17B7\u179C\u17B6\u179F\u1793\u17D2\u178F\u17B7\u1797\u17B6\u1796\u1793\u17C5\u1780\u1798\u17D2\u1796\u17BB\u1787\u17B6", "Peace Day in Cambodia", "public")
    ];
  }
  function addDynamicLunarHolidays(year, holidays) {
    const cursor = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    while (cursor <= end) {
      const normalized = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      const lunarDate = convertCore(normalized);
      const gregorianDate = formatISODate(normalized);
      addDynamicLunarHolidaysForDate(holidays, lunarDate, gregorianDate);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  function cloneHolidays(holidays) {
    return holidays.map(cloneHoliday);
  }
  function getKhmerNewYearHolidays(year) {
    const { gregorianStartDate, totalDays } = getKhmerNewYearInfo(year);
    return Array.from(
      { length: totalDays },
      (_, index) => createHoliday(
        formatISODate(addDays(gregorianStartDate, index)),
        "\u1794\u17BB\u178E\u17D2\u1799\u1785\u17BC\u179B\u1786\u17D2\u1793\u17B6\u17C6\u1781\u17D2\u1798\u17C2\u179A",
        "Khmer New Year",
        "public"
      )
    );
  }
  function buildHolidaysForYear(year) {
    const holidays = getFixedPublicHolidays(year);
    addDynamicLunarHolidays(year, holidays);
    return holidays.sort((a, b) => a.date.localeCompare(b.date));
  }
  function toKhmerLunarDate(inputDate) {
    const date = normalizeDate(inputDate);
    const lunar = convertCore(date);
    const holidays = getKhmerHolidays(date.getFullYear()).filter(
      (holiday) => holiday.date === lunar.gregorianDate
    );
    return {
      ...lunar,
      holidays
    };
  }
  function getKhmerMonth(inputDate) {
    return toKhmerLunarDate(inputDate).khmerMonth;
  }
  function getKhmerYear(inputDate) {
    return toKhmerLunarDate(inputDate).khmerYear;
  }
  function getAnimalYear(inputDate) {
    return toKhmerLunarDate(inputDate).animalYear;
  }
  function getSak(inputDate) {
    return toKhmerLunarDate(inputDate).sak;
  }
  function isSilDay(inputDate) {
    return toKhmerLunarDate(inputDate).isSilDay;
  }
  function getKhmerHolidays(year) {
    if (!Number.isInteger(year)) {
      throw new Error("Invalid year provided.");
    }
    if (year < MIN_SUPPORTED_GREGORIAN_YEAR) {
      throw new Error(`Year must be ${MIN_SUPPORTED_GREGORIAN_YEAR} or later.`);
    }
    const cached = holidayCache.get(year);
    if (cached) {
      return cloneHolidays(cached);
    }
    const computed = buildHolidaysForYear(year);
    holidayCache.set(year, computed);
    return cloneHolidays(computed);
  }
  function maybeKhmerNumber(value, enabled) {
    return enabled ? toKhmerNumber(value) : String(value);
  }
  function getKhmerGregorianDateText(inputDate, useKhmerNumbers) {
    const date = normalizeDate(inputDate);
    const day = maybeKhmerNumber(date.getDate(), useKhmerNumbers);
    const month = GREGORIAN_MONTHS_KM[date.getMonth()];
    const year = maybeKhmerNumber(date.getFullYear(), useKhmerNumbers);
    return `\u1790\u17D2\u1784\u17C3\u1791\u17B8${day} \u1781\u17C2${month} \u1786\u17D2\u1793\u17B6\u17C6${year}`;
  }
  function formatKhmerLunarText(khmerDate, format, useKhmerNumbers) {
    const moonDay = maybeKhmerNumber(khmerDate.moonDay, useKhmerNumbers);
    const buddhistEraYear = maybeKhmerNumber(khmerDate.buddhistEraYear, useKhmerNumbers);
    switch (format) {
      case "short":
        return `${moonDay}${khmerDate.moonStatus} ${khmerDate.khmerMonth} ${buddhistEraYear}`;
      case "medium":
        return `${moonDay}${khmerDate.moonStatus} \u1781\u17C2${khmerDate.khmerMonth} \u1796.\u179F. ${buddhistEraYear}`;
      case "long":
        return `${moonDay}${khmerDate.moonStatus} \u1781\u17C2${khmerDate.khmerMonth} \u1786\u17D2\u1793\u17B6\u17C6${khmerDate.animalYear} ${khmerDate.sak} \u1796.\u179F. ${buddhistEraYear}`;
      case "full":
        return `\u1790\u17D2\u1784\u17C3${khmerDate.dayOfWeek} ${moonDay}${khmerDate.moonStatus} \u1781\u17C2${khmerDate.khmerMonth} \u1786\u17D2\u1793\u17B6\u17C6${khmerDate.animalYear} ${khmerDate.sak} \u1796\u17BB\u1791\u17D2\u1792\u179F\u1780\u179A\u17B6\u1787 ${buddhistEraYear}`;
    }
  }
  function formatEnglishLunarText(khmerDate, format) {
    const monthEn = KHMER_MONTHS_EN_BY_KM[khmerDate.khmerMonth];
    const animalEn = ANIMAL_YEARS_EN_BY_KM[khmerDate.animalYear];
    const sakEn = SAKS_EN_BY_KM[khmerDate.sak];
    const dayNameEn = DAYS_OF_WEEK_EN_BY_KM[khmerDate.dayOfWeek];
    const moonStatusEn = MOON_STATUS_EN[khmerDate.moonStatus === "\u1780\u17BE\u178F" ? "waxing" : "waning"];
    switch (format) {
      case "short":
        return `${khmerDate.moonDay} ${moonStatusEn}, ${monthEn}, BE ${khmerDate.buddhistEraYear}`;
      case "medium":
        return `${khmerDate.moonDay} ${moonStatusEn} of ${monthEn}, BE ${khmerDate.buddhistEraYear}`;
      case "long":
        return `${khmerDate.moonDay} ${moonStatusEn} of ${monthEn}, Year of the ${animalEn}, ${sakEn}, BE ${khmerDate.buddhistEraYear}`;
      case "full":
        return `${dayNameEn}, ${khmerDate.moonDay} ${moonStatusEn} of ${monthEn}, Year of the ${animalEn}, ${sakEn}, BE ${khmerDate.buddhistEraYear}`;
    }
  }
  function formatKhmerDate(inputDate, options = {}) {
    const {
      locale = "km",
      format = "full",
      useKhmerNumbers = locale === "km",
      includeGregorianDate = false,
      includeHoliday = false
    } = options;
    const khmerDate = toKhmerLunarDate(inputDate);
    let result = locale === "en" ? formatEnglishLunarText(khmerDate, format) : formatKhmerLunarText(khmerDate, format, useKhmerNumbers);
    if (includeGregorianDate) {
      result += locale === "en" ? ` (${khmerDate.gregorianDate})` : ` \u178F\u17D2\u179A\u17BC\u179C\u1793\u17B9\u1784${getKhmerGregorianDateText(inputDate, useKhmerNumbers)}`;
    }
    if (includeHoliday && khmerDate.holidays.length > 0) {
      const holidayNames = khmerDate.holidays.map((holiday) => locale === "en" ? holiday.nameEn ?? holiday.nameKm : holiday.nameKm).join(", ");
      result += ` [${holidayNames}]`;
    }
    return result;
  }
  return __toCommonJS(index_exports);
})();
