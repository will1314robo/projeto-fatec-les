import { Box, Container, Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { FaTruck, FaCreditCard, FaBoxOpen } from "react-icons/fa";

const SecaoInformacoes = () => {
  const infoItems = [
    {
      icon: FaTruck,
      title: "Aproveite o benefício do frete grátis*",
      description:
        "Aplica-se a compras a partir de $100. Inclua tudo o que você quiser no carrinho.",
      note: "* Não se aplica aos estados do Norte e Nordeste, exceto algumas cidades.",
    },
    {
      icon: FaCreditCard,
      title: "Escolha seu meio de pagamento favorito",
      description:
        "Pague com cartão ou via boleto. Seu dinheiro está protegido com o Mercado Pago.",
    },
    {
      icon: FaBoxOpen,
      title: "Receba seus produtos em até 48 horas",
      description:
        "Seus pacotes estão seguros. Você tem o suporte do envios com o Mercado Livre.",
    },
  ];

  return (
    <Box w="100%" py={10} bg="white">
      <Container maxW="container.xl">
        <Flex
          justify="space-between"
          flexWrap="wrap"
          gap={6}
          textAlign="center"
        >
          {infoItems.map((item, index) => (
            <Box key={index} flex="1" minW="280px" maxW="320px">
            <Icon as={item.icon as React.ElementType} boxSize={12} color="gray.700" mb={4} />
                <Text fontSize="lg" fontWeight="bold">
                {item.title}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={2}>
                {item.description}
              </Text>
              {item.note && (
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {item.note}
                </Text>
              )}
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  );
};

export default SecaoInformacoes;
