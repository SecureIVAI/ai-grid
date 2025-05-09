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
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database-name>"

# NextAuth
NEXTAUTH_SECRET="<paste output of this command: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3001"

# default admin (used by seed script)
ADMIN_EMAIL="admin@email.com"
ADMIN_PASSWORD="password"
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
Navigate to https://console.cloud.google.com/ and select an existing project or create a new project and follow the steps:
1. Select IAM & Admin
2. Select Service Accounts and Create a new Service Account (type in a service id name and ignore optional settings)
3. Select the service account and go to keys
4. Add key -> Create new key -> Select Json
5. In the root of your project folder create a folder titled ```config``` and put the downloaded json file in this folder
6. Rename the file to credentials.json
7. In server.js (in the project root) change folderId to the folderId of the google drive folder you wish to store documents in (To find the folderId of your folder copy the url after ```/folders/```
8. Then make sure to share this folder and give edit permissions to your new googleservice account email

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

