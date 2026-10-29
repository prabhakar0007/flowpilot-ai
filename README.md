# FlowPilot AI (No Payments)

A calm, focused business operations workspace for freelancers and small businesses. Includes AI assistance, invoice generation & tracking, private browser-persisted history, and real-time dashboard metrics.

**Live Demo Ready**: No database setup required. Opens directly without login.

---

## 🚀 Quick Start (Local)

1. **Clone repository**:
   ```bash
   git clone https://github.com/prabhakar0007/flowpilot-ai.git
   cd flowpilot-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment (Optional)**:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key in `GEMINI_API_KEY` to enable live Gemini AI. If left blank, the app runs smoothly with the built-in intelligent assistant!

4. **Start the app**:
   ```bash
   npm start
   ```
   Open **http://localhost:3000** in your browser.

---

## 🌐 Deploy to Render (1-Click or Manual)

### Option 1: Render Web Service (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`flowpilot-ai`).
4. Configure settings:
   - **Name**: `flowpilot-ai`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. **Environment Variables** (under *Advanced* or *Environment*):
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key
   - `GEMINI_MODEL`: `gemini-2.5-flash`
6. Click **Deploy Web Service**!

Render will automatically build and assign a free HTTPS URL (e.g. `https://flowpilot-ai.onrender.com`).

---

## ✨ Features

- **Direct Access**: No account creation or login required — opens immediately.
- **Smart AI Copilot**: Intelligent assistant for invoices, client follow-up templates, and project workflows.
- **Invoices**: Create, track, toggle status (*Draft*, *Sent*, *Paid*, *Overdue*), and delete records locally.
- **Browser-Safe Storage**: All invoices and chat history persist securely in your browser's local storage.
- **Render Ready**: Automatic `PORT` binding, reverse proxy support (`trust proxy`), and `/api/health` check.
