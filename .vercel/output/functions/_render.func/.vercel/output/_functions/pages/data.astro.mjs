/* empty css                                */
import { c as createComponent, r as renderTemplate, m as maybeRenderHead, f as renderComponent } from '../chunks/astro/server_C3pInzrF.mjs';
import 'kleur/colors';
import 'clsx';
import { d as db, U as Usuario } from '../chunks/_astro_db_BdnJ5_v5.mjs';
import { $ as $$Layout } from '../chunks/Layout_Bh3sB_Lv.mjs';
export { renderers } from '../renderers.mjs';

const $$DataView = createComponent(async ($$result, $$props, $$slots) => {
  const comments = await db.select().from(Usuario);
  return renderTemplate`${maybeRenderHead()}<div class="container mx-auto mt-8"> <div style="overflow-x:auto;"> <table class="min-w-full bg-white border border-gray-200"> <thead> <tr> <th class="px-4 py-2 border-b">Nombre</th> <th class="px-4 py-2 border-b">Correo</th> <th class="px-4 py-2 border-b">Teléfono</th> <th class="px-4 py-2 border-b">Congregación</th> <th class="px-4 py-2 border-b">Disponibilidad</th> </tr> </thead> <tbody> ${comments.map(({ correo, telefono, nombre, congregacion, disponibilidad }) => renderTemplate`<tr> <td class="px-4 py-2 border-b whitespace-nowrap">${nombre}</td> <td class="px-4 py-2 border-b whitespace-nowrap">${correo}</td> <td class="px-4 py-2 border-b whitespace-nowrap">${telefono}</td> <td class="px-4 py-2 border-b whitespace-nowrap">${congregacion}</td> <td class="px-4 py-2 border-b whitespace-nowrap">${disponibilidad}</td> </tr>`)} </tbody> </table> </div> </div>`;
}, "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/components/DataView.astro", void 0);

const $$Data = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "data" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "DataView", $$DataView, {})} ` })}`;
}, "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/data.astro", void 0);

const $$file = "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/data.astro";
const $$url = "/data";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Data,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
