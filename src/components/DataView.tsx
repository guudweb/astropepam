import { useEffect, useState } from "react";
import { type User } from '../interfaces/user.interface'
import { TableUser } from "./ListUsers/TableUser";
import { PaginationButton } from "./ListUsers/PaginationButton";

export const DataView = () => {
  const [comments, setComments] = useState<User[]>([]);
  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/getAllUsers.json?page=${page}&limit=${limit}`);
      if (!response.ok) {
        setIsLoading(false)
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      setComments(data.data);
      setIsLoading(false)
    } catch (error) {
      console.log(error);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <section className="pb-10">
      <div className="max-w-7xl px-5 lg:px-20 mx-auto mt-8">
        <div className="overflow-x-auto">
          <TableUser comments={comments} isLoading={isLoading} />
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






