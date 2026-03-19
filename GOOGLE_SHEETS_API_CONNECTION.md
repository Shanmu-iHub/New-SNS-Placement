# Google Sheets API Connection Plan (v4)

This document outlines the implementation plan to connect the SNS Placement Portal to the official **Google Sheets API (v4)** without changing the application's existing data structure or components.

## 1. Prerequisites (Setup on Google Cloud Console)

1.  **Create a Project**: Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Enable API**: Search for "Google Sheets API" and click **Enable**.
3.  **Generate API Key**:
    *   Navigate to **APIs & Services > Credentials**.
    *   Click **Create Credentials > API Key**.
    *   *Note: Restrict the API key to "Google Sheets API" for better security.*
4.  **Spreadsheet Sharing**: Ensure your Google Sheet is shared as **"Anyone with the link can view"**.

---

## 2. Updated Configuration

Modify the existing `SHEET_CONFIG` top-level object to include your new API key. Do not remove the sheet names.

```javascript
/* index.html (~Line 43) */
const SHEET_CONFIG = {
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',
    apiKey: 'YOUR_GOOGLE_CLOUD_API_KEY_HERE', // Add this line
    cacheTime: 300000, // 5 mins suggested for API efficiency
    sheets: {
        colleges: 'College_Master',
        departments: 'Department_Mapping',
        // ... (remaining sheet names stay exactly the same)
    }
};
```

---

## 3. Implementation Plan (The Code Change)

Replace the current `fetchSheetData` function in `index.html` (~Line 89) with the following version designed for JSON API responses.

### Targeted Change:
```javascript
const fetchSheetData = async (sheetName) => {
    // 1. Check Cache (Keep existing logic)
    const cacheKey = `sns_sheet_api_${sheetName}`;
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < SHEET_CONFIG.cacheTime) return { data, fromCache: true };
        }
    } catch (e) { }

    // 2. Fetch via Official API v4 (JSON)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_CONFIG.spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${SHEET_CONFIG.apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google API Error: ${res.status}`);

    const json = await res.json();
    const rows = json.values; // API returns an array of arrays
    
    if (!rows || rows.length < 2) return { data: [], fromCache: false };

    // 3. Convert to Objects (Keeps current data shape)
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = row[i] !== undefined ? row[i] : '';
        });
        return obj;
    });

    // 4. Save to Cache
    try { localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() })); } catch (e) { }
    return { data, fromCache: false };
};
```

---

## 4. Why This Plan?

1.  **Backwards Compatibility**: The `data` returned by the API version is identical in shape to the current CSV version. All your parsers (`parseColleges`, `parsePlacedStudents`, etc.) will continue to work perfectly.
2.  **Performance**: JSON parsing is natively handled by the browser and is faster than custom CSV string parsing.
3.  **Reliability**: The official API endpoint is more stable for large datasets compared to the `gviz` CSV export method.
4.  **No Structure Change**: By only replacing the `fetchSheetData` function, the rest of the 800+ lines of UI and Logic remain untouched.
