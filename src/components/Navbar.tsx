import React, { useState } from 'react'
import Spinner from './Spinner.astro';

export default function Navbar() {

  const [loading, setLoading] = useState<boolean>(false)

  const handleClick = async () => {
   try{
    setLoading(true);
    const { signOut } = await import("auth-astro/client");
    await signOut();
    window.location.replace("/signin");
    setLoading(false);
   }catch (error) {
    console.log(error);
    setLoading(false)
   }
  }

  return (
    <div className="bg-cyan-600 w-full flex justify-between items-center p-5">
      <a href="/" className="text-xl text-white font-semibold">PPAM - Malabo</a>
      <button
        id="logout"
        className="border-2 border-white px-5 py-2 rounded-lg text-white text-lg hover:bg-white hover:text-cyan-600 transition-colors disabled:bg-gray-500"
        disabled={loading}
        onClick={handleClick}
        >
          {loading ? <Spinner classList='size-6 mx-auto'/> : "Cerrar sesión"}
        </button>
  </div>
  )
}
