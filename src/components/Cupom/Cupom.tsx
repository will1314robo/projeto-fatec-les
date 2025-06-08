import React, { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

export const useAniversariantes = () => {
  const toast = useToast();
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect: Iniciando busca de aniversariantes");
    const buscarAniversariantes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("fetch: Enviando requisição para:", "http://localhost:5000/aniversario/cupom");
        const response = await fetch("http://localhost:5000/aniversario/cupom");
        console.log("fetch: Resposta recebida:", response);

        if (!response.ok) {
          const errorText = await response.text(); 
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log("fetch: Dados JSON recebidos:", data);

        if (data.success) {
          setAniversariantes(data.aniversariantes);
          toast({
            title: "🎉 Temos aniversariantes hoje!",
            description: "Usuários estão fazendo aniversário e podem receber cupons!",
            status: "success",
            duration: 6000,
            isClosable: true,
          });
          console.log("Estado atualizado: aniversariantes e sucesso");
        } else {
          setAniversariantes([]);
          toast({
            title: "Nenhum aniversariante hoje",
            description: "Hoje não há aniversariantes cadastrados.",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
          console.log("Estado atualizado: nenhum aniversariante");
        }
      } catch (err: any) {
        console.error("Erro na busca de aniversariantes:", err);
        setError(err.message);
        toast({
          title: "Erro ao buscar aniversariantes",
          description: `Verifique sua conexão ou tente novamente mais tarde. Detalhes: ${err.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        console.log("finally: isLoading definido como false");
      }
    };

    buscarAniversariantes();
  }, [toast]);

  return { aniversariantes, isLoading, error };
};

export const ListaAniversariantes = () => {
  const { aniversariantes, isLoading, error } = useAniversariantes();

  if (isLoading) {
    return <p>Carregando aniversariantes...</p>; 
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro ao carregar os dados: {error}</p>; 
  }

  return (
    <div>
      <h1>Aniversariantes de Hoje</h1>
      {aniversariantes.length > 0 ? (
        <ul>
          {aniversariantes.map((aniversariante: any) => (
            <li key={aniversariante.id}>
              {aniversariante.nome} - {aniversariante.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum aniversariante encontrado para hoje.</p>
      )}
    </div>
  );
};