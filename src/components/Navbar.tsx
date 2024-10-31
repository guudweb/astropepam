import React from 'react'

export default function Navbar() {

  const handleClick = async () => {
    const { signOut } = await import("auth-astro/client");
    await signOut();
    window.location.replace("/signin");
  }

  return (
    <div className="bg-cyan-600 w-full flex justify-between items-center p-5">
      <a href="/" className="text-xl text-white font-semibold">PPAM - Malabo</a>
      <button
        id="logout"
        className="border-2 border-white px-5 py-2 rounded-lg text-white text-lg hover:bg-white hover:text-cyan-600 transition-colors"
        onClick={handleClick}
        >
          Cerrar Sesión
        </button>
  </div>
  )
}
