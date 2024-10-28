import type { AdapterUser } from "@auth/core/adapters";
import Credentials from "@auth/core/providers/credentials";
import { db, eq, Usuario } from "astro:db";
import { defineConfig } from "auth-astro";

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
        email: { label: "Email", type: "Email" },
        password: { label: "Password", type: "Password" },
      },
      authorize: async ({ email, password }) => {
        const [user] = await db
          .select()
          .from(Usuario)
          .where(eq(Usuario.correo, `${email}`));

        if (!user || password !== user.contraseña) {
          console.log("Correo o contraseña incorrectos");
          return null;
        }

        const userData = {
          id: user.user_id,
          name: user.nombre,
          email: user.correo,
          role: user.role,
        };

        return userData as Object;
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
      console.log({ session: session.user });

      return session;
    },
  },
});
