# SNS Institutions Placement Dashboard & Directory

A modern, responsive, and dynamic web portal designed to showcase the placement excellence of SNS Institutions (SNSCT, SNSCE, Dr.SNSRCAS). This single-page application is built using React (via unpkg CDN for zero-build deployment), providing real-time data visualization and a comprehensive student directory powered directly by Google Sheets.

## 🚀 Features

*   **Real-time Headless CMS:** Powered directly by a Google Sheets backend, allowing non-technical staff to seamlessly update statistics, placement numbers, salary data, and student profiles without deploying new code.
*   **Dynamic Data Visualizations:** Integrated charting for Package Distributions, Year-over-Year Trends, and top recruiting companies across the institution network.
*   **Comprehensive Student Directory:**
    *   Searchable and filterable database by College, Department, and Year of Passing.
    *   Dedicated profile links to professional networks (LinkedIn, GitHub, LeetCode).
    *   Fallback avatars for missing or invalid profile photos via Google Drive integrations.
*   **Training & Certifications Hub:** Showcases institutional partnerships, training platform engagement, and global certification metrics.
*   **Premium Modern UI/UX:**
    *   Dark-themed, fully responsive design using custom CSS.
    *   Glassmorphism elements, subtle micro-animations, and hover states.
    *   Floating Action Buttons (FAB) for instant WhatsApp communication and Enrollment inquiries.
    *   Structured, multi-column navigation footer with social links and contact details.

## 🛠 Tech Stack

Designed for ultimate simplicity and immediate deployment, this project bypasses complex build steps by running React directly in the browser.

*   **Core:** HTML5, CSS3, JavaScript (ES6+)
*   **Framework:** React 18 & ReactDOM (loaded via unpkg CDN)
*   **Compiler:** Babel standalone (for in-browser JSX compilation)
*   **Icons & Assets:** FontAwesome 6 (Brands & Solid icons)
*   **Typography:** Google Fonts (Outfit, Space Mono, Inter)

## 📁 Project Structure

Currently, the entire application logic, styling, and data-fetching layer are encapsulated within a single file for rapid iteration and deployment ease.

*   `index.html`: The core application file containing the React components, CSS definitions, and Google Sheets fetch protocols.
*   `README.md`: Project documentation.
*   `Logo .png`: Institution Brand Logo.

## ⚙️ How it Works (Data Flow)

1.  **Initialization:** Upon loading `index.html`, React initializes and mounts onto the `#root` div.
2.  **Data Fetching:** The `useEffect` hook triggers an asynchronous fetch to a publicly published Google Sheet (via its CSV export URL).
3.  **Parsing:** The raw CSV data is mapped into structured JSON objects by designated parser functions (e.g., `parsePlacedStudents()`, `parseSalaryAnalysis()`). Google Drive image links are specifically formatted to bypass CORS restrictions using the Drive thumbnail API.
4.  **State Management:** Extracted data populates React state variables (`stats`, `yearlyStats`, `placed`, etc.), which automatically drive the UI rendering logic.
5.  **Re-rendering:** When users apply cross-filters (e.g., selecting a specific College or Department), the state updates, and the directory lists and statistical grids instantly reflect the subset of data.

## 👨‍💻 Development & Deployment

### Local Testing

Because this project utilizes Babel to compile JSX in the browser, opening the file directly via the `file://` protocol may cause CORS issues depending on your browser.

To test locally, it is highly recommended to serve the directory using a simple local HTTP server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server
```
Then navigate to `http://localhost:8000` in your browser.

### Deployment

To deploy, simply host the `index.html` file and the associated `Logo .png` on any static web hosting provider (e.g., GitHub Pages, Vercel, Netlify, or AWS S3).

---
*❤️ Developed by SNS*
