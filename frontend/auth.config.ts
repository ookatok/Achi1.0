import Credentials from "@auth/core/providers/credentials";
import { defineConfig } from "auth-astro";

export default defineConfig({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "f22e86ea19142bdf9d1cf37c05059ad83be1703db5d54a5a54db68ad7ea1dcde",
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch("http://localhost:3001/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: { "Content-Type": "application/json" }
          });

          const data = await res.json();
          if (res.ok && data && data.accessToken) {
            // Return user object populated with token and role
            return {
              id: String(data.user.id),
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              accessToken: data.accessToken,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth.js authorization error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
});
