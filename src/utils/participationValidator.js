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

    const monthParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === selectedMonth && pDate.getFullYear() === selectedYear;
    });

    if (monthParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(`Ya alcanzó el límite de ${maxParticipations} participaciones este mes`);
    } else if (monthParticipations.length === maxParticipations - 1) {
      result.warnings.push(`Esta será su última participación permitida este mes`);
    }
  }

  static validateMaxPerWeek(rule, selectedDate, userHistory, result) {
    const maxParticipations = rule.value;
    const weekStart = this.getWeekStart(new Date(selectedDate));
    const weekEnd = this.getWeekEnd(new Date(selectedDate));

    const weekParticipations = userHistory.filter(p => {
      const pDate = new Date(p.date);
      return pDate >= weekStart && pDate <= weekEnd;
    });

    if (weekParticipations.length >= maxParticipations) {
      result.canParticipate = false;
      result.restrictions.push(`Ya alcanzó el límite de ${maxParticipations} participaciones esta semana`);
    } else if (weekParticipations.length === maxParticipations - 1) {
      result.warnings.push(`Esta será su última participación permitida esta semana`);
    }
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

    if (diffInWeeks === 0) {
      result.canParticipate = false;
      result.restrictions.push('No puede participar dos veces en la misma semana (semanas alternadas)');
    } else if (diffInWeeks === 1) {
      result.canParticipate = false;
      result.restrictions.push('Debe esperar una semana antes de su próxima participación (semanas alternadas)');
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

      const response = await fetch(url.toString());
      const data = await response.json();
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
    const validation = this.validateUserParticipation(rules, selectedDate, userHistory);
    
    return {
      ...validation,
      icon: this.getUserStatusIcon(rules, selectedDate, userHistory),
      rulesDescription: rules.map(rule => this.getRuleDescription(rule))
    };
  }
}