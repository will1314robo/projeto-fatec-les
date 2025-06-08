import React, { useState, useEffect } from 'react';
import {
  Box, Button, Text, VStack, HStack, IconButton, Image,
  Divider, Flex, Input, useToast, Spinner, AlertDialog,
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import { useCarrinho } from '../../components/Carrinho/CarrinhoContext.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { DeleteIcon } from '@chakra-ui/icons';
import { FaWhatsapp } from 'react-icons/fa'; 

const Carrinho = () => {
  const {
    itens,
    removerProduto,
    alterarQuantidade,
    carregando,
    carregarCarrinho,
    clearCarrinho
  } = useCarrinho();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  const [endereco, setEndereco] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const [codigoCupom, setCodigoCupom] = useState('');
  const [descontoCupom, setDescontoCupom] = useState(0);
  const [cupomAplicadoId, setCupomAplicadoId] = useState<number | null>(null);
  const [isApplyingCupom, setIsApplyingCupom] = useState(false);

  const whatsappNumero = '5511943973173';

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const cupomParam = queryParams.get('cupom');

    if (cupomParam && !codigoCupom) {
      setCodigoCupom(cupomParam);
    }
  }, [location.search, codigoCupom]);

  const confirmarRemocao = (id: number) => {
    setItemToRemove(id);
    setIsDialogOpen(true);
  };

  const handleRemoverProduto = async () => {
    if (itemToRemove) {
      await removerProduto(itemToRemove);
      setIsDialogOpen(false);
      toast({
        title: 'Produto removido',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const calcularSubtotal = () => {
    return itens.reduce((total, item) => total + item.preco * item.quantidade, 0);
  };

  const calcularTotalFinal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - descontoCupom;
  };

  const getAuthInfoForRequests = () => {
    const token = sessionStorage.getItem("userToken");
    let userId: number | null = null;
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        userId = decodedPayload.id || null;
      } catch (error) {
        console.error("Erro ao decodificar token para userId na requisição:", error);
      }
    }
    return { token, userId };
  };

  const handleAplicarCupom = async () => {
    if (!codigoCupom.trim()) {
      toast({
        title: 'Insira um código de cupom',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { token, userId } = getAuthInfoForRequests(); 

    if (!userId || !token) {
        toast({
            title: 'Erro de autenticação',
            description: 'Você precisa estar logado para aplicar cupons.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setIsApplyingCupom(true);
    try {
      const response = await fetch('http://localhost:5000/carrinho/aplicar-cupom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigoCupom, usuarioId: userId }),
      });

      const data = await response.json();

      if (data.success) {
        setDescontoCupom(parseFloat(data.valorDesconto));
        setCupomAplicadoId(data.cupomId);
        toast({
          title: 'Cupom aplicado!',
          description: `Desconto de R$ ${parseFloat(data.valorDesconto).toFixed(2)} aplicado.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setDescontoCupom(0);
        setCupomAplicadoId(null);
        toast({
          title: 'Erro ao aplicar cupom',
          description: data.message || 'Ocorreu um erro inesperado.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro de rede ao aplicar cupom:', error);
      setDescontoCupom(0);
      setCupomAplicadoId(null);
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor para aplicar o cupom.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsApplyingCupom(false);
    }
  };

  const enviarPedidoViaWhatsApp = async () => {
    if (!endereco.trim()) {
      toast({
        title: 'Endereço obrigatório',
        description: 'Por favor, preencha o endereço de entrega.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const { token, userId } = getAuthInfoForRequests(); 

    if (!userId || !token) {
        toast({
            title: 'Erro de autenticação',
            description: 'Você precisa estar logado para finalizar o pedido.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    setIsSubmitting(true);

    try {
      await carregarCarrinho(); 

      const finalizarResponse = await fetch('http://localhost:5000/carrinho/finalizar-compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...(cupomAplicadoId && { cupomId: cupomAplicadoId }),
          usuarioId: userId,
          enderecoEntrega: endereco,
          itensPedido: itens.map(item => ({
              produtoId: item.id,
              quantidade: item.quantidade,
              precoUnitario: item.preco
          })),
          valorTotal: calcularTotalFinal()
        }),
      });

      const finalizarData = await finalizarResponse.json();

      if (!finalizarData.success) {
        toast({
          title: 'Erro na finalização do pedido',
          description: finalizarData.message || 'Não foi possível concluir o pedido. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }

      const mensagem = `
*Pedido via site*
${finalizarData.pedidoId ? `*Número do Pedido: #${finalizarData.pedidoId}*` : ''}

${itens.map(item => (
        `• ${item.nome} (Qtd: ${item.quantidade}) - R$ ${(item.preco * item.quantidade).toFixed(2)}`
      )).join('\n')}

${descontoCupom > 0 ? `*Desconto Cupom:* - R$ ${descontoCupom.toFixed(2)}\n` : ''}
*Total:* R$ ${calcularTotalFinal().toFixed(2)}

*Endereço de entrega:*
${endereco}
      `;

      const url = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');

      toast({
        title: 'Pedido enviado!',
        description: `Seu pedido #${finalizarData.pedidoId} foi enviado com sucesso via WhatsApp.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await clearCarrinho();
      navigate(`/`);

    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Ocorreu um erro ao processar seu pedido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (carregando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (itens.length === 0) {
    return (
      <Box maxW="600px" mx="auto" p="8" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" mb="4">Seu carrinho está vazio</Text>
        <Button colorScheme="teal" onClick={() => navigate('/')}>
          Voltar às compras
        </Button>
      </Box>
    );
  }

  return (
    <Box py={8} bg="gray.50" minH="100vh">
      <Box maxW="container.lg" mx="auto" px={4}>
        <Box bg="white" borderRadius="xl" boxShadow="md" overflow="hidden">
          <Box bg="teal.500" px={6} py={4}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Meu Carrinho
            </Text>
          </Box>

          <Box p={6}>
            <VStack spacing={6} align="stretch">
              {itens.map((item) => (
                <Flex
                  key={item.id}
                  borderBottomWidth="1px"
                  pb={4}
                  _last={{ borderBottom: 'none' }}
                >
                  <Image
                    src={item.imagens[0] || '/placeholder-image.jpg'}
                    alt={item.nome}
                    boxSize="100px"
                    objectFit="contain"
                    borderRadius="md"
                    fallbackSrc="/placeholder-image.jpg"
                  />

                  <Box flex={1} px={4}>
                    <Text fontSize="lg" fontWeight="semibold" mb={1}>
                      {item.nome}
                    </Text>
                    <Text color="teal.600" fontWeight="bold" mb={3}>
                      R$ {item.preco.toFixed(2)}
                    </Text>

                    <Flex align="center">
                      <Button
                        size="sm"
                        onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                        isDisabled={item.quantidade <= 1}
                        aria-label="Reduzir quantidade"
                      >
                        -
                      </Button>
                      <Text mx={3} minW="30px" textAlign="center">
                        {item.quantidade}
                      </Text>
                      <Button
                        size="sm"
                        onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </Button>
                    </Flex>
                  </Box>

                  <VStack align="flex-end" justify="space-between">
                    <IconButton
                      aria-label="Remover item"
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      onClick={() => confirmarRemocao(item.id)}
                    />
                    <Text fontWeight="bold">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </Text>
                  </VStack>
                </Flex>
              ))}

              <Divider />

              <Box mt={6} p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="semibold" mb={2}>Aplicar Cupom</Text>
                <HStack>
                  <Input
                    placeholder="Digite o código do cupom"
                    value={codigoCupom}
                    onChange={(e) => setCodigoCupom(e.target.value)}
                    size="md"
                    focusBorderColor="teal.500"
                    isDisabled={descontoCupom > 0}
                  />
                  <Button
                    colorScheme="teal"
                    onClick={handleAplicarCupom}
                    isLoading={isApplyingCupom}
                    isDisabled={descontoCupom > 0}
                  >
                    Aplicar
                  </Button>
                </HStack>
                {descontoCupom > 0 && (
                  <Text mt={2} color="green.600" fontSize="sm">
                    Cupom aplicado: -R$ {descontoCupom.toFixed(2)}
                  </Text>
                )}
              </Box>

              <Box bg="gray.50" borderRadius="md" p={4} mt={4}>
                <Flex justify="space-between" mb={2}>
                  <Text>Subtotal ({itens.reduce((sum, item) => sum + item.quantidade, 0)} itens)</Text>
                  <Text>R$ {calcularSubtotal().toFixed(2)}</Text>
                </Flex>
                {descontoCupom > 0 && (
                  <Flex justify="space-between" mb={2} color="green.600">
                    <Text>Desconto do Cupom</Text>
                    <Text>- R$ {descontoCupom.toFixed(2)}</Text>
                  </Flex>
                )}
                <Flex justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text>Total Final</Text>
                  <Text color="teal.600">R$ {calcularTotalFinal().toFixed(2)}</Text>
                </Flex>
              </Box>

              <Box mt={6}>
                <Text fontWeight="semibold" mb={2}>
                  Endereço de Entrega
                </Text>
                <Input
                  placeholder="Rua, número, complemento, bairro, CEP"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  size="lg"
                  focusBorderColor="teal.500"
                />
              </Box>

              <Button
                colorScheme='green'
                size="lg"
                height="50px"
                mt={4}
                onClick={enviarPedidoViaWhatsApp}
                isLoading={isSubmitting}
                loadingText="Preparando pedido..."
                leftIcon={<FaWhatsapp size={20} />}
              >
                Finalizar Pedido via WhatsApp
              </Button>

              <Button
                variant="outline"
                colorScheme="teal"
                size="lg"
                mt={2}
                onClick={() => navigate('/')}
              >
                Continuar Comprando
              </Button>
            </VStack>
          </Box>
        </Box>
      </Box>

      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remover item
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja remover este item do carrinho?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleRemoverProduto} ml={3}>
                Remover
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Carrinho;