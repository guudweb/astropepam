// src/hooks/useFetchUsers.ts
import { useEffect, useState } from "react";
import { type User } from '../interfaces/user.interface'; // Ajusta la ruta según tu estructura de carpetas

const useFetchUsers = (limit: number) => {
  const [comments, setComments] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/getAllUsers.json?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/searchUser.json?q=${searchTerm}&page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults(); // Llama a la función de búsqueda si hay un término de búsqueda
    } else {
      fetchData(); // Llama a la función de datos si no hay término de búsqueda
    }
  }, [searchTerm, page]); // Dependemos de searchTerm y page

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return {
    comments,
    isLoading,
    page,
    setSearchTerm,
    handleNextPage,
    handlePreviousPage,
  };
};

export default useFetchUsers;
