import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_BUFol7H7.mjs';
import { manifest } from './manifest_DwwbhpDl.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/_---auth_.astro.mjs');
const _page2 = () => import('./pages/api/getweekdata.json.astro.mjs');
const _page3 = () => import('./pages/api/saveweekdata.json.astro.mjs');
const _page4 = () => import('./pages/data.astro.mjs');
const _page5 = () => import('./pages/login.astro.mjs');
const _page6 = () => import('./pages/program/calenderview.astro.mjs');
const _page7 = () => import('./pages/program.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["node_modules/auth-astro/src/api/[...auth].ts", _page1],
    ["src/pages/api/getWeekData.json.ts", _page2],
    ["src/pages/api/saveWeekData.json.ts", _page3],
    ["src/pages/data.astro", _page4],
    ["src/pages/login.astro", _page5],
    ["src/pages/program/CalenderView.astro", _page6],
    ["src/pages/program/index.astro", _page7],
    ["src/pages/index.astro", _page8]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "38e465b5-3a8b-4746-aa9a-700f9c6efa92",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
