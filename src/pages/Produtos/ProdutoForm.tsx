import React, { useState } from "react";
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
  Text
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";

type Imagem = {
  src: string;
  isLocal: boolean;
  file?: File; 
};

interface Produto {
  nome: string;
  preco: string;
  status: "Disponível" | "Indisponível";
  categoria: string;
  descricao: string;
  imagens: Imagem[];
}

const categorias = [
  "Mesa",
  "Acessório de mesa",
  "Máquina",
  "Outros"
];

const ProdutoForm = () => {
  const [prod, setProd] = useState<Produto>({
    nome: "",
    preco: "",
    status: "Disponível",
    categoria: "",
    descricao: "",
    imagens: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();
  const navigate = useNavigate();

  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/\D/g, "")) / 100;
    if (isNaN(numericValue)) return "";
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!prod.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!prod.preco.trim() || prod.preco === "R$ 0,00") newErrors.preco = "Preço deve ser maior que zero";
    if (!prod.categoria.trim()) newErrors.categoria = "Categoria é obrigatória";
    if (!prod.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    if (prod.imagens.length === 0) newErrors.imagens = "Pelo menos uma imagem é necessária";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "preco") {
      const onlyNumbers = value.replace(/\D/g, "");
      setProd({ ...prod, preco: formatCurrency(onlyNumbers) });
    } else {
      setProd({ ...prod, [name]: value });
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Preencha todos os campos corretamente",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("nome", prod.nome);
      formData.append("preco", String(Number(prod.preco.replace(/\D/g, "")) / 100));
      formData.append("status", prod.status || "Disponível");
      formData.append("categoria", prod.categoria);
      formData.append("descricao", prod.descricao);

      prod.imagens.forEach((img) => {
        if (img.isLocal && img.file) {
          formData.append("files", img.file);
        } else {
          formData.append("imagens", img.src); 
        }
      });

      const response = await fetch("http://localhost:5000/produtos/createprod", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: data.message, status: "success", duration: 3000, isClosable: true, position: "top" });
        navigate("/");
      } else {
        throw new Error(data.message || "Erro ao cadastrar produto");
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
      setIsSubmitting(false);
    }
  };

  return (
    <Box py={5}>
      <Container maxW="container.xl">
        <Heading mb={4} textAlign="center">Cadastro de Produto</Heading>
        <SimpleGrid borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} bg="whiteAlpha.700">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.nome}>
                <FormLabel>Nome do produto</FormLabel>
                <Input
                  name="nome"
                  value={prod.nome}
                  onChange={handleChange}
                  placeholder="Ex: Mesa de pebolim"
                />
                <FormErrorMessage>{errors.nome}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.preco}>
                <FormLabel>Preço</FormLabel>
                <Input
                  name="preco"
                  value={prod.preco}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                />
                <FormErrorMessage>{errors.preco}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status}>
                <FormLabel>Status</FormLabel>
                <Select name="status" value={prod.status} onChange={handleChange}>
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
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const novasImagens: Imagem[] = files.map((file) => ({
                      src: URL.createObjectURL(file),
                      isLocal: true,
                      file
                    }));
                    setProd((prev) => ({
                      ...prev,
                      imagens: [...prev.imagens, ...novasImagens],
                    }));

                    if (errors.imagens) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.imagens;
                        return newErrors;
                      });
                    }
                  }}
                />
                <FormErrorMessage>{errors.imagens}</FormErrorMessage>

                {prod.imagens.length > 0 && (
                  <Box mt={4}>
                    <Text fontWeight="bold" mb={2}>
                      Imagens adicionadas ({prod.imagens.length})
                    </Text>
                    {prod.imagens.map((img, idx) => (
                      <HStack key={idx} p={2} borderWidth="1px" borderRadius="md" w="100%">
                        <Image
                          src={img.src}
                          boxSize="50px"
                          objectFit="cover"
                          fallbackSrc="https://via.placeholder.com/50"
                        />
                        <Text isTruncated flex={1} fontSize="sm">
                          {img.isLocal ? "Imagem local" : img.src}
                        </Text>
                        <IconButton
                          aria-label="Remover imagem"
                          icon={<CloseIcon />}
                          size="sm"
                          onClick={() => {
                            const newImgs = [...prod.imagens];
                            newImgs.splice(idx, 1);
                            setProd({ ...prod, imagens: newImgs });
                          }}
                        />
                      </HStack>
                    ))}
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
                  Voltar
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="120px"
                  isLoading={isSubmitting}
                  loadingText="Cadastrando..."
                >
                  Cadastrar
                </Button>
              </Flex>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </Box >
  );
};

export default ProdutoForm;