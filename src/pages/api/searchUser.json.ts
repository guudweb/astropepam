// src/pages/api/searchUsers.ts
import { Congregacion, db, eq, like, Usuario } from 'astro:db';

export async function GET({ url }) {
  const query = url.searchParams.get('q') || ''; // Obtiene el parámetro de búsqueda 'q'
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  // Consulta para buscar usuarios por nombre
  const usersWithCongregation = await db
    .select()
    .from(Usuario)
    .where(like(Usuario.nombre, `%${query}%`)) // Filtra por nombre usando LIKE
    .leftJoin(Congregacion, eq(Usuario.congregacion, Congregacion.id))
    .limit(limit)
    .offset(offset)
    .execute();
  
  
  // Consulta para contar el total de usuarios que coinciden con la búsqueda
  const allUsers = await db
    .select()
    .from(Usuario)
    .where(like(Usuario.nombre, `%${query}%`))
    .execute();
  
  const total = allUsers.length; // Contamos el total de usuarios que coinciden

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
