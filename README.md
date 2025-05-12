# <p align="center">AI-Grid</p>

AI-GRID is a platform that provides an interactive survey for organizations of any size to evaluate and recieve feedback on their AI Governance compliance according to the standards set in ISO/IEC 42001.

![screenshot1](https://github.com/user-attachments/assets/7015eddb-00e7-4d52-b264-a309c1a9777b)

## 🚀 Features

- Extensive survey with a clean dashboard to evaluate compliance
- Reviewer dashboard to validate documents
- Admin dashboard to manage users and reset passwords
- Dynamic role-based access (Admin, Reviewer, User)
- Audit logging for all major actions
- Secure authentication via NextAuth.js

## ⚙ Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Prisma ORM, PostgreSQL
- **Auth:** NextAuth.js with CredentialsProvider

<br/>

## 🛠️ Getting started (Local Development)

### 1️⃣ Prerequisites

| Tool          | Version | Notes                                                   |
|---------------|---------|---------------------------------------------------------|
| **Node.js**   | ≥ 18    | <https://nodejs.org/en/download> (`node -v`, `npm -v`)  |
| **npm**       | bundled | comes with Node                                         |
| **PostgreSQL**| any     | local install or cloud DB (Supabase, Railway, Neon…)    |

```bash
# 1) Clone & enter the repo
git clone https://github.com/your‑org/ai‑grid.git
cd ai‑grid

# 2) Install dependencies
npm install
```

<br/>

### 2️⃣ Set up PostgreSQL
Create a PostgreSQL database locally (or using an online service seen above)
https://www.postgresql.org/download/

<br/>

### 3️⃣ Set up environment variables

Create a .env file at the root 
```bash
# PostgreSQL
# When deploying to Vercel and integrating with Supabase, you dont need to include this manually.
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database-name>"
# Not needed when running locally.
DIRECT_URL=""


# NextAuth
NEXTAUTH_SECRET="<paste output of this command: openssl rand -base64 32 OR visit https://string-gen.vercel. and copy from there>"
NEXTAUTH_URL="http://localhost:3001"

# default admin (used by seed script)
ADMIN_EMAIL="admin@email.com"
ADMIN_PASSWORD="password"

# Google Drive
GOOGLE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "...",
  ...
}'

GDRIVE_FOLDER_ID=<paste_folder_id_here>
GDRIVE_APPROVED_FOLDER_ID=<paste_folder_id_here>
```

<br/>

### 4️⃣ Set up Prisma
Prisma is used for communicating with out database more easily.
To set it up:

```bash
npx prisma generate

# then

npx prisma db push

# Run `npx prisma db push` whenever you make modifications to the
# database schema in `prisma/schema.prisma` to push those changes to the database.

# To generate an admin user with the credentials listed in .env:

npm run seed
```

<br/>

### 5️⃣ Setting up Google Drive Storage 

#### Enable the Drive API & create a service account
Navigate to https://console.cloud.google.com/ and select an existing project or create a new project and follow the steps:
1. In the side bar, navigate to **APIs & Services** ▸ **Library** → search **“Google Drive API”** → Enable.
2. Then in the sidebar again navigate to **IAM & Admin** ▸ **Service Accounts** → **Create service account**
3. After the account appears, click it → **Keys** ▸ **Add key** ▸ **Create new key** ▸ **JSON**.

Next, navigate to https://drive.google.com
1. Create two working folders in google drive. Name one **"AI-GRID Uploads"** and the other **"AI-GRID Approved"** (or something similar).
2. Open the folders, in the address bar copy the long ID after /folders/.
3. In your .env file paste them under **GDRIVE_FOLDER_ID** and **GDRIVE_APPROVED_FOLDER_ID** appropriately. 
4. For both folders: **Share** ▸ **Add** → paste the service‑account e‑mail
(ex: ai-grid-drive-uploader@<project‑id>.iam.gserviceaccount.com) → set Editor.

<br/>

### 6️⃣ Running the App
In your first terminal enter:
```node server.js```
Then in a second terminal:
```npm run dev```

<br/>

# 📂Project Structure

```
ai-grid/
├─ prisma/
│  ├─ schema.prisma             # data‑model + migrations
│  └─ seed.ts                   # seeds default admin
│
├─ public/                      # static assets
│  └─ logo.png                  
│
├─ data/                        # static JSON (e.g. questions.json)
│  └─ questions.json
│
├─ src/
│  ├─ app/                      # Next.js App‑Router (server + client pages)
│  │  ├─ api/                   # REST / serverless API routes
│  │  │  ├─ auth/…              #  NextAuth route ([...nextauth])
│  │  │  └─ admin/…             #  user‑management endpoints
│  │  ├─ .../                   #  pages (signin, register, survey...)
│  │  ├─ layout.tsx             #  root layout
│  │  └─ page.tsx               #  home page
│  │
│  ├─ components/               # shared React components (Navbar, forms…)
│  └─ lib/
│     └─ prisma.ts              # singleton Prisma client
│  
└─ server.js                    # server for google auth integration

```

