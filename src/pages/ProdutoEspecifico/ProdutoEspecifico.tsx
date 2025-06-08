import React, { useState, useEffect } from "react";
import {
  Box,
  Image,
  Flex,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  Badge,
  useToast,
  Spinner,
  useDisclosure
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarrinho } from "../../components/Carrinho/CarrinhoContext.tsx";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  status: string;
  categoria: string;
  descricao: string;
  imagens: string[];
}

const ProdutoEspecifico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarProduto } = useCarrinho();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [imagemSelecionada, setImagemSelecionada] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("userToken");

    if (token) {
      setIsLoggedIn(true);
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        if (decodedPayload.perfil === "Admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        setIsAdmin(false);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    const fetchProduto = async () => {
      try {
        const response = await fetch(`http://localhost:5000/produtos/getprodid/${id}`);

        if (!response.ok) {
          throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();
        const parsedPreco = Number(data.preco);
        const formattedData = {
          ...data,
          preco: parsedPreco,
          imagens: Array.isArray(data.imagens) ? data.imagens : (data.imagens ? [data.imagens] : [])
        };
        if (!data || !data.nome || isNaN(parsedPreco) || parsedPreco <= 0) {
          throw new Error("Dados do produto incompletos ou inválidos.");
        }

        setProduto(formattedData);
        if (formattedData.imagens.length > 0) {
          setImagemSelecionada(formattedData.imagens[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        toast({
          title: "Erro ao carregar produto",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id, toast]);

  const getImageUrl = (imagemId: string) => {
    return `http://localhost:5000/imagens/${imagemId}`;
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={5} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (!produto) {
    return (
      <Box p={5} textAlign="center">
        <Text>Produto não encontrado</Text>
      </Box>
    );
  }

  return (
    <Box py={5}>
      <Box p={5} maxW="container.xl" mx="auto">
        <Flex direction={{ base: "column", md: "row" }} gap={8}>

          <Box flex={1}>
            <Image
              src={getImageUrl(imagemSelecionada)}
              alt={produto.nome}
              w="100%"
              maxH="500px"
              objectFit="contain"
              borderRadius="lg"
              fallbackSrc="/placeholder-image.jpg"
            />
            <Flex mt={4} gap={2} wrap="wrap">
              {produto.imagens.map((img, idx) => (
                <Image
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`Imagem ${idx + 1} de ${produto.nome}`}
                  boxSize="80px"
                  objectFit="cover"
                  cursor="pointer"
                  borderRadius="md"
                  border={img === imagemSelecionada ? "2px solid blue" : "1px solid gray"}
                  onClick={() => setImagemSelecionada(img)}
                  _hover={{ borderColor: "blue.300" }}
                />
              ))}
            </Flex>
          </Box>

          <Box flex={1}>
            <VStack align="start" spacing={4}>
              {isAdmin && (
                <Flex w="100%" justify="space-between" align="center">
                  <Text fontSize="2xl" fontWeight="bold">{produto.nome}</Text>
                  <HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => navigate(`/produtos/editprod/${produto.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => navigate(`/produtos/deleteprod/${produto.id}`)}
                    >
                      Excluir
                    </Button>
                  </HStack>
                </Flex>)}

              <Badge
                colorScheme={produto.status === "Disponível" ? "green" : "red"}
                fontSize="md"
                px={2}
                py={1}
              >
                {produto.status}
              </Badge>
              <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                R$ {typeof produto.preco === "number" ? produto.preco.toFixed(2) : "Preço indisponível"}
              </Text>
              <Text fontSize="lg" fontWeight="semibold">Descrição</Text>
              <Text whiteSpace="pre-line">{produto.descricao}</Text>
              <Divider />
              <Text fontSize="sm" color="gray.500">
                Categoria: {produto.categoria}
              </Text>
              {isLoggedIn && (
                <HStack spacing={4} mt={4} w="100%">
                  {produto.status === "Disponível" && (
                    <Button
                      colorScheme="blue"
                      size="lg"
                      flex={1}
                      onClick={() => {
                        adicionarProduto({
                          id: produto.id,
                          nome: produto.nome,
                          preco: produto.preco,
                          imagens: produto.imagens,
                          quantidade: 1
                        });
                        toast({
                          title: "Produto adicionado ao carrinho!",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                        navigate('/carrinho');
                      }}
                    >
                      Adicionar ao Carrinho
                    </Button>
                  )}
                </HStack>
              )}
            </VStack>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default ProdutoEspecifico;