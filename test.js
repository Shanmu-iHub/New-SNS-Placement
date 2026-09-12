const fs = require('fs');

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ordinal = (n) => {
    const abs = Math.abs(n);
    const mod100 = abs % 100;
    const mod10 = abs % 10;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    if (mod10 === 1) return `${n}st`;
    if (mod10 === 2) return `${n}nd`;
    if (mod10 === 3) return `${n}rd`;
    return `${n}th`;
};

const getMonthNum = (mStr) => {
    if (!mStr) return 0;
    const clean = mStr.toLowerCase().trim();
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) return num;
    const prefix3 = clean.slice(0, 3);
    const map = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };
    return map[prefix3] || 0;
};

const normalizeYear = (yStr) => {
    let y = parseInt(yStr, 10);
    if (isNaN(y)) return 0;
    if (y < 100) {
        y = y < 50 ? 2000 + y : 1900 + y;
    }
    return y;
};

const normalizeAY = (ayStr) => {
    if (!ayStr || typeof ayStr !== 'string') return '';
    let s = ayStr.trim().replace(/\s+/g, '');
    const m = s.match(/^(\d{4})-(\d{2,4})$/);
    if (m) {
        const startY = m[1];
        const endY = m[2].length === 4 ? m[2].slice(-2) : m[2];
        return `${startY}-${endY}`;
    }
    return s;
};

const formatStandardDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    let s = dateStr.trim();
    if (!s) return '';
    if (/^\d{4}\s*-\s*\d{2,4}$/.test(s)) return normalizeAY(s);
    if (/^(upcoming|scheduled|tbd|tba|completed|ongoing|in progress)$/i.test(s)) return s;

    // Clean ordinal suffixes: 1st, 2nd, 3rd, 4th, 08th, 18th, 23rd, etc.
    const cleaned = s.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');

    // Case 1: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD or YYYY MM DD
    let m = cleaned.match(/^(\d{4})[\s\-/.=,]+(\d{1,2})[\s\-/.=,]+(\d{1,2})$/);
    if (m) {
        const y = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10);
        const d = parseInt(m[3], 10);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return `${ordinal(d)} ${MONTH_NAMES[mon]} ${y}`;
        }
    }

    // Case 2: All numeric DD/MM/YYYY, MM/DD/YYYY, or D M YYYY (e.g., "9 18 2024", "9/18/2024", "18-09-2024", "01/04/26")
    m = cleaned.match(/^(\d{1,2})[\s\-/.=,]+(\d{1,2})[\s\-/.=,]+(\d{2,4})$/);
    if (m) {
        const p1 = parseInt(m[1], 10);
        const p2 = parseInt(m[2], 10);
        const y = normalizeYear(m[3]);
        let mon = 0, d = 0;

        if (p1 <= 12 && p2 > 12) {
            mon = p1;
            d = p2;
        } else if (p2 <= 12 && p1 > 12) {
            d = p1;
            mon = p2;
        } else if (p1 <= 12 && p2 <= 12) {
            d = p1;
            mon = p2;
        }

        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return `${ordinal(d)} ${MONTH_NAMES[mon]} ${y}`;
        }
    }

    // Case 3: D Month YYYY (e.g. "17 Aug 2026", "6-Apr-2026", "23 July 2026", "2-Oct-26", "17-Aug-25")
    m = cleaned.match(/^(\d{1,2})[\s\-_/,]+([A-Za-z]+)[\s\-_/,]+(\d{2,4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mon = getMonthNum(m[2]);
        const y = normalizeYear(m[3]);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return `${ordinal(d)} ${MONTH_NAMES[mon]} ${y}`;
        }
    }

    // Case 4: Month D, YYYY or Month D YYYY (e.g. "Apr 1, 2026", "April 1, 2026", "August 17 2026")
    m = cleaned.match(/^([A-Za-z]+)[\s\-_/,]+(\d{1,2})[\s\-_/,,]+(\d{2,4})$/);
    if (m) {
        const mon = getMonthNum(m[1]);
        const d = parseInt(m[2], 10);
        const y = normalizeYear(m[3]);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return `${ordinal(d)} ${MONTH_NAMES[mon]} ${y}`;
        }
    }

    // Case 5: Compact DMonthYYYY or D MonthYYYY (e.g. "23Apr2025", "12Dec2024", "13 Dec2024", "6Apr2025")
    m = cleaned.match(/^(\d{1,2})[\s]*([A-Za-z]+)[\s]*(\d{2,4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mon = getMonthNum(m[2]);
        const y = normalizeYear(m[3]);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return `${ordinal(d)} ${MONTH_NAMES[mon]} ${y}`;
        }
    }

    // Case 6: Month YYYY (e.g. "Apr 2025", "June 2026", "July 2026")
    m = cleaned.match(/^([A-Za-z]+)[\s\-_/,]+(\d{2,4})$/);
    if (m) {
        const mon = getMonthNum(m[1]);
        const y = normalizeYear(m[2]);
        if (mon >= 1 && mon <= 12 && y > 1900) {
            return `${MONTH_NAMES[mon]} ${y}`;
        }
    }

    // Case 7: Numeric Month Year (e.g. "9 2024", "09/2024", "9-2024")
    m = cleaned.match(/^(\d{1,2})[\s\-/.=,]+(\d{4})$/);
    if (m) {
        const mon = parseInt(m[1], 10);
        const y = parseInt(m[2], 10);
        if (mon >= 1 && mon <= 12 && y > 1900) {
            return `${MONTH_NAMES[mon]} ${y}`;
        }
    }

    return '';
};

const formatMonthYearDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    let s = dateStr.trim();
    if (!s) return '';
    if (/^\d{4}\s*-\s*\d{2,4}$/.test(s)) return normalizeAY(s);
    if (/^(upcoming|scheduled|tbd|tba|completed|ongoing|in progress)$/i.test(s)) return s;

    const std = formatStandardDate(s);
    const target = std || s;
    const m = target.match(/([A-Za-z]+)\s*(\d{4})/);
    if (m) {
        return `${m[1]} ${m[2]}`;
    }
    return target;
};

// Helper: derive academic year (June to May) from date string
const getAcademicYear = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    let s = dateStr.trim();
    if (!s) return null;

    // Direct academic year format like "2024-25" or "2026-27" or "2026 - 27"
    let ayMatch = s.match(/^(\d{4})\s*-\s*(\d{2,4})$/);
    if (ayMatch) {
        const startY = parseInt(ayMatch[1], 10);
        const endYStr = ayMatch[2].length === 4 ? ayMatch[2].slice(-2) : ayMatch[2];
        return `${startY}-${endYStr}`;
    }

    // Single 4-digit year like "2023", "2022" -> map to academic year
    if (/^\d{4}$/.test(s)) {
        const y = parseInt(s, 10);
        return `${y}-${(y + 1).toString().slice(-2)}`;
    }

    const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

    const cleaned = s.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');

    // Case 1: YYYY-MM-DD
    let m = cleaned.match(/^(\d{4})[\s\-/.=,]+(\d{1,2})[\s\-/.=,]+(\d{1,2})$/);
    if (m) {
        const y = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10) - 1;
        if (mon >= 0 && mon <= 11 && y > 1900) {
            return mon >= 5 ? `${y}-${(y + 1).toString().slice(-2)}` : `${y - 1}-${y.toString().slice(-2)}`;
        }
    }

    // Case 2: Numeric DD/MM/YYYY, MM/DD/YYYY, D/M/YY
    m = cleaned.match(/^(\d{1,2})[\s\-/.=,]+(\d{1,2})[\s\-/.=,]+(\d{2,4})$/);
    if (m) {
        const p1 = parseInt(m[1], 10);
        const p2 = parseInt(m[2], 10);
        const y = normalizeYear(m[3]);
        let mon = -1;
        if (p1 <= 12 && p2 > 12) mon = p1 - 1;
        else if (p2 <= 12 && p1 > 12) mon = p2 - 1;
        else if (p1 <= 12 && p2 <= 12) mon = p2 - 1;
        if (mon >= 0 && mon <= 11 && y > 1900) {
            return mon >= 5 ? `${y}-${(y + 1).toString().slice(-2)}` : `${y - 1}-${y.toString().slice(-2)}`;
        }
    }

    // Case 3: D Month YYYY, Month D YYYY, Month YYYY, DMonthYYYY
    // Match any date containing month name and year
    m = cleaned.match(/([A-Za-z]+)[\s\-_/.,]*(\d{2,4})/);
    if (m) {
        const mon = monthMap[m[1].toLowerCase().slice(0, 3)];
        const y = normalizeYear(m[2]);
        if (mon !== undefined && y > 1900) {
            return mon >= 5 ? `${y}-${(y + 1).toString().slice(-2)}` : `${y - 1}-${y.toString().slice(-2)}`;
        }
    }

    return null;
};

// Test suite
let allPassed = true;

const testCases = [
    ['01/04/2026', '1st April 2026'],
    ['01-04-2026', '1st April 2026'],
    ['2026-04-01', '1st April 2026'],
    ['1/4/2026', '1st April 2026'],
    ['01/04/26', '1st April 2026'],
    ['Apr 1, 2026', '1st April 2026'],
    ['1 Apr 2026', '1st April 2026'],
    ['1st April 2026', '1st April 2026'],
    ['April 1, 2026', '1st April 2026'],
    ['6-Apr-2026', '6th April 2026'],
    ['17 Aug 2026', '17th August 2026'],
    ['18th July 2026', '18th July 2026'],
    ['23rd July 2026', '23rd July 2026'],
    ['08th July 2026', '8th July 2026'],
    ['10.06.2026', '10th June 2026'],
    ['15.06.2026', '15th June 2026'],
    ['9.7.2026', '9th July 2026'],
    ['26-Jun-2026', '26th June 2026'],
    ['17th June 2026', '17th June 2026'],
    ['30th June 2026', '30th June 2026'],
    ['9-Mar-2026', '9th March 2026'],
    ['June 2026', 'June 2026'],
    ['23Apr2025', '23rd April 2025'],
    ['12Dec2024', '12th December 2024'],
    ['2-Oct-26', '2nd October 2026'],
    ['17-Aug-25', '17th August 2025']
];

testCases.forEach(([input, expected]) => {
    const result = formatStandardDate(input);
    if (result !== expected) {
        console.error('FAIL StandardDate:', input, '=> got:', JSON.stringify(result), 'expected:', JSON.stringify(expected));
        allPassed = false;
    } else {
        console.log('PASS StandardDate:', input, '=>', result);
    }
});

const monthYearTestCases = [
    ['1st December 2025', 'December 2025'],
    ['8th August 2025', 'August 2025'],
    ['26th July 2025', 'July 2025'],
    ['25th February 2026', 'February 2026'],
    ['2nd October 2026', 'October 2026'],
    ['13th September 2025', 'September 2025'],
    ['01/04/2026', 'April 2026'],
    ['23Apr2025', 'April 2025'],
    ['12Dec2024', 'December 2024']
];

monthYearTestCases.forEach(([input, expected]) => {
    const result = formatMonthYearDate(input);
    if (result !== expected) {
        console.error('FAIL MonthYear:', input, '=> got:', JSON.stringify(result), 'expected:', JSON.stringify(expected));
        allPassed = false;
    } else {
        console.log('PASS MonthYear:', input, '=>', result);
    }
});

// Academic Year Tests (June Year X to May Year X+1)
const ayTestCases = [
    ['June 2026', '2026-27'],
    ['10 June 2026', '2026-27'],
    ['18 July 2026', '2026-27'],
    ['5th September 2026', '2026-27'],
    ['2-Oct-26', '2026-27'],
    ['29 December 2026', '2026-27'],
    ['15 January 2027', '2026-27'],
    ['28 February 2027', '2026-27'],
    ['12 March 2027', '2026-27'],
    ['30 April 2027', '2026-27'],
    ['31 May 2027', '2026-27'],
    ['6-Apr-2026', '2025-26'],      // April 2026 belongs to 2025-26!
    ['17-Aug-25', '2025-26'],       // August 2025 belongs to 2025-26!
    ['23Apr2025', '2024-25'],       // April 2025 belongs to 2024-25!
    ['12Dec2024', '2024-25'],       // Dec 2024 belongs to 2024-25!
    ['2026 - 27', '2026-27'],
    ['2026-27', '2026-27'],
    ['2023', '2023-24']
];

ayTestCases.forEach(([input, expected]) => {
    const result = getAcademicYear(input);
    if (result !== expected) {
        console.error('FAIL AcademicYear:', input, '=> got:', JSON.stringify(result), 'expected:', JSON.stringify(expected));
        allPassed = false;
    } else {
        console.log('PASS AcademicYear:', input, '=>', result);
    }
});

const formatTitleCaseWithBrackets = (str) => {
    if (!str || typeof str !== 'string') return str || '';
    let trimmed = str.trim();
    if (!trimmed) return '';

    const ACRONYMS = {
        'be': 'BE', 'b.e': 'B.E', 'btech': 'BTech', 'b.tech': 'B.Tech',
        'me': 'ME', 'm.e': 'M.E', 'mtech': 'MTech', 'm.tech': 'M.Tech',
        'mba': 'MBA', 'mca': 'MCA', 'msc': 'MSc', 'm.sc': 'M.Sc',
        'bsc': 'BSc', 'b.sc': 'B.Sc', 'bba': 'BBA', 'bcom': 'BCom', 'b.com': 'B.Com', 'bca': 'BCA',
        'ug': 'UG', 'pg': 'PG', 'cse': 'CSE', 'it': 'IT', 'ece': 'ECE', 'eee': 'EEE',
        'cst': 'CST', 'csd': 'CSD', 'aids': 'AIDS', 'aiml': 'AIML', 'cs': 'CS', 'ds': 'DS',
        'ai': 'AI', 'ml': 'ML', 'mech': 'Mech', 'nsa': 'NSA', 'sde': 'SDE', 'hr': 'HR',
        'qa': 'QA', 'r&d': 'R&D', 'cgpa': 'CGPA', 'lpa': 'LPA', 'ctc': 'CTC',
        'pvt': 'Pvt', 'ltd': 'Ltd', 'llc': 'LLC', 'gd': 'GD', 'pi': 'PI',
        'adas': 'ADAS', 'get': 'GET', 'ase': 'ASE', 'ui': 'UI', 'ux': 'UX', 'seo': 'SEO',
        'cppct': 'CPPCT', 'ct': 'CT', 'tmt': 'TMT'
    };

    return trimmed.replace(/(\([^)]*\))|([^\(\)]+)/g, (match, brackets, text) => {
        if (brackets) {
            return brackets.toUpperCase();
        }
        if (text) {
            return text.replace(/\b[a-zA-Z.]+\b/g, (word) => {
                const lower = word.toLowerCase();
                if (ACRONYMS[lower]) {
                    return ACRONYMS[lower];
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            });
        }
        return match;
    });
};

const formatStudentName = (name) => {
    if (!name || typeof name !== 'string') return name || '';
    let trimmed = name.trim();
    if (!trimmed) return '';

    return trimmed.replace(/\b[a-zA-Z]+\b/g, (word) => {
        if (word.length <= 2) {
            return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
};

if (!allPassed) {
    console.error('Test suite failed!');
    process.exit(1);
} else {
    console.log('\nALL UNIT TESTS PASSED SUCCESSFULLY!');
}
