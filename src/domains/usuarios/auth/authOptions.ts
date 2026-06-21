import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from '@/shared/lib/prisma';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // TEMP DIAGNOSTIC — remove once root cause confirmed
        let usuario: Awaited<ReturnType<typeof prisma.usuario.findUnique>> = null;
        try {
          usuario = await prisma.usuario.findUnique({
            where: { username: credentials.username },
          });
          console.log('[AUTH_DIAG] db query ok, user found:', !!usuario);
        } catch (error) {
          console.error('[AUTH_DB_ERROR]', error);
          return null;
        }

        if (!usuario) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, usuario.password);
        console.log('[AUTH_DIAG] bcrypt match:', passwordMatch);
        if (!passwordMatch) return null;

        return { id: usuario.id, name: usuario.username, role: usuario.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
