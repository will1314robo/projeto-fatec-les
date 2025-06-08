import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Input,
  Select,
  VStack,
  Heading,
  useToast,
  Container,
  SimpleGrid,
  Flex,
  FormErrorMessage,
  Image,
  HStack,
  IconButton,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";

type Imagem = {
  id: number;
  produtoId: number;
  caminho: string;
  tipo: "url" | "upload";
  mimeType?: string;
  isLocal: boolean;
  file?: File;
};

interface Produto {
  id: string;
  nome: string;
  preco: string;
  status: "Disponível" | "Indisponível";
  categoria: string;
  descricao: string;
  imagens: Imagem[];
}

const categorias = ["Mesa", "Acessório de mesa", "Máquina", "Outros"];

const EditProduto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [prod, setProd] = useState<Produto>({
    id: "",
    nome: "",
    preco: "",
    status: "Disponível",
    categoria: "",
    descricao: "",
    imagens: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formatCurrencyForDisplay = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    let cleanValue = String(value).replace(/R\$/g, '').replace(/\s/g, '').replace(',', '.');

    const numericValue = parseFloat(cleanValue);

    if (isNaN(numericValue)) {
      return "";
    }

    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const cleanPriceValue = (value: string): string => {
    let cleaned = value.replace(/[^\d.,]/g, '');
    const commaCount = (cleaned.match(/,/g) || []).length;
    const dotCount = (cleaned.match(/\./g) || []).length;

    if (commaCount > 0 && dotCount > 0) {
      const lastCommaIndex = cleaned.lastIndexOf(',');
      const lastDotIndex = cleaned.lastIndexOf('.');

      if (lastCommaIndex > lastDotIndex) {
        cleaned = cleaned.replace(/\./g, '');
        cleaned = cleaned.replace(',', '.');
      } else {
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (commaCount > 0) {
      if (cleaned.length - 1 - cleaned.lastIndexOf(',') <= 2) {
        cleaned = cleaned.replace(',', '.');
      } else {
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    cleaned = cleaned.replace(/[^\d.]/g, '');

    if (cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }

    return cleaned;
  };

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("userToken");

        const response = await fetch(`http://localhost:5000/produtos/getprodid/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (response.ok) {
          console.log("DEBUG (Frontend - useEffect): Conteúdo COMPLETO de data.imagens recebido do backend:", data.imagens);

          const fetchedImages: Imagem[] = await Promise.all(
            (data.imagens || []).map(async (imgId: string | number) => {
              const currentImgId = String(imgId);
              console.log("DEBUG (Frontend - useEffect): Tentando buscar imagem com ID:", currentImgId, "Tipo:", typeof currentImgId);

              if (!currentImgId || currentImgId === 'null' || currentImgId === 'undefined' || currentImgId === '0') {
                console.warn("DEBUG (Frontend - useEffect): Ignorando ID de imagem inválido/vazio:", imgId);
                return null;
              }

              try {
                const imgResponse = await fetch(`http://localhost:5000/imagens/${currentImgId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                });
                if (imgResponse.ok) {
                  return {
                    id: currentImgId,
                    produtoId: Number(data.id),
                    caminho: `http://localhost:5000/imagens/${currentImgId}`,
                    tipo: "upload" as const,
                    isLocal: false,
                  };
                } else {
                  console.error(`ERRO (Frontend - useEffect): Falha ao buscar detalhes da imagem ID ${currentImgId}. Status: ${imgResponse.status}, Mensagem: ${imgResponse.statusText}`);
                  try {
                    const errorBody = await imgResponse.json();
                    console.error("ERRO DETALHADO (Frontend - useEffect):", errorBody);
                  } catch (jsonError) {
                    console.warn("DEBUG (Frontend - useEffect): Não foi possível ler o corpo do erro como JSON para ID:", currentImgId);
                  }
                  return null;
                }
              } catch (fetchErr: any) {
                console.error(`ERRO (Frontend - useEffect): Exceção ao buscar imagem ID ${currentImgId}:`, fetchErr.message);
                return null;
              }
            })
          ).then(results => results.filter(Boolean) as Imagem[]);

          console.log("DEBUG (Frontend - useEffect): Imagens carregadas do backend (FILTRADO):", fetchedImages);

          console.log("DEBUG (Frontend - useEffect): Imagens carregadas do backend:", fetchedImages);

          setProd({
            ...data,
            preco: String(data.preco),
            imagens: fetchedImages,
          });
          console.log("DEBUG (Frontend - useEffect): Estado 'prod.imagens' após carregamento:", fetchedImages);
        } else {
          console.error("Erro ao carregar produto:", data.message);
          toast({ title: "Erro ao carregar produto", description: data.message, status: "error" });
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
        toast({ title: "Erro ao carregar produto", description: "Verifique a conexão com o servidor.", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduto();
    }
  }, [id, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "preco") {
      const cleanedValue = cleanPriceValue(value);
      setProd({ ...prod, preco: cleanedValue });
    } else {
      setProd({ ...prod, [name]: value });
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const novasImagens: Imagem[] = files.map((file) => ({
      id: Date.now() + Math.random(),
      produtoId: Number(id || 0),
      caminho: URL.createObjectURL(file),
      tipo: "upload" as const,
      mimeType: file.type,
      isLocal: true,
      file,
    }));

    setProd((prev) => ({
      ...prev,
      imagens: [...prev.imagens, ...novasImagens],
    }));

    e.target.value = "";
  };

  const removeImage = (idToRemove: number) => {
    setProd((prev) => {
      const imgToRemove = prev.imagens.find(img => img.id === idToRemove);
      if (imgToRemove && imgToRemove.isLocal && imgToRemove.caminho) {
        URL.revokeObjectURL(imgToRemove.caminho);
      }
      const newImagens = prev.imagens.filter(img => img.id !== idToRemove);
      return { ...prev, imagens: newImagens };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const newErrors: Record<string, string> = {};
      if (!prod.nome) newErrors.nome = "Nome é obrigatório.";
      if (!prod.preco) {
        newErrors.preco = "Preço é obrigatório.";
      } else {
        const parsedPrice = parseFloat(prod.preco);
        if (isNaN(parsedPrice)) {
          newErrors.preco = "Preço inválido.";
        } else if (parsedPrice <= 0) {
          newErrors.preco = "Preço deve ser maior que zero.";
        }
      }
      if (!prod.categoria) newErrors.categoria = "Categoria é obrigatória.";
      if (!prod.descricao) newErrors.descricao = "Descrição é obrigatória.";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast({ title: "Por favor, corrija os erros no formulário.", status: "error" });
        setIsSubmitting(false);
        return;
      }

      console.log("DEBUG (Frontend - handleSubmit): Conteúdo atual de 'prod.imagens':", prod.imagens);

      const formData = new FormData();

      formData.append("id", prod.id);
      formData.append("nome", prod.nome);
      formData.append("preco", parseFloat(prod.preco).toFixed(2));
      formData.append("status", prod.status);
      formData.append("categoria", prod.categoria);
      formData.append("descricao", prod.descricao);

      prod.imagens
        .filter((img) => !img.isLocal)
        .forEach((img) => {
          console.log("DEBUG (Frontend - handleSubmit): Adicionando imagem existente ao FormData:", img.id);
          formData.append("imagensExistentes[]", img.id.toString());
        });

      prod.imagens
        .filter((img) => img.isLocal && img.file)
        .forEach((img) => formData.append("imagensNovas", img.file!));

      console.log("Enviando FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const token = sessionStorage.getItem("userToken");
      const response = await fetch(`http://localhost:5000/produtos/editprod/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar produto");
      }

      const data = await response.json();
      toast({
        title: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: error.message || "Erro ao atualizar produto",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10} textAlign="center">
        <Text fontSize="xl">Carregando produto...</Text>
      </Container>
    );
  }

  return (
    <Box py={5}>
      <Container maxW="container.xl">
        <Heading mb={4} textAlign="center">
          Editar Produto
        </Heading>
        <SimpleGrid
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          p={6}
          bg="whiteAlpha.700"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.nome}>
                <FormLabel>Nome do produto</FormLabel>
                <Input
                  name="nome"
                  value={prod.nome}
                  onChange={handleChange}
                  placeholder="Ex: Máquina de Café XYZ"
                />
                <FormErrorMessage>{errors.nome}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.preco}>
                <FormLabel>Preço</FormLabel>
                <Input
                  name="preco"
                  value={formatCurrencyForDisplay(prod.preco)}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                  type="text"
                  inputMode="decimal"
                />
                <FormErrorMessage>{errors.preco}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={prod.status}
                  onChange={handleChange}
                  bg={prod.status === "Indisponível" ? "red.50" : "green.50"}
                >
                  <option value="Disponível">Disponível</option>
                  <option value="Indisponível">Indisponível</option>
                </Select>
              </FormControl>

              <FormControl isInvalid={!!errors.categoria}>
                <FormLabel>Categoria</FormLabel>
                <Select
                  name="categoria"
                  value={prod.categoria}
                  onChange={handleChange}
                  placeholder="Selecione uma categoria"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.categoria}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.descricao}>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  name="descricao"
                  value={prod.descricao}
                  onChange={handleChange}
                  placeholder="Descreva o produto..."
                  rows={4}
                />
                <FormErrorMessage>{errors.descricao}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.imagens}>
                <FormLabel>Imagens do Produto</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFilesChange}
                />
                <FormErrorMessage>{errors.imagens}</FormErrorMessage>

                {prod.imagens.length > 0 && (
                  <Box mt={4} width="100%">
                    <Text fontWeight="bold" mb={2}>
                      Imagens do produto ({prod.imagens.length})
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {prod.imagens.map((img) => (
                        <HStack
                          key={img.id}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          w="100%"
                          justifyContent="space-between"
                        >
                          <Flex align="center">
                            <Box position="relative">
                              <Image
                                src={img.caminho}
                                boxSize="50px"
                                objectFit="cover"
                                fallbackSrc="/placeholder.jpg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                }}
                              />
                              {img.isLocal && (
                                <Badge
                                  colorScheme="blue"
                                  position="absolute"
                                  top="0"
                                  right="0"
                                >
                                  Novo
                                </Badge>
                              )}
                            </Box>
                            <Text isTruncated flex={1} fontSize="sm" ml={2}>
                              {img.file ? img.file.name : `Imagem ${img.id}`}
                            </Text>
                          </Flex>
                          <IconButton
                            aria-label="Remover imagem"
                            icon={<CloseIcon />}
                            size="sm"
                            onClick={() => removeImage(img.id)}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </FormControl>

              <Flex width="100%" justifyContent="flex-end" gap={4} mt={6}>
                <Button
                  as={RouterLink}
                  to="/"
                  colorScheme="orange"
                  width="120px"
                  isDisabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="120px"
                  isLoading={isSubmitting}
                  loadingText="Salvando..."
                >
                  Salvar
                </Button>
              </Flex>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default EditProduto;