import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.userId = user.id;
        token.backendToken = user.backendToken || null;
        token.backendRefreshToken = user.backendRefreshToken || null;
        token.backendUser = user.backendUser || null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.accessToken = token.accessToken;
      session.user.backendToken = token.backendToken;
      session.user.backendRefreshToken = token.backendRefreshToken;
      session.user.backendUser = token.backendUser;
      return session;
    },
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: user.name,
                email: user.email,
                image: user.image,
                googleId: user.id,
              }),
            }
          );
          const data = await res.json();
          if (data.success) {
            user.backendToken = data.data.accessToken;
            user.backendRefreshToken = data.data.refreshToken;
            user.backendUser = data.data.user;
            return true;
          }
          return false;
        } catch (error) {
          console.error("Google sign-in backend error:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
