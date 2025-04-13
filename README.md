# Ai-Grid

This website for provide an interactive survey for organizations of any size to evaluate and recieve feedback on their AI Governance compliance according to the stanadards set in ISO/IEC 42001

## Getting started 
Clone the repo into your machine locally
>cd ai-grid

Then to install all needed dependancies
>npm install


### Set up PostgreSQL
Create a PostgreSQL database locally (or using an online service)
https://www.postgresql.org/download/

## Set up environment variables

Create a .env file at the root 
```
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
NEXTAUTH_SECRET="your_auth_secret_string"
NEXTAUTH_URL="http://localhost:3000"
```

>openssl rand -base64 32

To generate a random value used for Auth.js, paste this in place of `'your_auth_secret_string'`

### Set up Prisma
Prisma is used for communicating with out database more easily.
To set it up:

>npx prisma generate
>npx prisma db push

Run `npx prisma db push` whenever you make modifications to the database schema in `prisma/schema.prisma` to push those changes to the database.
``
### Running the App

>npm run dev
