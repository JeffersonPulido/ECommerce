import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbUsers } from "@/database";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Custom Login",
            credentials: {
                email: {
                    label: "Correo:",
                    type: "email",
                    placeholder: "Correo Electronico",
                },
                password: {
                    label: "Contraseña:",
                    type: "password",
                    placeholder: "Contraseña",
                },
            },
            async authorize(credentials) {
                // console.log({ credentials });
                // return { name: 'Juan', correo: 'juan@google.com', role: 'admin' };

                return await dbUsers.checkUserEmailPassword(
                    credentials!.email,
                    credentials!.password
                );
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || '',
            clientSecret: process.env.GOOGLE_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || '',
        }),
    ],
    //Custom Pages
    pages: {
        signIn: "/auth/login",
        newUser: "/auth/register",
    },
    //Callbacks
    jwt: {
        // secret: process.env.JWT_SECRET_SEED, // deprecated
    },
    //Duration Session
    session: {
        maxAge: 2592000, //30days
        strategy: "jwt",
        updateAge: 86400, //1day
    },
    callbacks: {
        async jwt({ token, account, user }) {
            // console.log({ token, account, user });

            if (account) {
                token.accessToken = account.access_token;

                switch (account.type) {
                    case "oauth":
                        token.user = await dbUsers.oAuthToDbUser(
                            user?.email || "",
                            user?.name || ""
                        );
                        break;

                    case "credentials":
                        token.user = user;
                        break;
                }
            }

            return token;
        },
        async session({ session, token, user }) {
            // console.log({ session, token, user });

            session.accessToken = token.accessToken as any;
            session.user = token.user as any;

            return session;
        },
    },
}

export default NextAuth(authOptions)
