import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with actual user authentication
        const testusers = [
          { id: 1, email: "elijah@gmail.com", password: "password", name: "Elijah"},
          { id: 2, email: "samer@gmail.com", password: "password", name: "Samer" },
          { id: 3, email: "brandon@gmail.com", password: "password", name: "Brandon" },
          { id: 4, email: "omer@gmail.com", password: "password", name: "Omer" },
          { id: 5, email: "nathan@gmail.com", password: "password", name: "Nathan" },
          { id: 6, email: "huy@gmail.com", password: "password", name: "Huy" },
        ];

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = testusers.find((user) => user.email === credentials.email);

        if (!user) {
          throw new Error("User not found");
        }

        if (user.password !== credentials.password) {
          throw new Error("Invalid password");
        }

        console.log("Authentication successful:", user);
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };