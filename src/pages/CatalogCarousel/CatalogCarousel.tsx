import { Box, Button, Image, Text, Container, Flex } from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  imagens: string[]; 
}

const CatalogCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/produtos/getprod");

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Formato de dados inválido da API");
        }

        const formattedProducts = data.map((prod: any) => ({
          id: prod.id,
          nome: prod.nome,
          preco: prod.preco,
          descricao: prod.descricao,
          imagens: Array.isArray(prod.imagens)
            ? prod.imagens.map((imgId: string) => `http://localhost:5000/imagens/${imgId}`)
            : (prod.imagens ? [`http://localhost:5000/imagens/${prod.imagens}`] : [])
        }));

        setProducts(formattedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error("Erro na requisição:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId: number) => {
    navigate(`/produto-especifico/${productId}`);
  };

  if (loading) return (
    <Container maxW="container.xl" textAlign="center" py={10}>
      <Text>Carregando produtos...</Text>
    </Container>
  );

  if (error) return (
    <Container maxW="container.xl" textAlign="center" py={10}>
      <Text color="red.500">Erro ao carregar produtos: {error}</Text>
    </Container>
  );

  if (!products.length) return (
    <Container maxW="container.xl" textAlign="center" py={10}>
      <Text>Nenhum produto disponível no momento</Text>
    </Container>
  );

  return (
    <Box w="100%" p={5}>
      <Container maxW="container.xl">
        <Text fontSize={28}>Compre nossos produtos com desconto e receba-os hoje mesmo!</Text>
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={2}
          navigation
          pagination={false}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {products.map((product: Product) => (
            <SwiperSlide key={product.id}>
              <Box
                border="1px solid #ddd"
                borderRadius="10px"
                overflow="hidden"
                p={4}
                bg="white"
                boxShadow="lg"
                cursor="pointer"
              >
                <Image
                  src={product.imagens[0] || "/placeholder-image.jpg"}
                  alt={product.nome}
                  w="100%"
                  h="200px"
                  objectFit="contain"
                  fallbackSrc="/placeholder-image.jpg"
                />
                <Text fontSize="lg" fontWeight="bold" mt={2}>
                  {product.nome}
                </Text>
                <Text fontSize="xl" color="blue.600" fontWeight="bold">
                  R$ {product.preco.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
                  {product.descricao}
                </Text>
                <Flex mt={3} gap={2}>
                  <Button
                    colorScheme="blue"
                    flex={1}
                    onClick={() => handleProductClick(product.id)}
                  >
                    Comprar
                  </Button>
                </Flex>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
};

export default CatalogCarousel;
