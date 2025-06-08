import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Heading,
  useToast,
  Container,
  SimpleGrid,
  Flex,
  Text,
  Image,
  HStack,
  Divider,
  Badge
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  status: string;
  categoria: string;
  descricao: string;
  imagens: string[];
}

const DeleteProduto = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProduto = async () => {
    try {
      const response = await fetch(`http://localhost:5000/produtos/getprodid/${id}`);
      const data = await response.json();

      if (response.ok) {
        const produtoComUrls = {
          ...data,
          imagens: data.imagens.map((imageId: string) => 
            `http://localhost:5000/imagens/${imageId}` 
          ),
        };
        setProduto(produtoComUrls);
      } else {
        throw new Error(data.message || "Erro ao carregar produto");
      }
    } catch (error: any) {
      toast({
        title: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  fetchProduto();
}, [id, toast, navigate]);

  const handleDelete = async () => {
    console.log("DEBUG: handleDelete foi chamado!"); 
    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:5000/produtos/deleteprod/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok || response.status === 204) { 
        toast({
          title: data.message || "Produto excluído com sucesso.", 
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });
        navigate("/");
      } else {
        throw new Error(data.message || "Erro ao excluir produto");
      }
    } catch (error: any) {
      toast({
        title: error.message || "Erro ao conectar ao servidor",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    } finally {
      setIsDeleting(false);
    }
  };

    if (isLoading) {
      return (
        <Box py={20} textAlign="center">
          <Text>Carregando produto...</Text>
        </Box>
      );
    }

    if (!produto) {
      return (
        <Box py={20} textAlign="center">
          <Text>Produto não encontrado</Text>
        </Box>
      );
    }

    return (
      <Box py={5}>
        <Container maxW="container.lg">
          <Heading mb={8} textAlign="center">Confirmar Exclusão</Heading>

          <SimpleGrid borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} bg="whiteAlpha.700">
            <VStack spacing={6} align="stretch">
              <Heading size="md" textAlign="center">Você está prestes a excluir este produto:</Heading>

              <Box p={4} borderWidth="1px" borderRadius="md">
                <HStack spacing={4} align="start">
                  {produto.imagens.length > 0 && (
                    <Image
                      src={produto.imagens[0]}
                      boxSize="150px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/150"
                    />
                  )}

                  <VStack align="start" spacing={2} flex={1}>
                    <Text fontSize="xl" fontWeight="bold">{produto.nome}</Text>
                    <Text fontSize="lg" color="blue.600">
                      {produto.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </Text>

                    <HStack>
                      <Badge colorScheme={produto.status === "Disponível" ? "green" : "red"}>
                        {produto.status}
                      </Badge>
                      <Badge colorScheme="purple">{produto.categoria}</Badge>
                    </HStack>

                    <Text fontSize="sm" color="gray.600" mt={2}>
                      {produto.descricao}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Text textAlign="center" color="red.500" fontWeight="bold">
                Esta ação não pode ser desfeita. Tem certeza que deseja continuar?
              </Text>

              <Divider />

              <Flex justifyContent="center" gap={4} mt={4}>
                <Button
                  as={RouterLink}
                  to="/"
                  colorScheme="gray"
                  width="120px"
                  isDisabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="red"
                  width="120px"
                  isLoading={isDeleting}
                  loadingText="Excluindo..."
                  onClick={handleDelete}
                >
                  Confirmar
                </Button>
              </Flex>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    );
  };

  export default DeleteProduto;