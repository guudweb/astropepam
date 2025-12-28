import { useState, useEffect } from 'react';
import type { Incidencia } from '@/interfaces/user.interface';

interface IncidenciaWithUser extends Incidencia {
  nombreUsuario?: string;
}

interface User {
  userName: string;
  nombre: string;
}

interface Props {
  isAdmin: boolean;
  currentUserName?: string;
}

export default function IncidenciasManager({ isAdmin, currentUserName }: Props) {
  const [incidencias, setIncidencias] = useState<IncidenciaWithUser[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Form state
  const [formData, setFormData] = useState({
    userName: currentUserName || '',
    fechaInicio: '',
    fechaFin: '',
    motivo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchIncidencias();
    if (isAdmin) {
      fetchUsuarios();
    }
  }, [filter]);

  const fetchIncidencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter === 'active') {
        params.append('onlyActive', 'true');
      }

      const response = await fetch(`/api/incidencias/getAll.json?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredData = data.data;

        // Si no es admin, solo mostrar las incidencias del usuario actual
        if (!isAdmin && currentUserName) {
          filteredData = filteredData.filter((i: IncidenciaWithUser) => i.userName === currentUserName);
        }

        // Si el filtro es 'inactive', mostrar solo las inactivas
        if (filter === 'inactive') {
          filteredData = filteredData.filter((i: IncidenciaWithUser) => !i.activo);
        }

        setIncidencias(filteredData);
      }
    } catch (err) {
      console.error('Error fetching incidencias:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/getAllUsers.json');
      const data = await response.json();
      if (data.data) {
        setUsuarios(data.data.map((u: any) => ({
          userName: u.userName,
          nombre: u.nombre
        })));
      }
    } catch (err) {
      console.error('Error fetching usuarios:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/incidencias/create.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creadoPor: currentUserName || 'admin'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Incidencia registrada correctamente');
        setFormData({
          userName: currentUserName || '',
          fechaInicio: '',
          fechaFin: '',
          motivo: ''
        });
        setShowModal(false);
        fetchIncidencias();
      } else {
        setError(data.error || 'Error al crear la incidencia');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Desactivar esta incidencia?')) return;

    try {
      const response = await fetch(`/api/incidencias/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchIncidencias();
      }
    } catch (err) {
      console.error('Error deleting incidencia:', err);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isActiveNow = (incidencia: IncidenciaWithUser) => {
    if (!incidencia.activo) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inicio = new Date(incidencia.fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(incidencia.fechaFin);
    fin.setHours(23, 59, 59, 999);
    return today >= inicio && today <= fin;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incidencias</h1>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin
              ? 'Gestiona las ausencias y no disponibilidades de los voluntarios'
              : 'Registra cuando no estarás disponible'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Filtros */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Activas</option>
            <option value="all">Todas</option>
            <option value="inactive">Historial</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva incidencia
          </button>
        </div>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Lista de incidencias */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : incidencias.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600">No hay incidencias {filter === 'active' ? 'activas' : ''}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {incidencias.map((incidencia) => (
            <div
              key={incidencia.id}
              className={`bg-white rounded-xl border p-4 transition-all ${
                isActiveNow(incidencia)
                  ? 'border-red-300 bg-red-50'
                  : incidencia.activo
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isActiveNow(incidencia) && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                        Activa ahora
                      </span>
                    )}
                    {!incidencia.activo && (
                      <span className="px-2 py-0.5 bg-gray-400 text-white text-xs font-medium rounded-full">
                        Finalizada
                      </span>
                    )}
                    <span className="font-semibold text-gray-800">
                      {incidencia.nombreUsuario || incidencia.userName}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2">{incidencia.motivo}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      {formatDate(incidencia.fechaInicio)} - {formatDate(incidencia.fechaFin)}
                    </span>
                    <span className="text-gray-400">
                      Registrado por: {incidencia.creadoPor}
                    </span>
                  </div>
                </div>

                {incidencia.activo && (isAdmin || incidencia.userName === currentUserName) && (
                  <button
                    onClick={() => handleDelete(incidencia.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    Desactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de nueva incidencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Nueva incidencia</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isAdmin ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voluntario
                    </label>
                    <select
                      required
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar voluntario...</option>
                      {usuarios.map((u) => (
                        <option key={u.userName} value={u.userName}>
                          {u.nombre} ({u.userName})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input type="hidden" value={currentUserName} />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaFin}
                      min={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ej: Vacaciones, enfermedad, viaje..."
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
