// Versión JavaScript del validador de participaciones para el frontend
export class ParticipationValidatorJS {
  
  static validateUserParticipation(rules, selectedDate, userHistory = []) {
    const result = {
      canParticipate: true,
      warnings: [],
      restrictions: []
    };

    if (!rules || rules.length === 0) {
      return result;
    }

    const selectedWeek = this.getWeekOfMonth(selectedDate);

    for (const rule of rules) {
      switch (rule.type) {
        case 'max_per_month':
          this.validateMaxPerMonth(rule, selectedDate, userHistory, result);
          break;
        case 'max_per_week':
          this.validateMaxPerWeek(rule, selectedDate, userHistory, result);
          break;
        case 'specific_weeks':
          this.validateSpecificWeeks(rule, selectedWeek, result);
          break;
        case 'alternating_weeks':
          this.validateAlternatingWeeks(rule, selectedDate, userHistory, result);
          break;
      }
    }

    return result;
  }

  static validateMaxPerMonth(rule, selectedDate, userHistory, result) {
    const maxParticipations = rule.value;
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    console.log(`[DEBUG] validateMaxPerMonth - INICIO`);
    console.log(`[DEBUG] validateMaxPerMonth - Fecha seleccionada: ${selectedDate.toISOString().split('T')[0]}`);
    console.log(`[DEBUG] validateMaxPerMonth - Mes seleccionado: ${selectedMonth} (0=Enero, 11=Diciembre)`);
    console.log(`[DEBUG] validateMaxPerMonth - Año seleccionado: ${selectedYear}`);
    console.log(`[DEBUG] validateMaxPerMonth - Límite máximo: ${maxParticipations}`);
    console.log(`[DEBUG] validateMaxPerMonth - Historial completo:`, userHistory);

    // Filtrar solo participaciones pasadas y actuales (no futuras)
    const currentDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    const monthParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      const pDateOnly = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
      
      console.log(`[DEBUG] Evaluando participación: ${p.date}`);
      console.log(`  - Fecha participación: ${pDateOnly.toISOString().split('T')[0]}`);
      console.log(`  - Fecha seleccionada: ${currentDateOnly.toISOString().split('T')[0]}`);
      console.log(`  - ¿Mismo mes/año?: ${pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear}`);
      console.log(`  - ¿Es pasada o actual?: ${pDateOnly <= currentDateOnly}`);
      
      // Solo contar participaciones del mismo mes/año que sean pasadas o la fecha actual
      const isSameMonth = pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear;
      const isPastOrCurrent = pDateOnly <= currentDateOnly;
      
      return isSameMonth && isPastOrCurrent;
    });

    console.log(`[DEBUG] validateMaxPerMonth - Participaciones válidas del mes:`, monthParticipations);
    console.log(`[DEBUG] validateMaxPerMonth - Cantidad actual: ${monthParticipations.length}`);
    console.log(`[DEBUG] validateMaxPerMonth - ¿Alcanzó límite?: ${monthParticipations.length >= maxParticipations}`);

    if (monthParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(`Ya alcanzó el límite de ${maxParticipations} participaciones este mes (actual: ${monthParticipations.length})`);
    } else if (monthParticipations.length === maxParticipations - 1) {
      result.warnings.push(`Esta será su última participación permitida este mes (${monthParticipations.length + 1}/${maxParticipations})`);
    }

    console.log(`[DEBUG] validateMaxPerMonth - Resultado: canParticipate=${result.canParticipate}`);
    console.log(`[DEBUG] validateMaxPerMonth - FIN`);
  }

  static validateMaxPerWeek(rule, selectedDate, userHistory, result) {
    const maxParticipations = rule.value;
    const weekStart = this.getWeekStart(new Date(selectedDate));
    const weekEnd = this.getWeekEnd(new Date(selectedDate));
    const currentDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    console.log(`[DEBUG] validateMaxPerWeek - INICIO`);
    console.log(`[DEBUG] validateMaxPerWeek - Fecha seleccionada: ${selectedDate.toISOString().split('T')[0]}`);
    console.log(`[DEBUG] validateMaxPerWeek - Semana inicio: ${weekStart.toISOString().split('T')[0]}`);
    console.log(`[DEBUG] validateMaxPerWeek - Semana fin: ${weekEnd.toISOString().split('T')[0]}`);
    console.log(`[DEBUG] validateMaxPerWeek - Límite máximo: ${maxParticipations}`);

    const weekParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      const pDateOnly = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
      
      const isInWeek = pDate >= weekStart && pDate <= weekEnd;
      const isPastOrCurrent = pDateOnly <= currentDateOnly;
      
      console.log(`[DEBUG] Evaluando participación semanal: ${p.date}, ¿En semana?: ${isInWeek}, ¿Pasada/actual?: ${isPastOrCurrent}`);
      
      return isInWeek && isPastOrCurrent;
    });

    console.log(`[DEBUG] validateMaxPerWeek - Participaciones válidas de la semana:`, weekParticipations);
    console.log(`[DEBUG] validateMaxPerWeek - Cantidad actual: ${weekParticipations.length}`);

    if (weekParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(`Ya alcanzó el límite de ${maxParticipations} participaciones esta semana (actual: ${weekParticipations.length})`);
    } else if (weekParticipations.length === maxParticipations - 1) {
      result.warnings.push(`Esta será su última participación permitida esta semana (${weekParticipations.length + 1}/${maxParticipations})`);
    }

    console.log(`[DEBUG] validateMaxPerWeek - Resultado: canParticipate=${result.canParticipate}`);
    console.log(`[DEBUG] validateMaxPerWeek - FIN`);
  }

  static validateSpecificWeeks(rule, selectedWeek, result) {
    const allowedWeeks = Array.isArray(rule.value) ? rule.value : [rule.value];
    
    if (!allowedWeeks.includes(selectedWeek)) {
      result.canParticipate = false;
      result.restrictions.push(`Solo puede participar en las semanas: ${allowedWeeks.join(', ')}`);
    }
  }

  static validateAlternatingWeeks(rule, selectedDate, userHistory, result) {
    if (userHistory.length === 0) {
      return; // Primera participación, puede participar
    }

    // Ordenar historial por fecha (más reciente primero)
    const sortedHistory = userHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastParticipation = sortedHistory[0];
    const lastDate = new Date(lastParticipation.date);
    const selectedWeekStart = this.getWeekStart(new Date(selectedDate));
    const lastWeekStart = this.getWeekStart(new Date(lastDate));

    // Calcular la diferencia en semanas
    const diffInWeeks = Math.floor((selectedWeekStart.getTime() - lastWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    console.log(`[DEBUG] Semanas alternadas - Última participación: ${lastParticipation.date}, Semana actual: ${selectedDate.toISOString().split('T')[0]}, Diferencia: ${diffInWeeks} semanas`);

    if (diffInWeeks === 0) {
      result.canParticipate = false;
      result.restrictions.push('No puede participar dos veces en la misma semana (semanas alternadas)');
    } else if (diffInWeeks === 1) {
      result.canParticipate = false;
      result.restrictions.push('Debe esperar una semana antes de su próxima participación (semanas alternadas)');
    } else if (diffInWeeks > 1) {
      // Puede participar, pero mostrar información útil
      result.warnings.push(`Última participación: ${lastParticipation.date} (hace ${diffInWeeks} semanas)`);
    }
  }

  static getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekDay = firstDay.getDay();
    const offsetDate = date.getDate() + firstWeekDay - 1;
    return Math.floor(offsetDate / 7) + 1;
  }

  static getWeekStart(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    const newDate = new Date(date);
    newDate.setDate(diff);
    return newDate;
  }

  static getWeekEnd(date) {
    const weekStart = this.getWeekStart(new Date(date));
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  }

  static getUserStatusIcon(rules, selectedDate, userHistory = []) {
    if (!rules || rules.length === 0) {
      return '✅'; // Sin restricciones
    }

    const validation = this.validateUserParticipation(rules, selectedDate, userHistory);
    
    if (!validation.canParticipate) {
      return '🚫'; // No puede participar
    } else if (validation.warnings.length > 0) {
      return '⚠️'; // Puede participar pero con advertencias
    } else {
      return '✅'; // Puede participar sin problemas
    }
  }

  static getRuleDescription(rule) {
    switch (rule.type) {
      case 'max_per_month':
        return `Máximo ${rule.value} ${rule.value === 1 ? 'vez' : 'veces'} al mes`;
      case 'max_per_week':
        return `Máximo ${rule.value} ${rule.value === 1 ? 'vez' : 'veces'} por semana`;
      case 'specific_weeks':
        const weeks = Array.isArray(rule.value) ? rule.value : [rule.value];
        return `Solo semanas: ${weeks.join(', ')}`;
      case 'alternating_weeks':
        return 'Semanas alternadas (una sí, una no)';
      default:
        return rule.description || '';
    }
  }

  // Función para obtener historial de participaciones vía API
  static async getUserParticipationHistory(userName, fromDate = null) {
    try {
      const url = new URL('/api/getUserParticipationHistory.json', window.location.origin);
      url.searchParams.append('userName', userName);
      if (fromDate) {
        url.searchParams.append('fromDate', fromDate.toISOString().split('T')[0]);
      }

      console.log(`[DEBUG CLIENT] Calling API: ${url.toString()}`);
      console.log(`[DEBUG CLIENT] Buscando historia para: "${userName}"`);
      
      const response = await fetch(url.toString());
      console.log(`[DEBUG CLIENT] API response status:`, response.status);
      
      if (!response.ok) {
        console.error(`[DEBUG CLIENT] API error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`[DEBUG CLIENT] API response data:`, data);
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user participation history:', error);
      return [];
    }
  }

  // Función principal para validar en tiempo real
  static async validateUserForDate(userName, participationRules, selectedDate) {
    const rules = typeof participationRules === 'string' 
      ? JSON.parse(participationRules) 
      : participationRules;

    if (!rules || rules.length === 0) {
      return {
        canParticipate: true,
        warnings: [],
        restrictions: [],
        icon: '✅'
      };
    }

    const userHistory = await this.getUserParticipationHistory(userName);
    console.log(`[DEBUG] ${userName} - Historia completa recibida:`, userHistory);
    console.log(`[DEBUG] ${userName} - Total registros en historia:`, userHistory.length);
    console.log(`[DEBUG] ${userName} - Fecha seleccionada:`, selectedDate.toISOString().split('T')[0]);
    console.log(`[DEBUG] ${userName} - Fecha objeto:`, selectedDate);
    console.log(`[DEBUG] ${userName} - Mes de fecha (0-indexado):`, selectedDate.getMonth(), '(debería ser 5 para junio)');
    console.log(`[DEBUG] ${userName} - Año de fecha:`, selectedDate.getFullYear());
    console.log(`[DEBUG] ${userName} - Reglas de participación:`, rules);
    
    const validation = this.validateUserParticipation(rules, selectedDate, userHistory);
    
    console.log(`[DEBUG] ${userName} - Resultado de validación:`, validation);
    console.log(`[DEBUG] ${userName} - ¿Puede participar?:`, validation.canParticipate);
    console.log(`[DEBUG] ${userName} - Advertencias:`, validation.warnings);
    console.log(`[DEBUG] ${userName} - Restricciones:`, validation.restrictions);
    
    const result = {
      ...validation,
      icon: this.getUserStatusIcon(rules, selectedDate, userHistory),
      rulesDescription: rules.map(rule => this.getRuleDescription(rule))
    };
    
    console.log(`[DEBUG] ${userName} - Resultado final:`, result);
    
    return result;
  }
}