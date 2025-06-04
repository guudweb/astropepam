import { useState, useEffect } from 'react';
import type { ParticipationRule } from '@/interfaces/user.interface';

interface ParticipationRulesProps {
  rules: ParticipationRule[];
  onChange: (rules: ParticipationRule[]) => void;
  isReadOnly?: boolean;
}

export const ParticipationRules: React.FC<ParticipationRulesProps> = ({ 
  rules = [], 
  onChange,
  isReadOnly = false 
}) => {
  const [localRules, setLocalRules] = useState<ParticipationRule[]>(rules);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleType, setNewRuleType] = useState<ParticipationRule['type']>('max_per_month');
  const [newRuleValue, setNewRuleValue] = useState<string>('');
  const [specificWeeks, setSpecificWeeks] = useState<number[]>([]);

  useEffect(() => {
    onChange(localRules);
  }, [localRules]);

  const ruleTypeLabels = {
    'max_per_month': 'Máximo por mes',
    'max_per_week': 'Máximo por semana',
    'specific_weeks': 'Semanas específicas',
    'alternating_weeks': 'Semanas alternadas'
  };

  const getRuleDescription = (rule: ParticipationRule): string => {
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
  };

  const handleAddRule = () => {
    let value: number | number[];
    let description: string;

    switch (newRuleType) {
      case 'max_per_month':
      case 'max_per_week':
        value = parseInt(newRuleValue) || 1;
        description = getRuleDescription({ type: newRuleType, value, description: '' });
        break;
      case 'specific_weeks':
        value = specificWeeks;
        description = getRuleDescription({ type: newRuleType, value, description: '' });
        break;
      case 'alternating_weeks':
        value = 1;
        description = getRuleDescription({ type: newRuleType, value, description: '' });
        break;
      default:
        return;
    }

    const newRule: ParticipationRule = {
      type: newRuleType,
      value,
      description
    };

    setLocalRules([...localRules, newRule]);
    setShowAddRule(false);
    setNewRuleValue('');
    setSpecificWeeks([]);
  };

  const handleRemoveRule = (index: number) => {
    setLocalRules(localRules.filter((_, i) => i !== index));
  };

  const toggleWeek = (week: number) => {
    setSpecificWeeks(prev => 
      prev.includes(week) 
        ? prev.filter(w => w !== week)
        : [...prev, week].sort()
    );
  };

  if (isReadOnly) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Condiciones de participación
        </label>
        {localRules.length === 0 ? (
          <p className="text-sm text-gray-500">Sin restricciones</p>
        ) : (
          <div className="space-y-2">
            {localRules.map((rule, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <span className="text-sm text-blue-700">📋 {rule.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-900">
        Condiciones de participación
      </label>
      
      {/* Reglas existentes */}
      <div className="space-y-2">
        {localRules.map((rule, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {rule.type === 'max_per_month' && '📅'}
                {rule.type === 'max_per_week' && '📆'}
                {rule.type === 'specific_weeks' && '📌'}
                {rule.type === 'alternating_weeks' && '🔄'}
              </span>
              <span className="text-sm text-gray-700">{rule.description}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveRule(index)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Formulario para añadir nueva regla */}
      {showAddRule ? (
        <div className="border border-gray-300 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de regla
            </label>
            <select
              value={newRuleType}
              onChange={(e) => setNewRuleType(e.target.value as ParticipationRule['type'])}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {Object.entries(ruleTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Campo de valor según el tipo de regla */}
          {(newRuleType === 'max_per_month' || newRuleType === 'max_per_week') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número máximo
              </label>
              <input
                type="number"
                min="1"
                value={newRuleValue}
                onChange={(e) => setNewRuleValue(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ej: 2"
              />
            </div>
          )}

          {newRuleType === 'specific_weeks' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona las semanas
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(week => (
                  <button
                    key={week}
                    type="button"
                    onClick={() => toggleWeek(week)}
                    className={`px-3 py-1 rounded ${
                      specificWeeks.includes(week)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {week}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddRule}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={
                (newRuleType === 'specific_weeks' && specificWeeks.length === 0) ||
                ((newRuleType === 'max_per_month' || newRuleType === 'max_per_week') && !newRuleValue)
              }
            >
              Guardar regla
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddRule(false);
                setNewRuleValue('');
                setSpecificWeeks([]);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddRule(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir condición
        </button>
      )}
    </div>
  );
};