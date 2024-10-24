// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

import tailwind from "@astrojs/tailwind";

import db from "@astrojs/db";

import auth from "auth-astro";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), db(), auth()],
  output: "server",
  adapter: vercel(),
});