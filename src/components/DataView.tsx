import { TableUser } from "./ListUsers/TableUser";
import { PaginationButton } from "./ListUsers/PaginationButton";
import useFetchUsers from "../hooks/useFetchUsers";
import { Search } from "./Search";
import { useState } from "react";
import { SelectFilter } from "./ListUsers/SelectFilter";
import { DAYS, TURNS } from "../constants";


export const DataView = () => {
  const limit = 10;
  const { comments, isLoading, page, setSearchTerm, handleNextPage, handlePreviousPage, setDay, setTurn } = useFetchUsers(limit);

  const [day, setDayFilter] = useState("");
  const [turn, setTurnFilter] = useState("");

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


  return (
    <section className="pb-10">
      <div className="max-w-7xl px-5 lg:px-20 mx-auto mt-8">
        <div className="flex flex-col-reverse md:flex-row justify-between md:items-center mb-5 gap-y-5">
          <div className="flex gap-x-4">
            <SelectFilter 
              data={DAYS}
              onChange={handleDayChange}
              value={day}
            />

            <SelectFilter 
              data={TURNS}
              onChange={handleTurnChange}
              value={turn}
            />
          </div>
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






