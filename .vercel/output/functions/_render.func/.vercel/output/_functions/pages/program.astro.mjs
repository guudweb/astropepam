/* empty css                                */
import { c as createComponent, r as renderTemplate, f as renderComponent, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_C3pInzrF.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_Bh3sB_Lv.mjs';
import { d as db, U as Usuario } from '../chunks/_astro_db_BdnJ5_v5.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const allUsers = await db.select().from(Usuario);
  const getUsersForTurno = (day, turno) => {
    return allUsers.filter((user) => {
      const disponibilidad = typeof user.disponibilidad === "string" ? JSON.parse(user.disponibilidad) : {};
      return disponibilidad[day] && disponibilidad[day].includes(turno);
    });
  };
  const days = ["lunes", "martes", "mi\xE9rcoles", "jueves", "viernes", "s\xE1bado", "domingo"];
  const turnos = ["T1", "T2", "T3", "T4"];
  const usersDisponibilidad = {};
  days.forEach((day) => {
    usersDisponibilidad[day] = {};
    turnos.forEach((turno) => {
      usersDisponibilidad[day][turno] = getUsersForTurno(day, turno);
    });
  });
  const getWeekDates = (weekOffset2) => {
    const startOfWeek = /* @__PURE__ */ new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1 + weekOffset2 * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  let weekOffset = 0;
  let weekDates = getWeekDates(weekOffset);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "program" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container mx-auto mt-8 text-center"> <div class="flex justify-between mb-4"> <button class="bg-blue-500 text-white px-4 py-2 rounded" id="prevWeekBtn">
Semana Anterior
</button> <button class="bg-blue-500 text-white px-4 py-2 rounded" id="nextWeekBtn">
Semana Siguiente
</button> </div> <a href="/program/CalenderView"><button class="bg-green-500 text-white px-4 py-2 rounded mb-4" id="CalenderViewBtn">
Calender View
</button></a> <button class="bg-blue-500  text-white px-4 py-2 rounded mb-4" id="saveBtn">Save Changes</button> <div id="currentView"> <!-- Your current view code here --> ${days.map((day, index) => renderTemplate`<div class="mb-8"> <h2 class="text-xl font-bold mb-4 week-date"> ${day.charAt(0).toUpperCase() + day.slice(1)} - ${weekDates[index].toLocaleDateString()} </h2> <table> ${turnos.map((turno) => renderTemplate`<tr> <td class="px-4 py-2 border-b">${turno}</td> <td class="px-4 py-2 border-b"> ${[...Array(4)].map((_, index2) => renderTemplate`<div class="inline-block mr-2"> <select class="border border-gray-300 rounded px-2 py-1"${addAttribute(day, "data-day")}${addAttribute(turno, "data-turno")}${addAttribute(index2, "data-index")}> <option value="">No disponible</option> ${usersDisponibilidad[day][turno].map(({ nombre }) => renderTemplate`<option${addAttribute(nombre, "value")}>${nombre}</option>`)} <option value="add">Añadir usuario</option> </select> </div>`)} </td> </tr>`)} </table> </div>`)} </div> <!-- Modal --> <div id="userModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden"> <div class="bg-white p-4 rounded shadow-lg"> <h2 class="text-xl mb-4">Seleccionar Usuario</h2> <ul id="userList" class="max-h-60 overflow-y-auto"> ${allUsers.map((user) => renderTemplate`<li class="mb-2"> <button class="bg-blue-500 text-white px-2 py-1 rounded user-select-btn"${addAttribute(user.nombre, "data-username")}> ${user.nombre} </button> </li>`)} </ul> <button class="mt-4 bg-red-500 text-white px-4 py-2 rounded" id="closeModalBtn">
Cerrar
</button> </div> </div> </div> ` })}`;
}, "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/program/index.astro", void 0);

const $$file = "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/program/index.astro";
const $$url = "/program";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
