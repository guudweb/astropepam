import type { AdapterUser } from "@auth/core/adapters";
import Credentials from "@auth/core/providers/credentials";
import { db, eq, Usuario } from "astro:db";
import { defineConfig } from "auth-astro";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  userName: string;
}


export default defineConfig({
  providers: [
    //TODO Sesion con proveedores externos
    // GitHub({
    //   clientId: import.meta.env.GITHUB_CLIENT_ID,
    //   clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    // }),

    //? Sesión con credenciales
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async ({ email, password }) => {
        const [user] = await db
          .select()
          .from(Usuario)
          .where(eq(Usuario.userName, `${email}`));


        if (!user || password !== user.contraseña) {
          console.log("Correo o contraseña incorrectos");
          return null;
        }

        const userData: User = {
          id: user.user_id.toString(),
          name: user.nombre,
          email: user.correo,
          role: user.role,
          userName: user.userName
        };

        return userData
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user = token.user as AdapterUser;
      return session;
    },
  },
});
