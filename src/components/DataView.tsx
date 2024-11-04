import { TableUser } from "./ListUsers/TableUser";
import { PaginationButton } from "./ListUsers/PaginationButton";
import useFetchUsers from "../hooks/useFetchUsers";
import { Search } from "./Search";


export const DataView = () => {
  const limit = 10;
  const { comments, isLoading, page, setSearchTerm, handleNextPage, handlePreviousPage } = useFetchUsers(limit); // Usa el hook
  return (
    <section className="pb-10">
      <div className="max-w-7xl px-5 lg:px-20 mx-auto mt-8">
        <Search onChange={(e) => setSearchTerm(e.target.value)}/>
        <div className="overflow-x-auto">
          <TableUser comments={comments} isLoading={isLoading} />
          {comments.length === 0 && (
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






