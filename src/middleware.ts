import { defineMiddleware } from "astro:middleware";
import { getSession } from "auth-astro/server";

const notAuthenticateRoutes = ['/signin', '/signup']


export const onRequest = defineMiddleware(
    async ({url, locals, redirect, request}, next) => {
        const session = await getSession(request)
        const isLoggedIn = !!session // El doble (!!) sirve para que session se convierta en True o False

        const user = session?.user

        
        locals.isLoggedIn = isLoggedIn
        locals.user = null
        locals.isAdmin = false

        if(user) {
            locals.user = {
                name: user.name!,
                email: user.email!,
            }
            locals.isAdmin = user.role === 'admin'
        }

        //Redirects
        if(isLoggedIn && notAuthenticateRoutes.includes(url.pathname)) {
            return redirect('/')
        }
        

        return next()
    }
)