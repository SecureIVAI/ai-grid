# Ai-Grid

This website for provide an interactive survey for organizations of any size to evaluate and recieve feedback on their AI Governance compliance according to the stanadards set in ISO/IEC 42001

# Getting started 
Clone the repo into your machine locally
```cd ai-grid```

Ensure you have Nodejs installed with ```node -v``` and ```npm -v```
https://nodejs.org/en/download

Then to install all needed dependancies
```npm install```


## Set up PostgreSQL
Create a PostgreSQL database locally (or using an online service)
https://www.postgresql.org/download/

## Set up environment variables

Create a .env file at the root 
```
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
NEXTAUTH_SECRET="your_auth_secret_string"
NEXTAUTH_URL="http://localhost:3001"
ADMIN_EMAIL="admin@mail.com"
ADMIN_PASSWORD="password"
```

```openssl rand -base64 32```

To generate a random value used for Auth.js, paste this in place of `'your_auth_secret_string'`

## Set up Prisma
Prisma is used for communicating with out database more easily.
To set it up:

```npx prisma generate```

then

```npx prisma db push```

Run `npx prisma db push` whenever you make modifications to the database schema in `prisma/schema.prisma` to push those changes to the database.

NOTE: To create a new admin user or overwrite the default one with new credentials, run ```npm run seed```

## Setting up Google Drive Storage 
Navigate to https://console.cloud.google.com/ and select an existing project or create a new project and follow the steps:
1. Select IAM & Admin
2. Select Service Accounts and Create a new Service Account (type in a service id name and ignore optional settings)
3. Select the service account and go to keys
4. Add key -> Create new key -> Select Json
5. In the root of your project folder create a folder titled ```config``` and put the downloaded json file in this folder
6. Rename the file to credentials.json
7. In server.js (in the project root) change folderId to the folderId of the google drive folder you wish to store documents in (To find the folderId of your folder copy the url after ```/folders/```
8. Then make sure to share this folder and give edit permissions to your new googleservice account email

## Running the App
In your first terminal enter:
```node server.js```
Then in a second terminal:
```npm run dev```
