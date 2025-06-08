import {
  Box,
  Container,
  SimpleGrid,
  Image,
  Text,
  Button,
  Center,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Checkbox,
  Spinner,
  IconButton,
  Stack,
  Badge,
  NumberInput,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSlider,
  RangeSliderThumb
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FilterIcon } from "lucide-react";

interface Product {
  id: number;
  imagens: string[];
  preco: number;
  descricao: string;
  nome: string;
  categoria: string;
  status: string;
  estoque: number;
}

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const categories = ["Mesa", "Máquina", "Acessório de mesa", "Outros"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/produtos/getprod");

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data: Product[] = await response.json();

        const getImageUrl = (imagemId: string) => `http://localhost:5000/imagens/${imagemId}`;

        const formatted = data.map(prod => ({
          ...prod,
          imagens: prod.imagens.map(img => getImageUrl(img))
        }));

        setProducts(formatted);
        setFilteredProducts(formatted);
        if (data.length > 0) {
          const maxPrice = Math.max(...data.map(p => p.preco));
          setPriceRange([0, Math.ceil(maxPrice / 100) * 100]); 
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error("Erro na requisição:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(product =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(product =>
        selectedCategories.includes(product.categoria)
      );
    }

    result = result.filter(product =>
      product.preco >= priceRange[0] && product.preco <= priceRange[1]
    );

    setFilteredProducts(result);
  }, [searchTerm, selectedCategories, priceRange, products]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.preco));
      setPriceRange([0, Math.ceil(maxPrice / 100) * 100]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) return (
    <Container maxW="container.xl" textAlign="center" py={10}>
      <Spinner size="xl" />
      <Text mt={4}>Carregando produtos...</Text>
    </Container>
  );

  if (error) return (
    <Container maxW="container.xl" textAlign="center" py={10}>
      <Text color="red.500">Erro ao carregar produtos: {error}</Text>
    </Container>
  );

  return (
    <Box py={5}>
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
          <Text fontSize="2xl" fontWeight="bold">Nossos Produtos</Text>

          <Flex gap={4} width={{ base: "100%", md: "auto" }}>
            <InputGroup maxW="400px" flex="1">
              <InputLeftElement pointerEvents="none">
              </InputLeftElement>
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <IconButton
              aria-label="Filtrar produtos"
              icon={<FilterIcon />}
              onClick={onOpen}
              variant="outline"
            />
          </Flex>
        </Flex>

        <Text mb={4} color="gray.500">
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          {priceRange[0] > 0 || priceRange[1] < Math.max(...products.map(p => p.preco)) && (
            <>, entre {formatCurrency(priceRange[0])} e {formatCurrency(priceRange[1])}</>
          )}
        </Text>

        {filteredProducts.length > 0 ? (
          <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
            {filteredProducts.map((product) => (
              <Box
                key={product.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                p={4}
                bg="white"
                _hover={{ cursor: "pointer", boxShadow: "xl" }}
                transition="all 0.2s"
              >
                <Center>
                  <Image
                    src={product.imagens[0]}
                    alt={product.nome}
                    w="100%"
                    h="200px"
                    objectFit="contain"
                    fallbackSrc="/placeholder-image.jpg"
                  />
                </Center>
                <Stack mt={2} spacing={1}>
                  <Badge
                    colorScheme={product.status === "Disponível" ? "green" : "red"}
                    alignSelf="flex-start"
                  >
                    {product.status}
                  </Badge>
                  <Text fontSize="lg" fontWeight="bold">{formatCurrency(product.preco)}</Text>
                  <Text fontSize="md" color="gray.600">{product.nome}</Text>
                  <Text fontSize="sm" color="gray.400">{product.categoria}</Text>
                </Stack>
                <Button
                  colorScheme="blue"
                  mt={3}
                  w="100%"
                  onClick={() => navigate(`/produto-especifico/${product.id}`)}
                >
                  Ver detalhes
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg">Nenhum produto encontrado com os filtros atuais</Text>
            <Button mt={4} onClick={resetFilters}>
              Limpar filtros
            </Button>
          </Box>
        )}
      </Container>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filtrar Produtos</DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={6}>
              <Box>
                <Text fontWeight="bold" mb={2}>Categorias</Text>
                <VStack align="start">
                  {categories.map(category => (
                    <Checkbox
                      key={category}
                      isChecked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Checkbox>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Status</Text>
                <Checkbox defaultChecked>Disponível</Checkbox>
              </Box>

              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="bold">Faixa de Preço</Text>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => setShowPriceSlider(!showPriceSlider)}
                  >
                    {showPriceSlider ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </Flex>

                {showPriceSlider && (
                  <Box px={4}>
                    <RangeSlider
                      min={0}
                      max={priceRange[1] > 1000 ? priceRange[1] : 1000}
                      step={10}
                      defaultValue={[priceRange[0], priceRange[1]]}
                      onChangeEnd={(val) => setPriceRange(val as [number, number])}
                    >
                      <RangeSliderTrack bg="gray.200">
                        <RangeSliderFilledTrack bg="blue.500" />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} />
                    </RangeSlider>

                    <Flex justify="space-between" mt={4}>
                      <NumberInput
                        maxW="120px"
                        value={priceRange[0]}
                        min={0}
                        max={priceRange[1]}
                        onChange={(_, val) => setPriceRange([val, priceRange[1]])}
                      >
                      </NumberInput>

                      <Text mx={2}>até</Text>

                      <NumberInput
                        maxW="120px"
                        value={priceRange[1]}
                        min={priceRange[0]}
                        onChange={(_, val) => setPriceRange([priceRange[0], val])}
                      >
                      </NumberInput>
                    </Flex>
                  </Box>
                )}
              </Box>

              <Button
                colorScheme="blue"
                onClick={onClose}
              >
                Aplicar Filtros
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  resetFilters();
                }}
              >
                Limpar Filtros
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Produtos;