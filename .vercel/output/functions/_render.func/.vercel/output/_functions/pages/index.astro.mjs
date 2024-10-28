/* empty css                                */
import { c as createComponent, r as renderTemplate, f as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_C3pInzrF.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bh3sB_Lv.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Inicio" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex space-x-4"> <a href="/login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
Login Form
</a> <a href="/program" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
Programa
</a> <a href="/data" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
Data
</a> </div> ` })}`;
}, "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/index.astro", void 0);

const $$file = "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
