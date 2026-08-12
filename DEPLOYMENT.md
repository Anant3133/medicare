# 🌐 Medicare Deployment Guide

This document provides complete, step-by-step instructions to deploy the **Medicare Full-Stack Application** online using free-tier cloud platforms.

---

## 🏗️ Architecture Overview

| Component | Technology Stack | Recommended Host | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL 15+ | [Neon.tech](https://neon.tech) / Render DB | Yes |
| **Backend API** | Node.js + Express | [Render.com](https://render.com) | Yes |
| **Frontend** | React (Vite) + Tailwind | [Vercel](https://vercel.com) / Render | Yes |

---

## ⚡ Method 1: Render 1-Click Blueprint (Easiest & Fastest)

This repository includes a `render.yaml` file that allows you to deploy the Database, Backend, and Frontend automatically in one click.

### Steps:
1. **Push your code to GitHub**:
   - Create a repository on GitHub (public or private) and push your Medicare project code to it.

2. **Connect to Render**:
   - Log into [Render.com](https://dashboard.render.com/).
   - Click **New +** in the top right, then select **Blueprint**.

3. **Select your Repository**:
   - Connect your GitHub account and select your `medicare` repository.
   - Render will detect the `render.yaml` file automatically.

4. **Deploy**:
   - Click **Apply**. Render will provision:
     - A PostgreSQL database (`medicare-db`)
     - The Express Backend (`medicare-backend`)
     - The React Frontend (`medicare-frontend`)

5. **Initialize Database Tables & Seed Data**:
   - Once the database and backend are deployed, open your local terminal (or Render backend Shell) and run:
     ```bash
     # Set DATABASE_URL environment variable to your Render Postgres External Connection String
     DATABASE_URL="postgres://user:password@host/medicare" npm run db:migrate
     ```
   - Alternatively, in Render backend Web Service settings, run shell command:
     `npm run db:migrate`

---

## 🚀 Method 2: Manual Step-by-Step Deployment (Neon + Render + Vercel)

If you prefer using **Neon.tech** for PostgreSQL and **Vercel** for Frontend, follow this modular guide.

### Step 1: Deploy Database on Neon.tech
1. Go to [Neon.tech](https://neon.tech) and create a free account.
2. Click **Create Project** and name it `medicare`.
3. Select your preferred region and click **Create**.
4. Copy the **Connection String** provided (starts with `postgresql://alex:...@ep-xyz.neon.tech/neondb?sslmode=require`).

#### Run Database Migrations:
In your local project terminal, run:
```bash
# On Windows PowerShell:
$env:DATABASE_URL="your_neon_connection_string_here"
npm run db:migrate

# On Bash/Linux/Mac:
DATABASE_URL="your_neon_connection_string_here" npm run db:migrate
```
*This command creates all 11 normalized tables, stored procedures, triggers, audit logs, indexes, views, and initial seed data automatically.*

---

### Step 2: Deploy Backend API on Render.com
1. Go to [Render.com](https://dashboard.render.com/) -> Click **New +** -> Select **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `medicare-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables under **Environment**:
   - `DATABASE_URL`: *(Paste your Neon Connection String)*
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your_super_secret_jwt_key_32_chars_long`
   - `FRONTEND_URL`: `https://your-frontend-domain.vercel.app` *(or `*` temporarily)*
5. Click **Create Web Service**.
6. Once deployed, note down your backend URL (e.g., `https://medicare-backend.onrender.com`).
7. Test the health endpoint in your browser: `https://medicare-backend.onrender.com/health`.

---

### Step 3: Deploy Frontend App on Vercel
1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `medicare` GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit, select `frontend`.
5. Expand **Environment Variables**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://medicare-backend.onrender.com/api` *(Your Render Backend URL + `/api`)*
6. Click **Deploy**.
7. Once deployed, Vercel will give you a domain (e.g. `https://medicare-frontend.vercel.app`).

---

## 🔑 Default Credentials for Login

Once your database migration script runs, you can log in using these default credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@medicare.com` | `admin123` |
| **Doctor** | `doctor@medicare.com` | `doctor123` |
| **Receptionist** | `receptionist@medicare.com` | `recep123` |

---

## ⚙️ Summary of Local Verification Commands

To verify everything locally before deploying:

```bash
# Install dependencies in root, backend, and frontend
npm run install-all

# Test database migration runner locally
npm run db:migrate

# Test frontend production build
npm run start:frontend
```
