// src/middleware/auth.ts
import { getSession } from "auth-astro/server";

const notAuthenticateRoutes = ['/signin', '/signup'];

export async function onRequest({ url, locals, redirect, request }, next) {
    const session = await getSession(request);
    const isLoggedIn = !!session;

    const user = session?.user;
    
    // Definir variables en locals
    locals.isLoggedIn = isLoggedIn;
    locals.user = null;
    locals.isAdmin = false;

    if (user) {
        locals.user = {
            name: user.name,
            email: user.email,
        };
        locals.isAdmin = user.role === 'admin';
    }

    // Si no está autenticado y está tratando de acceder a una ruta protegida
    if (!isLoggedIn && !notAuthenticateRoutes.includes(url.pathname)) {
        return redirect('/signin'); // Redirige a la página de inicio de sesión
    }

    // Redirecciona si el usuario ya está autenticado
    if (isLoggedIn && notAuthenticateRoutes.includes(url.pathname)) {
        return redirect('/');
    }
    
    // Pasa al siguiente middleware o manejador de ruta
    return next();
}
