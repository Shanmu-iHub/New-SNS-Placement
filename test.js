const fs = require('fs');

const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

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

const formatStandardDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    let s = dateStr.trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^(upcoming|scheduled|tbd|tba|completed|ongoing|in progress)$/i.test(s)) return s;

    // Clean ordinal suffixes: 1st, 2nd, 3rd, 4th, 08th, 18th, etc.
    const cleaned = s.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');

    // Case 1: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    let m = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (m) {
        const y = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10);
        const d = parseInt(m[3], 10);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return d + ' ' + MONTH_NAMES[mon] + ' ' + y;
        }
    }

    // Case 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (or with 2-digit year DD/MM/YY)
    m = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mon = parseInt(m[2], 10);
        const y = normalizeYear(m[3]);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return d + ' ' + MONTH_NAMES[mon] + ' ' + y;
        }
    }

    // Case 3: D Month YYYY (e.g., "17 Aug 2026", "6-Apr-2026", "23 July 2026", "16 Apr 2025")
    m = cleaned.match(/^(\d{1,2})[\s\-/,]+([A-Za-z]+)[\s\-/,]+(\d{2,4})$/);
    if (m) {
        const d = parseInt(m[1], 10);
        const mon = getMonthNum(m[2]);
        const y = normalizeYear(m[3]);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return d + ' ' + MONTH_NAMES[mon] + ' ' + y;
        }
    }

    // Case 4: Month D, YYYY or Month D YYYY (e.g. "Apr 1, 2026", "April 1, 2026", "August 17 2026")
    m = cleaned.match(/^([A-Za-z]+)[\s\-/,]+(\d{1,2})[\s\-,]+(\d{2,4})$/);
    if (m) {
        const mon = getMonthNum(m[1]);
        const d = parseInt(m[2], 10);
        const y = normalizeYear(m[3]);
        if (mon >= 1 && mon <= 12 && d >= 1 && d <= 31 && y > 1900) {
            return d + ' ' + MONTH_NAMES[mon] + ' ' + y;
        }
    }

    // Case 5: Month YYYY (e.g. "Apr 2025", "June 2026")
    m = cleaned.match(/^([A-Za-z]+)[\s\-/,]+(\d{2,4})$/);
    if (m) {
        const mon = getMonthNum(m[1]);
        const y = normalizeYear(m[2]);
        if (mon >= 1 && mon <= 12 && y > 1900) {
            return MONTH_NAMES[mon] + ' ' + y;
        }
    }

    return '';
};

const testCases = [
    ['01/04/2026', '1 April 2026'],
    ['01-04-2026', '1 April 2026'],
    ['2026-04-01', '1 April 2026'],
    ['1/4/2026', '1 April 2026'],
    ['01/04/26', '1 April 2026'],
    ['Apr 1, 2026', '1 April 2026'],
    ['1 Apr 2026', '1 April 2026'],
    ['1st April 2026', '1 April 2026'],
    ['April 1, 2026', '1 April 2026'],
    ['6-Apr-2026', '6 April 2026'],
    ['17 Aug 2026', '17 August 2026'],
    ['18th July 2026', '18 July 2026'],
    ['23rd July 2026', '23 July 2026'],
    ['08th July 2026', '8 July 2026'],
    ['10.06.2026', '10 June 2026'],
    ['15.06.2026', '15 June 2026'],
    ['9.7.2026', '9 July 2026'],
    ['26-Jun-2026', '26 June 2026'],
    ['17th June 2026', '17 June 2026'],
    ['30th June 2026', '30 June 2026'],
    ['9-Mar-2026', '9 March 2026'],
    ['June 2026', 'June 2026']
];

let allPassed = true;

testCases.forEach(([input, expected]) => {
    const result = formatStandardDate(input);
    if (result !== expected) {
        console.error('FAIL:', input, '=> got:', JSON.stringify(result), 'expected:', JSON.stringify(expected));
        allPassed = false;
    } else {
        console.log('PASS:', input, '=>', result);
    }
});
const formatMonthYearDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    let s = dateStr.trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^(upcoming|scheduled|tbd|tba|completed|ongoing|in progress)$/i.test(s)) return s;

    const std = formatStandardDate(s);
    const target = std || s;
    const m = target.match(/([A-Za-z]+)\s*(\d{4})/);
    if (m) {
        return `${m[1]} ${m[2]}`;
    }
    return target;
};

const monthYearTestCases = [
    ['1st December 2025', 'December 2025'],
    ['8th August 2025', 'August 2025'],
    ['26th July 2025', 'July 2025'],
    ['25th February 2026', 'February 2026'],
    ['2nd October 2026', 'October 2026'],
    ['13th September 2025', 'September 2025'],
    ['01/04/2026', 'April 2026']
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

const casingTestCases = [
    ['software development engineer (sde)', 'Software Development Engineer (SDE)'],
    ['SOFTWARE DEVELOPMENT ENGINEER (sde)', 'Software Development Engineer (SDE)'],
    ['analysist', 'Analysist'],
    ['business development executive / lead generation executive (revops)', 'Business Development Executive / Lead Generation Executive (REVOPS)'],
    ['ALFRAH COGNIX INNOVATION PVT. LTD.', 'Alfrah Cognix Innovation Pvt. Ltd.'],
    ['HI MANDO ANAND INDIA PRIVATE LIMITED', 'Hi Mando Anand India Private Limited'],
    ['B.E -Civil, Mechanical, Electrical-70% & Above - Nsa', 'B.E -Civil, Mechanical, Electrical-70% & Above - NSA'],
    ['Be/Btech-60 % & Above - Nsa', 'BE/BTech-60 % & Above - NSA'],
    ['Be /Btech - Cse/It/Cst/Csd/Aids/Aiml/Ece- 60% & Above - Nsa', 'BE /BTech - CSE/IT/CST/CSD/AIDS/AIML/ECE- 60% & Above - NSA'],
    ['Be Mechatronics, Mech, Eee,Ece & Auto Students', 'BE Mechatronics, Mech, EEE,ECE & Auto Students'],
    ['Mba Graduates', 'MBA Graduates'],
    ['Mca & Msc Cs', 'MCA & MSc CS'],
    ['Ug Commerce & Management', 'UG Commerce & Management'],
    ['corizo', 'Corizo'],
    ['crecsent Infotech', 'Crecsent Infotech'],
    ['Empty brain Creation', 'Empty Brain Creation'],
    ['Infotact solutions', 'Infotact Solutions'],
    ['lecturer - cppct', 'Lecturer - CPPCT'],
    ['lecturer-ct', 'Lecturer-CT'],
    ['tmt technologist', 'TMT Technologist']
];

casingTestCases.forEach(([input, expected]) => {
    const result = formatTitleCaseWithBrackets(input);
    if (result !== expected) {
        console.error('FAIL Casing:', input, '=> got:', JSON.stringify(result), 'expected:', JSON.stringify(expected));
        allPassed = false;
    } else {
        console.log('PASS Casing:', input, '=>', result);
    }
});

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

const studentNameTestCases = [
    ['AKELAN SS', 'Akelan SS'],
    ['akelan ss', 'Akelan SS'],
    ['DELINA SHALY A', 'Delina Shaly A'],
    ['jeisy afrina ds', 'Jeisy Afrina DS'],
    ['hilal ahammed', 'Hilal Ahammed'],
    ['syed adhil mohammed', 'Syed Adhil Mohammed'],
    ['riswana nasrin', 'Riswana Nasrin']
];

studentNameTestCases.forEach(([input, expected]) => {
    const result = formatStudentName(input);
    if (result !== expected) {
        console.error('FAIL StudentName:', input, '=> got:', JSON.stringify(result), 'expected:', JSON.stringify(expected));
        allPassed = false;
    } else {
        console.log('PASS StudentName:', input, '=>', result);
    }
});

if (!allPassed) {
    console.error('Test suite failed');
    process.exit(1);
}

const content = fs.readFileSync('index.html', 'utf8');
const scriptMatch = content.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    console.error('Script block missing');
    process.exit(1);
}
console.log('HTML valid, script size:', scriptMatch[1].length);
console.log('ALL TESTS AND HTML VALIDATION PASSED!');
