import { useState } from "react";
import {
  PaginationButton,
  PDFExporter,
  PrivilegeFilter,
  Search,
  SelectFilter,
  TableUser,
  CongregationFilter,
} from "@/components/index";
import { DAYS, TURNS } from "@/constants/index";
import { useFetchUsers } from "@/hooks/index";

interface DataViewProps {
  isAdmin?: boolean;
}

export const DataView = ({ isAdmin }: DataViewProps) => {
  const limit = 10;
  const {
    comments,
    isLoading,
    page,
    setSearchTerm,
    handleNextPage,
    handlePreviousPage,
    setDay,
    setTurn,
    setIsActive,
    setPrivileges: setPrivilegesFilter,
    setServiceLink: setServiceLinkFilter,
    setCongregations: setCongregationsFilter,
  } = useFetchUsers(limit);

  const [day, setDayFilter] = useState("");
  const [turn, setTurnFilter] = useState("");
  const [active, setActive] = useState("");
  const [privileges, setPrivileges] = useState<string[]>([]);
  const [searchTermState, setSearchTermState] = useState("");
  const [serviceLink, setServiceLink] = useState("");
  const [congregations, setCongregations] = useState<string[]>([]);

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDay = e.target.value;
    setDayFilter(selectedDay);
    setDay(selectedDay);
  };

  const handleTurnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTurn = e.target.value;
    setTurnFilter(selectedTurn);
    setTurn(selectedTurn);
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedActive = e.target.value;
    setActive(selectedActive);
    setIsActive(
      selectedActive === "true"
        ? true
        : selectedActive === "false"
        ? false
        : null
    );
  };

  const handlePrivilegesChange = (selectedPrivileges: string[]) => {
    setPrivileges(selectedPrivileges);
    setPrivilegesFilter(selectedPrivileges);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTermState(value);
    setSearchTerm(value);
  };

  const handleServiceLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceLink = e.target.value;
    setServiceLink(selectedServiceLink);
    setServiceLinkFilter(
      selectedServiceLink === "true"
        ? true
        : selectedServiceLink === "false"
        ? false
        : null
    );
  };

  const handleCongregationsChange = (selectedCongregations: string[]) => {
    setCongregations(selectedCongregations);
    setCongregationsFilter(selectedCongregations);
  };

  return (
    <section className="pb-10">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto mt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra y filtra los usuarios del sistema</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </h2>
              <button
                onClick={() => {
                  setDayFilter("");
                  setTurnFilter("");
                  setActive("");
                  setServiceLink("");
                  setPrivileges([]);
                  setCongregations([]);
                  setSearchTermState("");
                  setDay("");
                  setTurn("");
                  setIsActive(null);
                  setServiceLinkFilter(null);
                  setPrivilegesFilter([]);
                  setCongregationsFilter([]);
                  setSearchTerm("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar filtros
              </button>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {/* Availability Filters */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Disponibilidad</h3>
                <SelectFilter data={DAYS} onChange={handleDayChange} value={day} />
                <SelectFilter data={TURNS} onChange={handleTurnChange} value={turn} />
              </div>

              {/* User Type Filters */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Tipo de Usuario</h3>
                <PrivilegeFilter onChange={handlePrivilegesChange} value={privileges} />
                <CongregationFilter onChange={handleCongregationsChange} value={congregations} />
              </div>

              {/* Status Filters */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Estado</h3>
                <select
                  value={active}
                  onChange={handleActiveChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Estado de actividad</option>
                  <option value="true">✅ Activo</option>
                  <option value="false">❌ Inactivo</option>
                </select>
                <select
                  value={serviceLink}
                  onChange={handleServiceLinkChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Servicio de enlace</option>
                  <option value="true">🟢 Habilitado</option>
                  <option value="false">🔴 Deshabilitado</option>
                </select>
              </div>

              {/* Search and Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Búsqueda y Acciones</h3>
                <Search onChange={handleSearchChange} />
                <PDFExporter 
                  users={comments}
                  currentFilters={{
                    searchTerm: searchTermState || undefined,
                    day: day || undefined,
                    turn: turn || undefined,
                    isActive: active === "true" ? true : active === "false" ? false : null,
                    serviceLink: serviceLink === "true" ? true : serviceLink === "false" ? false : null,
                    privileges: privileges.length > 0 ? privileges : undefined,
                    congregations: congregations.length > 0 ? congregations : undefined
                  }}
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {(day || turn || active || serviceLink || privileges.length > 0 || congregations.length > 0 || searchTermState) && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-2">Filtros activos:</span>
                  {day && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Día: {day}
                      <button onClick={() => { setDayFilter(""); setDay(""); }} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                    </span>
                  )}
                  {turn && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Turno: {turn}
                      <button onClick={() => { setTurnFilter(""); setTurn(""); }} className="ml-1 text-green-600 hover:text-green-800">×</button>
                    </span>
                  )}
                  {active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {active === "true" ? "Activo" : "Inactivo"}
                      <button onClick={() => { setActive(""); setIsActive(null); }} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
                    </span>
                  )}
                  {serviceLink && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Enlace: {serviceLink === "true" ? "Habilitado" : "Deshabilitado"}
                      <button onClick={() => { setServiceLink(""); setServiceLinkFilter(null); }} className="ml-1 text-orange-600 hover:text-orange-800">×</button>
                    </span>
                  )}
                  {privileges.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Privilegios: {privileges.length}
                      <button onClick={() => { setPrivileges([]); setPrivilegesFilter([]); }} className="ml-1 text-indigo-600 hover:text-indigo-800">×</button>
                    </span>
                  )}
                  {congregations.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      Congregaciones: {congregations.length}
                      <button onClick={() => { setCongregations([]); setCongregationsFilter([]); }} className="ml-1 text-teal-600 hover:text-teal-800">×</button>
                    </span>
                  )}
                  {searchTermState && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Búsqueda: "{searchTermState}"
                      <button onClick={() => { setSearchTermState(""); setSearchTerm(""); }} className="ml-1 text-gray-600 hover:text-gray-800">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{comments.length}</span> usuarios encontrados
                  </span>
                </div>
                {comments.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold text-green-700">
                          {comments.filter(u => u.isActive).length}
                        </span> activos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold text-red-700">
                          {comments.filter(u => !u.isActive).length}
                        </span> inactivos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold text-purple-700">
                          {comments.filter(u => u.privilegios && u.privilegios.length > 0).length}
                        </span> con privilegios
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Página {page}
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <TableUser
              comments={comments}
              isLoading={isLoading}
              isAdmin={isAdmin}
            />
            {comments.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-500 mb-4">
                  Intenta ajustar tus filtros o búsqueda para encontrar los usuarios que buscas.
                </p>
                <button
                  onClick={() => {
                    setDayFilter("");
                    setTurnFilter("");
                    setActive("");
                    setServiceLink("");
                    setPrivileges([]);
                    setCongregations([]);
                    setSearchTermState("");
                    setDay("");
                    setTurn("");
                    setIsActive(null);
                    setServiceLinkFilter(null);
                    setPrivilegesFilter([]);
                    setCongregationsFilter([]);
                    setSearchTerm("");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {comments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {Math.min(comments.length, limit)} de {comments.length} resultados
                </div>
                <div className="flex items-center gap-2">
                  <PaginationButton
                    disabled={page === 1}
                    onClick={handlePreviousPage}
                    text="Anterior"
                  />
                  <span className="px-3 py-1 text-sm text-gray-600">
                    {page}
                  </span>
                  <PaginationButton
                    disabled={comments.length < limit}
                    onClick={handleNextPage}
                    text="Siguiente"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
