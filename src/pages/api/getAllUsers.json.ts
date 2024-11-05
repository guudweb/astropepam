// src/pages/api/getAllUsers.js
import { Congregacion, db, eq, Usuario } from 'astro:db';

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  // Consulta para obtener los usuarios
  const usersWithCongregation = await db
    .select()
    .from(Usuario)
    .leftJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id))
    .limit(limit)
    .offset(offset)
    .execute();
    
  console.log("Usuarios con congregación:", usersWithCongregation); // Para depurar
  // Consulta para contar el total de usuarios
  const allUsers = await db.select().from(Usuario).execute();
  const total = allUsers.length; // Contamos el total de usuarios

  const comments = usersWithCongregation.map(user => ({
    ...user.Usuario,
    congregacion: user.Congregacion
  }));
  
  return new Response(
    JSON.stringify({
      data: comments,
      total,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
