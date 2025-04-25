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
NEXTAUTH_URL="http://localhost:3000"
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
## Running the App

```npm run dev```
