import { Box, Spacer } from "@chakra-ui/react";
import Carousel from "../Carousel/Carousel.tsx";
import PaymentData from "../PaymentData/PaymentData.tsx";
import CatalogCarousel from "../CatalogCarousel/CatalogCarousel.tsx";
import SecaoInformacoes from "../SecaoInformacoes/SecaoInformacoes.tsx";
import React from "react";

const Home = () => {
  return (
    <Box bg="gray.100">
      <Carousel />
      <PaymentData />
      <CatalogCarousel />
      <SecaoInformacoes />
      <Spacer />
    </Box>
  );
};

export default Home;
