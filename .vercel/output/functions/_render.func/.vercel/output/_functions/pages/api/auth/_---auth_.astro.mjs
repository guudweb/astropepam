import { Auth } from '@auth/core';
import { parseString } from 'set-cookie-parser';
import Credentials from '@auth/core/providers/credentials';
import { d as db, U as Usuario } from '../../../chunks/_astro_db_BdnJ5_v5.mjs';
import { eq } from '@astrojs/db/dist/runtime/virtual.js';
export { renderers } from '../../../renderers.mjs';

const defineConfig = (config) => {
  config.prefix ??= "/api/auth";
  config.basePath = config.prefix;
  return config;
};

const authConfig = defineConfig({
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
        password: { label: "Password", type: "Password" }
      },
      authorize: async ({ email, password }) => {
        const [user] = await db.select().from(Usuario).where(eq(Usuario.correo, `${email}`));
        if (!user || password !== user.contraseña) {
          console.log("Correo o contraseña incorrectos");
          return null;
        }
        const userData = {
          id: user.user_id,
          name: user.nombre,
          email: user.correo,
          role: user.role
        };
        return userData;
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user = token.user;
      console.log({ session: session.user });
      return session;
    }
  }
});

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
const actions = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error"
];
function AstroAuthHandler(prefix, options = authConfig) {
  return async ({ cookies, request }) => {
    const url = new URL(request.url);
    const action = url.pathname.slice(prefix.length + 1).split("/")[0];
    if (!actions.includes(action) || !url.pathname.startsWith(prefix + "/")) return;
    const res = await Auth(request, options);
    if (["callback", "signin", "signout"].includes(action)) {
      const getSetCookie = res.headers.getSetCookie();
      if (getSetCookie.length > 0) {
        getSetCookie.forEach((cookie) => {
          const { name, value, ...options2 } = parseString(cookie);
          cookies.set(name, value, options2);
        });
        res.headers.delete("Set-Cookie");
      }
    }
    return res;
  };
}
function AstroAuth(options = authConfig) {
  const { AUTH_SECRET, AUTH_TRUST_HOST, VERCEL, NODE_ENV } = Object.assign(__vite_import_meta_env__, { AUTH_TRUST_HOST: "true", AUTH_SECRET: "54785236521014785201595148523018", NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV, OS: process.env.OS });
  options.secret ??= AUTH_SECRET;
  options.trustHost ??= !!(AUTH_TRUST_HOST ?? VERCEL ?? NODE_ENV !== "production");
  const { prefix = "/api/auth", ...authOptions } = options;
  const handler = AstroAuthHandler(prefix, authOptions);
  return {
    async GET(context) {
      return await handler(context);
    },
    async POST(context) {
      return await handler(context);
    }
  };
}

const prerender = false;
const { GET, POST } = AstroAuth();

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
