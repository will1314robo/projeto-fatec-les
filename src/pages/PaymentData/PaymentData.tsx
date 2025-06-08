import { Box, Container, Image, Text, Link, Flex } from "@chakra-ui/react";
import React from "react";

const PaymentData: React.FC = () => {
  return (
    <Box className="payment-data MLB">
      <Container maxW="container.xl" bg="white">
        <Box className="payment-data-container">
          <Flex direction="row" justify="space-between" wrap="wrap">
            <Box className="payment-data-group payment-data-group-leading" flex="1" minWidth="320px" p={4}>
              <Box className="payment-data-section payment-data-section-leading">
                <Text className="payment-data-title" fontSize="xl" fontWeight="bold">
                  Pagamento cômodo e seguro
                </Text>
                <Text className="payment-data-subtitle" fontSize="md" color="gray.600">
                  com Mercado Pago
                </Text>
              </Box>
            </Box>

            <Box className="payment-data-group payment-data-group-normal" flex="2" minWidth="210px" p={4}>
              <Flex direction="column">
                <Box className="payment-data-section payment-data-section-normal" mb={4}>
                  <Flex direction="row" align="center">
                    <Link href="p/ajuda/home/payments/methods#" className="payment-data-icon" mr={4}>
                      <Image
                        alt="Cartão de Crédito"
                        src="https://http2.mlstatic.com/storage/mshops-appearance-api/resources/icons/payment-methods/credit-card-v1.svg"
                        boxSize="40px" 
                      />
                    </Link>
                    <Box>
                      <Text  className="payment-data-title" fontSize="md" fontWeight="bold">
                        Pague parcelado
                      </Text>
                      <Text className="payment-data-subtitle" fontSize="sm" color="gray.600">
                        <Link href="p/ajuda/home/payments/methods#" target="_blank" rel="noopener noreferrer nofollow">
                          Ver mais
                        </Link>
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Box>

            <Box className="payment-data-group payment-data-group-normal" flex="2" minWidth="300px" p={4}>
              <Flex direction="column">
                <Box className="payment-data-section payment-data-section-normal">
                  <Flex direction="row" align="center">
                    <Link href="p/ajuda/home/payments/methods#payment-agreement" className="payment-data-icon" mr={4}>
                      <Image
                        alt="Boleto Bancário"
                        src="https://http2.mlstatic.com/storage/mshops-appearance-api/resources/icons/payment-methods/payment-agreement-v1.svg"
                        boxSize="40px" 
                      />
                    </Link>
                    <Box>
                      <Text className="payment-data-title" fontSize="md" fontWeight="bold">
                        À vista no boleto bancário
                      </Text>
                      <Text className="payment-data-subtitle" fontSize="sm" color="gray.600">
                        <Link href="p/ajuda/home/payments/methods#payment-agreement" target="_blank" rel="noopener noreferrer nofollow">
                          Ver mais
                        </Link>
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Box>

            <Box className="payment-data-group payment-data-group-trailing" flex="1" minWidth="310px" p={4}>
              <Box className="payment-data-section payment-data-section-trailing">
                <Flex direction="row" align="center">
                  <Link href="p/ajuda/home/payments/methods" className="payment-data-icon" mr={4}>
                    <Image
                      alt="Mais Formas de Pagamento"
                      src="https://http2.mlstatic.com/storage/mshops-appearance-api/resources/icons/payment-methods/view-more-v1.svg"
                      boxSize="40px" 
                    />
                  </Link>
                  <Box>
                    <Text className="payment-data-title" fontSize="md" fontWeight="bold">
                      Mais formas de pagamento
                    </Text>
                    <Text className="payment-data-subtitle" fontSize="sm" color="gray.600">
                      <Link href="p/ajuda/home/payments/methods" target="_blank" rel="noopener noreferrer nofollow">
                        Ver todos
                      </Link>
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentData;
