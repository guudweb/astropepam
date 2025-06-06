# Instrucciones para Restaurar Vista Dual (Backup)

Si necesitas revertir a las vistas separadas móvil/desktop, sigue estos pasos:

## 1. Restaurar componentes de vista

```bash
# Copiar backups
cp src/components/Program/MobileScheduleView.backup.astro src/components/Program/MobileScheduleView.astro
cp src/components/Program/DesktopScheduleView.backup.astro src/components/Program/DesktopScheduleView.astro
```

## 2. Revertir imports en index.astro

Cambiar:
```astro
import ResponsiveScheduleView from "../../components/Program/ResponsiveScheduleView.astro";
```

Por:
```astro
import MobileScheduleView from "../../components/Program/MobileScheduleView.astro";
import DesktopScheduleView from "../../components/Program/DesktopScheduleView.astro";
```

## 3. Revertir el HTML de las vistas

Cambiar:
```astro
<div id="currentView">
  <ResponsiveScheduleView 
    days={days}
    turnos={turnos}
    weekDates={weekDates}
  />
</div>
```

Por:
```astro
<div id="currentView">
  <!-- Vista Mobile -->
  <MobileScheduleView 
    days={days}
    turnos={turnos}
    weekDates={weekDates}
  />
  
  <!-- Vista Desktop -->
  <DesktopScheduleView 
    days={days}
    turnos={turnos}
    weekDates={weekDates}
  />
</div>
```

## 4. Restaurar lógica de sincronización

### En saveWeekData():
```javascript
// Determinar qué vista está activa y solo usar esos selects
const isMobile = window.innerWidth < 1024; // lg breakpoint
const viewSelector = isMobile 
  ? ".block.lg\\:hidden select.user-select" // Vista móvil
  : ".hidden.lg\\:block select.user-select"; // Vista desktop
  
console.log(`Guardando desde vista: ${isMobile ? 'móvil' : 'desktop'}`);

document.querySelectorAll(viewSelector).forEach((select) => {
```

### Restaurar función syncViewValues():
```javascript
// Function to sync values between mobile and desktop views
const syncViewValues = (sourceSelect) => {
  const day = sourceSelect.dataset.day;
  const turno = sourceSelect.dataset.turno;
  const index = sourceSelect.dataset.index;
  const value = sourceSelect.value;
  
  // Encontrar el select correspondiente en la otra vista
  const allSelects = document.querySelectorAll(`select.user-select[data-day="${day}"][data-turno="${turno}"][data-index="${index}"]`);
  
  allSelects.forEach(select => {
    if (select !== sourceSelect && select.value !== value) {
      // Solo sincronizar si el valor es diferente para evitar bucles infinitos
      select.value = value;
      console.log(`Sincronizado: ${day}-${turno}-${index} = ${value}`);
    }
  });
};
```

### Y agregar llamadas de sincronización:
```javascript
// En event listeners
syncViewValues(target);

// En modal
syncViewValues(select);
```

## 5. Archivos de backup disponibles

- `src/components/Program/MobileScheduleView.backup.astro`
- `src/components/Program/DesktopScheduleView.backup.astro`

## Beneficios de cada opción:

### Vista Unificada (Actual):
- ✅ 50% menos elementos DOM
- ✅ 50% menos memoria
- ✅ Sin duplicación de lógica
- ✅ Mejor rendimiento

### Vista Dual (Backup):
- ✅ Separación clara de layouts
- ✅ Más control granular
- ❌ Mayor consumo de recursos
- ❌ Lógica de sincronización compleja