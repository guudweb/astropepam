import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";
import { db, Usuario, eq } from "astro:db"; // AGREGAR ESTOS IMPORTS

export const onRequest = defineMiddleware(
  async ({ url, locals, redirect, request }, next) => {
    const notAuthenticateRoutes = ["/signin", "/signup"];
    const authenticateRoutes = ["/", "/data", "/program"];
    const adminRoutes = ["/program", "/data"];

    const session = await getSession(request);
    const isLoggedIn = !!session; // El doble (!!) sirve para que session se convierta en True o False

    const user = session?.user;

    locals.isLoggedIn = isLoggedIn;
    locals.user = null;
    locals.isAdmin = false;

    if (user) {
      // NUEVO: Obtener información completa del usuario de la BD
      try {
        const [userDetails] = await db
          .select()
          .from(Usuario)
          .where(eq(Usuario.user_id, Number(user.id)))
          .execute();

        locals.user = {
          name: user.name!,
          email: user.email!,
          id: user.id!, // También agregar el ID
          service_link: userDetails?.service_link || false, // AGREGAR service_link
        };
        
        locals.isAdmin = user.role === "admin";
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Fallback si hay error
        locals.user = {
          name: user.name!,
          email: user.email!,
          id: user.id!,
          service_link: false,
        };
        locals.isAdmin = user.role === "admin";
      }
    }

    //Redirects
    if (isLoggedIn && notAuthenticateRoutes.includes(url.pathname)) {
      return redirect("/");
    }

    if (!isLoggedIn && authenticateRoutes.includes(url.pathname)) {
      return redirect("/signin");
    }

    if (!locals.isAdmin && adminRoutes.includes(url.pathname)) {
      return redirect("/");
    }

    return next();
  }
);
