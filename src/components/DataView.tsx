import { useState } from "react";
import {
  PaginationButton,
  Search,
  SelectFilter,
  TableUser,
} from "@/components/index";
import { DAYS, TURNS } from "@/constants/index";
import { useFetchUsers } from "@/hooks/index";

export const DataView = () => {
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
  } = useFetchUsers(limit);

  const [day, setDayFilter] = useState("");
  const [turn, setTurnFilter] = useState("");
  const [active, setActive] = useState("");

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
          </div>
          <select
            value={active}
            onChange={handleActiveChange}
            className="border p-2 rounded"
          >
            <option value="">Selecciona disponibilidad</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
          <Search onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <TableUser comments={comments} isLoading={isLoading} />
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
