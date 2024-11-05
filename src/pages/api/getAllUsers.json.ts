// src/pages/api/getAllUsers.js
import { db, Usuario } from 'astro:db';

export async function GET({ url }) {
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  // Consulta para obtener los usuarios
  const comments = await db
    .select()
    .from(Usuario)
    .limit(limit)
    .offset(offset)
    .execute();
    console.log(comments);
    
  // Consulta para contar el total de usuarios
  const allUsers = await db.select().from(Usuario).execute();
  const total = allUsers.length; // Contamos el total de usuarios
  
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
