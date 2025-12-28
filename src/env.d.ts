/// <reference path="../.astro/types.d.ts" />

interface User {
  email: string;
  name: string;
  id?: string; // AGREGAR
  service_link?: boolean; // AGREGAR
}

declare namespace App {
  interface Locals {
    isLoggedIn: boolean;
    isAdmin: boolean;
    user: User | null;
  }
}
