# DMI Engineering College ERP (CSE Dept)

## Setup Instructions

### 1. Database Setup (PostgreSQL)
1. Open pgAdmin or your terminal.
2. Create a database named `college_erp`.
3. Open the Query Tool for `college_erp` and run the contents of `server/schema.sql`.

### 2. Backend Setup
1. Open a terminal in `server/`.
2. Run `npm install`.
3. Start the server:
   ```bash
   npm run dev
   # or
   node index.js
   ```
   Server should run on port 5000.

### 3. Frontend Setup
1. Open a terminal in `client/`.
2. Run `npm install`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the link (usually http://localhost:5173) in your browser.

## Features
- **Dashboard**: Overview of Students, Staff, and Subjects.
- **Students**: Manage CSE students (Add, List, Filter).
- **Design**: Premium Glassmorphism UI with DMI Engineering College branding.
