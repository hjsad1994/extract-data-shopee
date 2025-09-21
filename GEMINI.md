# GEMINI.md

## Project Overview

This project is a web application designed to extract comments from the Shopee website. It consists of a Node.js Express backend and a Next.js (React) frontend.

The backend provides an API to receive HTML content, extract comments using Cheerio, and store them in a CSV file. The frontend provides a user interface to paste the HTML, trigger the extraction, and download the resulting CSV file. It also includes a feature to merge multiple CSV files.

### Technologies Used

*   **Backend**: Node.js, Express.js, Cheerio, json2csv, fast-csv
*   **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Papaparse

### Architecture

The application is split into two main parts:

*   `backend/`: An Express.js server that handles the web scraping and CSV file generation. It runs on port 3001.
*   `frontend/`: A Next.js application that provides the user interface. It runs on port 3000 and communicates with the backend API.

## Building and Running

### Backend

To run the backend server:

```bash
cd backend
npm install
npm run dev
```

The server will start on `http://localhost:3001`.

### Frontend

To run the frontend application:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production

To build and run the application in production:

**Backend:**

```bash
cd backend
npm install
npm start
```

**Frontend:**

```bash
cd frontend
npm install
npm run build
npm start
```

## Development Conventions

### Backend

The backend code is written in JavaScript (ESM). The main server logic is in `server.js`. It uses the `fs` module to write to a `shopee_comments.csv` file in the `backend` directory.

### Frontend

The frontend is a standard Next.js application with TypeScript. The main page is `src/app/page.tsx`. It uses `fetch` to make API calls to the backend. State is managed with React hooks. Styling is done with Tailwind CSS.

## Change Log

### Extraction and CSV Generation Improvements

Numerous changes were made to improve the reliability and correctness of the comment extraction and CSV generation features.

#### Backend (`server.js`)

*   **Extraction Logic**: The scraping logic was refined to correctly handle complex and nested HTML structures. The final implementation now targets the `.meQyXP` class for each comment, intelligently adds spaces between text from adjacent HTML elements (like `<div>` and `<p>`), and normalizes all whitespace to ensure clean, readable output.
*   **CSV Formatting**: The CSV generation logic was significantly hardened to prevent common formatting errors, especially when opening files in Microsoft Excel.
    *   All newline characters are replaced with spaces to ensure each comment occupies a single row.
    *   Double quotes (`