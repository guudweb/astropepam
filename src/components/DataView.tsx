import { useState } from "react";
import {
  PaginationButton,
  PDFExporter,
  PrivilegeFilter,
  Search,
  SelectFilter,
  TableUser,
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
  } = useFetchUsers(limit);

  const [day, setDayFilter] = useState("");
  const [turn, setTurnFilter] = useState("");
  const [active, setActive] = useState("");
  const [privileges, setPrivileges] = useState<string[]>([]);
  const [searchTermState, setSearchTermState] = useState("");

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

  return (
    <section className="pb-10">
      <div className="max-w-7xl px-5 lg:px-20 mx-auto mt-8">
        <div className="flex flex-col-reverse md:flex-row justify-between md:items-center mb-5 gap-y-5">
          <div className="flex flex-wrap gap-4">
            <SelectFilter data={DAYS} onChange={handleDayChange} value={day} />

            <SelectFilter
              data={TURNS}
              onChange={handleTurnChange}
              value={turn}
            />
            
            <PrivilegeFilter 
              onChange={handlePrivilegesChange}
              value={privileges}
            />
          </div>
          <div className="flex gap-4 flex-wrap items-center">
            <select
              value={active}
              onChange={handleActiveChange}
              className="border p-2 rounded"
            >
              <option value="">Selecciona disponibilidad</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
            <Search onChange={handleSearchChange} />
            <PDFExporter 
              users={comments}
              currentFilters={{
                searchTerm: searchTermState || undefined,
                day: day || undefined,
                turn: turn || undefined,
                isActive: active === "true" ? true : active === "false" ? false : null,
                privileges: privileges.length > 0 ? privileges : undefined
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <TableUser
            comments={comments}
            isLoading={isLoading}
            isAdmin={isAdmin}
          />
          {comments.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 mt-4">
              No se encontraron resultados.
            </p>
          )}
          <footer className="flex items-start gap-2">
            <PaginationButton
              disabled={page === 1}
              onClick={handlePreviousPage}
              text="Anterior"
            />
            <PaginationButton
              disabled={comments.length < limit}
              onClick={handleNextPage}
              text="Siguiente"
            />
          </footer>
        </div>
      </div>
    </section>
  );
};
