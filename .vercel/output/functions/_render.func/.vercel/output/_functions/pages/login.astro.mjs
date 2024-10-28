/* empty css                                */
import { c as createComponent, r as renderTemplate, m as maybeRenderHead, e as createAstro, f as renderComponent } from '../chunks/astro/server_C3pInzrF.mjs';
import 'kleur/colors';
import 'clsx';
import { d as db, U as Usuario } from '../chunks/_astro_db_BdnJ5_v5.mjs';
import { $ as $$Layout } from '../chunks/Layout_Bh3sB_Lv.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$LoginForm = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$LoginForm;
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const correo = formData.get("correo");
    const telefono = formData.get("telefono");
    const nombre = formData.get("nombre");
    const contrase\u00F1a = formData.get("contrase\xF1a");
    const congregacion = formData.get("congregacion");
    const estado_civil = formData.get("estado_civil");
    const nombre_conyuge = formData.get("nombre_conyuge");
    const sexo = formData.get("sexo");
    const role = formData.get("role");
    const privilegios = formData.getAll("privilegios");
    const disponibilidad = {
      lunes: formData.getAll("lunes_turnos"),
      martes: formData.getAll("martes_turnos"),
      miercoles: formData.getAll("miercoles_turnos"),
      jueves: formData.getAll("jueves_turnos"),
      viernes: formData.getAll("viernes_turnos"),
      sabado: formData.getAll("sabado_turnos"),
      domingo: formData.getAll("domingo_turnos")
    };
    console.log("Form Data:", { correo, telefono, nombre, contrase\u00F1a, congregacion, estado_civil, nombre_conyuge, sexo, role, privilegios, disponibilidad });
    if (typeof correo === "string" && typeof telefono === "string" && typeof nombre === "string" && typeof contrase\u00F1a === "string" && typeof sexo === "string" && typeof role === "string") {
      try {
        await db.insert(Usuario).values({
          correo,
          telefono: parseInt(telefono, 10),
          // Convert to number
          nombre,
          contrase\u00F1a,
          congregacion,
          estado_civil,
          nombre_conyuge,
          sexo,
          role,
          privilegios: JSON.stringify(privilegios),
          // Store as JSON string
          disponibilidad: JSON.stringify(disponibilidad)
          // Store as JSON string
        });
        console.log("Data inserted successfully");
      } catch (error) {
        console.error("Error inserting data:", error);
      }
    } else {
      console.error("Invalid form data");
    }
  }
  return renderTemplate`${maybeRenderHead()}<div class="mx-auto mt-9 w-full max-w-2xl"> <form method="POST" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 grid grid-cols-2 gap-4"> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="correo">
Correo
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="correo" name="correo" type="email" placeholder="correo" required> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="nombre">
Nombre
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="nombre" name="nombre" type="text" placeholder="nombre" required> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="telefono">
Teléfono
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="telefono" name="telefono" type="text" placeholder="telefono" required> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="contraseña">
Contraseña
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="contraseña" name="contraseña" type="password" placeholder="**********" required> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="congregacion">
Congregación
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="congregacion" name="congregacion" type="text" placeholder="congregación"> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="estado_civil">
Estado Civil
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="estado_civil" name="estado_civil" type="text" placeholder="estado civil"> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2" for="nombre_conyuge">
Nombre del Cónyuge
</label> <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="nombre_conyuge" name="nombre_conyuge" type="text" placeholder="nombre del cónyuge"> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2">
Sexo
</label> <div class="flex items-center"> <label class="mr-4"> <input type="radio" name="sexo" value="M" required> M
</label> <label> <input type="radio" name="sexo" value="F" required> F
</label> </div> </div> <div class="mb-4"> <label class="block text-gray-700 text-sm font-bold mb-2">
Role
</label> <div class="flex items-center"> <label class="mr-4"> <input type="radio" name="role" value="admin" required> Admin
</label> <label class="mr-4"> <input type="radio" name="role" value="superadmin" required> Superadmin
</label> <label> <input type="radio" name="role" value="user" required> User
</label> </div> </div> <div class="mb-4 col-span-2"> <label class="block text-gray-700 text-sm font-bold mb-2">
Privilegios
</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="privilegios" value="Precursor"> Precursor
</label> <label class="mr-4"> <input type="checkbox" name="privilegios" value="Anciano"> Anciano
</label> <label class="mr-4"> <input type="checkbox" name="privilegios" value="Siervo"> Siervo
</label> <label> <input type="checkbox" name="privilegios" value="Otro"> Otro
</label> </div> </div> <!-- Disponibilidad fields --> <div class="mb-4 col-span-2"> <label class="block text-gray-700 text-sm font-bold mb-2">
Disponibilidad
</label> <div class="grid grid-cols-2 gap-4"> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Lunes</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="lunes_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="lunes_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="lunes_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="lunes_turnos" value="T4"> T4
</label> </div> </div> <!-- Tuesday --> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Martes</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="martes_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="martes_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="martes_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="martes_turnos" value="T4"> T4
</label> </div> </div> <!-- Wednesday --> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Miércoles</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="miercoles_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="miercoles_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="miercoles_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="miercoles_turnos" value="T4"> T4
</label> </div> </div> <!-- Thursday --> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Jueves</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="jueves_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="jueves_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="jueves_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="jueves_turnos" value="T4"> T4
</label> </div> </div> <!-- Friday --> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Viernes</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="viernes_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="viernes_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="viernes_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="viernes_turnos" value="T4"> T4
</label> </div> </div> <!-- Saturday --> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Sábado</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="sabado_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="sabado_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="sabado_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="sabado_turnos" value="T4"> T4
</label> </div> </div> <!-- Sunday --> <div> <label class="block text-gray-700 text-sm font-bold mb-2">Domingo</label> <div class="flex flex-wrap"> <label class="mr-4"> <input type="checkbox" name="domingo_turnos" value="T1"> T1
</label> <label class="mr-4"> <input type="checkbox" name="domingo_turnos" value="T2"> T2
</label> <label class="mr-4"> <input type="checkbox" name="domingo_turnos" value="T3"> T3
</label> <label> <input type="checkbox" name="domingo_turnos" value="T4"> T4
</label> </div> </div> </div> </div> <div class="col-span-2 flex items-center justify-between"> <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
Submit
</button> </div> </form> </div>`;
}, "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/components/LoginForm.astro", void 0);

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "login" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "LoginForm", $$LoginForm, {})} ` })}`;
}, "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/login.astro", void 0);

const $$file = "C:/Users/lenovo/Documents/web/astroauth/astrowithauthjs/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
