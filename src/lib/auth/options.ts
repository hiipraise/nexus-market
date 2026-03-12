// src/lib/auth/options.ts
import NextAuth, { type NextAuthOptions, type Session, type User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/connect'
import UserModel from '@/models/User'
import { authConfig } from '@/config'
import type { UserRole } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: {
      id:       string
      username: string
      email:    string
      role:     UserRole
      image?:   string
    }
  }
  interface User {
    id:       string
    username: string
    email:    string
    role:     UserRole
    image?:   string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:       string
    username: string
    role:     UserRole
  }
}

export const authOptions: NextAuthOptions = {
  secret: authConfig.secret,
  session: {
    strategy: 'jwt',
    maxAge: authConfig.sessionAge,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        await connectDB()

        const user = await UserModel
          .findOne({
            username: credentials.username.toLowerCase().trim(),
            isDeleted: false,
            isActive: true,
          })
          .select('+passwordHash')
          .lean()

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: String(user._id),
          username: user.username,
          email: user.email,
          role: user.role,
          image: user.profile?.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.username = token.username
      session.user.role = token.role
      return session
    },
  },
}
