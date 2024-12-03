// src/hooks/useFetchUsers.ts
import { useEffect, useState } from "react";
import { type User } from "../interfaces/user.interface"; // Ajusta la ruta según tu estructura de carpetas

const useFetchUsers = (limit: number) => {
  const [comments, setComments] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [day, setDay] = useState<string | null>(null);
  const [turn, setTurn] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  // Función principal de obtención de datos
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/getAllUsers.json?page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActive = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/checkDisponibilityOfUser?isActive=${isActive}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de búsqueda por término
  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/searchUser.json?q=${searchTerm}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Nueva función para filtrar por día y turno
  const filterUsers = async () => {
    setIsLoading(true);
    try {
      const url = new URL(`/api/getFilteredUser.json`, window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (searchTerm) url.searchParams.append("q", searchTerm);
      if (day) url.searchParams.append("day", day);
      if (turn) url.searchParams.append("turn", turn);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const disponibilityUsers = async () => {
    setIsLoading(true);
    try {
      const url = new URL(
        `/api/getUsersByAvailability`,
        window.location.origin
      );
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      if (isActive !== null)
        url.searchParams.append("isActive", isActive.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lógica principal de selección de la función a ejecutar
  useEffect(() => {
    if (day || turn) {
      filterUsers();
    } else if (searchTerm) {
      fetchSearchResults();
    } else if (isActive !== null) {
      fetchActive(); // Cambiar a la función adecuada
    } else {
      fetchData();
    }
  }, [searchTerm, day, turn, isActive, page]);

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reinicia la página a 1 en cada búsqueda
  };

  const handleDayChange = (selectedDay: string) => {
    setDay(selectedDay);
    setPage(1); // Reinicia la página a 1 al cambiar el día
  };

  const handleTurnChange = (selectedTurn: string) => {
    setTurn(selectedTurn);
    setPage(1); // Reinicia la página a 1 al cambiar el turno
  };

  const handleActiveChange = (setActive: boolean) => {
    setIsActive(setActive);
    setPage(1); // Reinicia la página a 1 al cambiar el turno
  };

  return {
    comments,
    isLoading,
    page,
    setSearchTerm: handleSearchTermChange,
    setDay: handleDayChange,
    setTurn: handleTurnChange,
    setIsActive: handleActiveChange,
    handleNextPage,
    handlePreviousPage,
  };
};

export default useFetchUsers;
