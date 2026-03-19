# Google Sheets API Connection Guide

This document provides a **step-by-step process** to create a Google Cloud API Key and connect it to the SNS Placement Portal.

---

## ✅ STEP 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your **Google account** (use the institutional Gmail if possible).
3. At the top of the page, click the **project selector dropdown** (next to the Google Cloud logo).
4. Click **"New Project"** in the popup.
5. Enter a **Project Name** (e.g., `SNS-Placement-Portal`).
6. Click **"Create"**.
7. Wait a few seconds — then make sure your new project is **selected** in the top dropdown.

---

## ✅ STEP 2 — Enable the Google Sheets API

1. In the left sidebar, go to **"APIs & Services" → "Library"**.
2. In the search bar, type **`Google Sheets API`**.
3. Click on **"Google Sheets API"** from the results.
4. Click the blue **"Enable"** button.
5. Wait for it to activate (the page will reload and show a dashboard for the API).

---

## ✅ STEP 3 — Create an API Key

1. In the left sidebar, go to **"APIs & Services" → "Credentials"**.
2. Click **"+ Create Credentials"** at the top.
3. Select **"API key"** from the dropdown.
4. Your API key will be **generated immediately** and shown in a popup.
5. **Copy the API key** and save it somewhere safe (e.g., Notepad).
6. Click **"Close"**.

---

## ✅ STEP 4 — Restrict the API Key (Recommended for Security)

> This prevents misuse if the key is ever exposed publicly.

1. In **"APIs & Services" → "Credentials"**, find your newly created API key in the list.
2. Click the **✏️ Edit (pencil) icon** next to it.
3. Under **"API restrictions"**, select **"Restrict key"**.
4. From the dropdown, check ✅ **"Google Sheets API"**.
5. Click **"Save"**.

---

## ✅ STEP 5 — Share Your Google Sheet (Make it Public Read-Only)

> The API key can only read sheets that are accessible publicly.

1. Open your **Google Sheet** (the Placement Data sheet).
2. Click the **"Share"** button (top-right corner).
3. Under "General access", change it from **"Restricted"** to **"Anyone with the link"**.
4. Make sure the role is set to **"Viewer"** (read-only).
5. Click **"Done"**.

---

## ✅ STEP 6 — Get Your Spreadsheet ID

Your Spreadsheet ID is in the URL of your Google Sheet:

```
https://docs.google.com/spreadsheets/d/  <<<SPREADSHEET_ID>>>  /edit
```

**Example:**
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        This is your Spreadsheet ID
```

Copy and save that ID.

---

## ✅ STEP 7 — Add the API Key to the Portal Code

Open `index.html` and find the `SHEET_CONFIG` object (around **line 43**). Update it as follows:

```javascript
const SHEET_CONFIG = {
    spreadsheetId: 'PASTE_YOUR_SPREADSHEET_ID_HERE',
    apiKey:        'PASTE_YOUR_API_KEY_HERE',
    cacheTime: 300000, // 5 minutes cache
    sheets: {
        colleges:        'College_Master',
        departments:     'Department_Mapping',
        placementStats:  'Placement_Stats',
        companyVisits:   'Company_Visits',
        placedStudents:  'Placed_Students',
        certifications:  'Certifications',
        upcomingDrives:  'Upcoming_Drives',
    }
};
```

---

## ✅ STEP 8 — Test the Connection

1. Open `index.html` in a browser (or via your local dev server).
2. Open **DevTools → Console** (press `F12`).
3. Check for any errors related to `Sheets API` or `403 Forbidden`.
   - ✅ **No errors** = Connected successfully!
   - ❌ **403 error** = API key restrictions or sheet sharing issue. Re-check Steps 4 & 5.
   - ❌ **404 error** = Incorrect Spreadsheet ID. Re-check Step 6.

---

## 🔁 How the Updated Fetch Function Works

The `fetchSheetData` function in `index.html` (~Line 89) should be replaced with:

```javascript
const fetchSheetData = async (sheetName) => {
    // 1. Check Cache
    const cacheKey = `sns_sheet_api_${sheetName}`;
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < SHEET_CONFIG.cacheTime) return { data, fromCache: true };
        }
    } catch (e) { }

    // 2. Fetch via Google Sheets API v4
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_CONFIG.spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${SHEET_CONFIG.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google API Error: ${res.status}`);

    const json = await res.json();
    const rows = json.values;

    if (!rows || rows.length < 2) return { data: [], fromCache: false };

    // 3. Convert rows → objects using header row
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
        return obj;
    });

    // 4. Save to Cache
    try { localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() })); } catch (e) { }
    return { data, fromCache: false };
};
```

---

## 🔐 Security Notes

| Do | Don't |
|---|---|
| Restrict your API key to Sheets API only | Never commit the API key to a public GitHub repo |
| Set the sheet to "Viewer only" | Don't give the key Editor permissions |
| Use caching to reduce API calls | Don't call the API on every render |

---

## 📋 Quick Reference

| Item | Where to Get It |
|---|---|
| **Spreadsheet ID** | From the Google Sheet URL |
| **API Key** | Google Cloud Console → APIs & Services → Credentials |
| **Sheet Names** | Tab names at the bottom of your Google Sheet |
