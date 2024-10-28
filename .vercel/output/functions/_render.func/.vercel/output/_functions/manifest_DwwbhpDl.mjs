import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_CvzvycQb.mjs';
import 'es-module-lexer';
import { g as decodeKey } from './chunks/astro/server_C3pInzrF.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/api/auth/[...auth]","pattern":"^\\/api\\/auth(?:\\/(.*?))?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"...auth","dynamic":true,"spread":true}]],"params":["...auth"],"component":"node_modules/auth-astro/src/api/[...auth].ts","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/getweekdata.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/getWeekData\\.json\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"getWeekData.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/getWeekData.json.ts","pathname":"/api/getWeekData.json","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/saveweekdata.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/saveWeekData\\.json\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"saveWeekData.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/saveWeekData.json.ts","pathname":"/api/saveWeekData.json","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/data.CB_bkveN.css"}],"routeData":{"route":"/data","isIndex":false,"type":"page","pattern":"^\\/data\\/?$","segments":[[{"content":"data","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/data.astro","pathname":"/data","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/data.CB_bkveN.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"let o=0;const s=[\"lunes\",\"martes\",\"miércoles\",\"jueves\",\"viernes\",\"sábado\",\"domingo\"],i=[\"T1\",\"T2\",\"T3\",\"T4\"],m=n=>{const t=new Date;t.setDate(t.getDate()-t.getDay()+1+n*7);const r=[];for(let e=0;e<7;e++){const a=new Date(t);a.setDate(t.getDate()+e),r.push(a)}return r},h=async n=>{try{return await(await fetch(`/api/getWeekData.json?weekOffset=${n}`)).json()}catch(t){return console.error(\"Error fetching week data:\",t),{}}},b=(n,t)=>{const r=n.getDate();return`${t.charAt(0).toUpperCase()+t.slice(1)} ${r}`},c=async()=>{const n=m(o),t=await h(o),r=document.getElementById(\"calendarView\");r.innerHTML=`\n        <div class=\"hidden md:block\">\n          <table class=\"min-w-full bg-white border border-gray-200 mb-4\">\n            <thead>\n              <tr>\n                <th class=\"px-4 py-2 border-b\">Turno</th>\n                ${n.map((e,a)=>`<th class=\"px-4 py-2 border-b\">${b(e,s[a])}</th>`).join(\"\")}\n              </tr>\n            </thead>\n            <tbody>\n              ${i.map(e=>`\n                <tr>\n                  <td class=\"px-4 py-2 border-b\">${e}</td>\n                  ${s.map(a=>`\n                    <td class=\"px-4 py-2 border-b\" data-day=\"${a}\">\n                      ${Array.from({length:4}).map((l,d)=>`<div>${t[`${a}-${e}-${d}`]||\"\"}</div>`).join(\"\")}\n                    </td>\n                  `).join(\"\")}\n                </tr>\n              `).join(\"\")}\n            </tbody>\n          </table>\n        </div>\n        <div class=\"md:hidden\">\n          ${s.map(e=>`\n            <div class=\"mb-4\">\n              <h2 class=\"text-lg font-bold mb-2\">${e.charAt(0).toUpperCase()+e.slice(1)}</h2>\n              <table class=\"min-w-full bg-white border border-gray-200 mb-4\">\n                <thead>\n                  <tr>\n                    <th class=\"px-4 py-2 border-b\">Turno</th>\n                    <th class=\"px-4 py-2 border-b\">${b(n[s.indexOf(e)],e)}</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  ${i.map(a=>`\n                    <tr>\n                      <td class=\"px-4 py-2 border-b\">${a}</td>\n                      <td class=\"px-4 py-2 border-b\">\n                        ${Array.from({length:4}).map((l,d)=>`<div>${t[`${e}-${a}-${d}`]||\"\"}</div>`).join(\"\")}\n                      </td>\n                    </tr>\n                  `).join(\"\")}\n                </tbody>\n              </table>\n            </div>\n          `).join(\"\")}\n        </div>\n      `};document.addEventListener(\"DOMContentLoaded\",()=>{const n=document.getElementById(\"prevWeekBtn\"),t=document.getElementById(\"nextWeekBtn\");n.addEventListener(\"click\",()=>{o--,c()}),t.addEventListener(\"click\",()=>{o++,c()}),c(),document.querySelectorAll(\".day-btn\").forEach(e=>{e.addEventListener(\"click\",()=>{const a=e.dataset.day;document.querySelector(`td[data-day=\"${a}\"]`).scrollIntoView({behavior:\"smooth\"})})})});\n"}],"styles":[{"type":"external","src":"/_astro/data.CB_bkveN.css"}],"routeData":{"route":"/program/calenderview","isIndex":false,"type":"page","pattern":"^\\/program\\/CalenderView\\/?$","segments":[[{"content":"program","dynamic":false,"spread":false}],[{"content":"CalenderView","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/program/CalenderView.astro","pathname":"/program/CalenderView","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"inline","value":"let r=0;const v=[\"lunes\",\"martes\",\"miércoles\",\"jueves\",\"viernes\",\"sábado\",\"domingo\"],g=async()=>{try{const e=await(await fetch(`/api/getWeekData.json?weekOffset=${r}`)).json();console.log(\"Fetched data:\",e),document.querySelectorAll(\"select\").forEach(t=>{const a=t.dataset.day,o=t.dataset.turno,l=t.dataset.index,u=e[`${a}-${o}-${l}`]||\"\";console.log(`Setting value for ${a}-${o}-${l}: ${u}`),t.value=u})}catch(n){console.error(\"Error loading week data:\",n)}},f=async()=>{const n={};document.querySelectorAll(\"select\").forEach(e=>{const t=e.dataset.day,a=e.dataset.turno,o=e.dataset.index;n[`${t}-${a}-${o}`]=e.value}),await fetch(\"/api/saveWeekData.json\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({weekOffset:r,weekData:n})})},E=()=>{const n=B(r);document.querySelectorAll(\".week-date\").forEach((e,t)=>{e.textContent=`${v[t].charAt(0).toUpperCase()+v[t].slice(1)} - ${n[t].toLocaleDateString()}`})},B=n=>{const e=new Date;e.setDate(e.getDate()-e.getDay()+1+n*7);const t=[];for(let a=0;a<7;a++){const o=new Date(e);o.setDate(e.getDate()+a),t.push(o)}return t};document.addEventListener(\"DOMContentLoaded\",async()=>{console.log(\"DOM fully loaded and parsed\"),await g();const n=document.getElementById(\"prevWeekBtn\"),e=document.getElementById(\"nextWeekBtn\"),t=document.getElementById(\"saveBtn\");n.addEventListener(\"click\",async()=>{r-=1,E(),await g()}),e.addEventListener(\"click\",async()=>{r+=1,E(),await g()}),t.addEventListener(\"click\",async()=>{await f()});const a=document.getElementById(\"userModal\"),o=document.getElementById(\"closeModalBtn\"),l=document.querySelectorAll(\".user-select-btn\");document.querySelectorAll(\"select\").forEach(s=>{s.addEventListener(\"change\",i=>{if(i.target.value===\"add\"){const c=s.dataset.day,d=s.dataset.turno,y=s.dataset.index;a.classList.remove(\"hidden\"),a.dataset.day=c,a.dataset.turno=d,a.dataset.index=y}})}),o.addEventListener(\"click\",()=>{a.classList.add(\"hidden\")}),l.forEach(s=>{s.addEventListener(\"click\",i=>{const c=i.target.dataset.username,d=document.getElementById(\"userModal\"),y=d.dataset.day,h=d.dataset.turno,p=d.dataset.index,k=document.querySelector(`select[data-day=\"${y}\"][data-turno=\"${h}\"][data-index=\"${p}\"]`),m=document.createElement(\"option\");m.value=c,m.text=c,k.appendChild(m),k.value=c,d.classList.add(\"hidden\")})})});\n"}],"styles":[{"type":"external","src":"/_astro/data.CB_bkveN.css"}],"routeData":{"route":"/program","isIndex":true,"type":"page","pattern":"^\\/program\\/?$","segments":[[{"content":"program","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/program/index.astro","pathname":"/program","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/data.CB_bkveN.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/data.astro",{"propagation":"none","containsHead":true}],["C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/login.astro",{"propagation":"none","containsHead":true}],["C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/program/CalenderView.astro",{"propagation":"none","containsHead":true}],["C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/program/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/api/getWeekData.json@_@ts":"pages/api/getweekdata.json.astro.mjs","\u0000@astro-page:src/pages/api/saveWeekData.json@_@ts":"pages/api/saveweekdata.json.astro.mjs","\u0000@astro-page:src/pages/program/CalenderView@_@astro":"pages/program/calenderview.astro.mjs","\u0000@astro-page:src/pages/program/index@_@astro":"pages/program.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:src/pages/data@_@astro":"pages/data.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:node_modules/auth-astro/src/api/[...auth]@_@ts":"pages/api/auth/_---auth_.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_DwwbhpDl.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.CVXrEKbD.js","/astro/hoisted.js?q=1":"_astro/hoisted.ZqTCAbOI.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/data.CB_bkveN.css","/favicon.svg"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"grOA4AUptCqSVkdPk47pTo9YYd2CWyUNn6mxbhwK7ZU=","experimentalEnvGetSecretEnabled":false});

export { manifest };
