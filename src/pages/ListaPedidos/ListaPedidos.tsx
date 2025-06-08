import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Text, VStack, Button, Spinner, useToast,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tag, Flex, Heading,
  Select 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface Pedido {
  id: number;
  idUsuario: number;
  nomeUsuario: string;
  status: 'Em andamento' | 'Concluído' | 'Cancelado';
  data: string;
  valor: number;
  posicao: string;
  atualizado: boolean;
}

interface JwtPayload {
  id: number;
  email: string;
  perfil: string;
  exp: number;
  iat: number;
}

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const toast = useToast();
  const navigate = useNavigate();

  const statusOptions = ['Pendente','Em andamento', 'Concluído', 'Cancelado'];
  const posicaoOptions = ['Em produção', 'Embalando', 'Com transportadora'];

  const fetchPedidos = useCallback(async (token: string, currentUserId: number, currentUserProfile: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = currentUserProfile === 'Admin'
        ? 'http://localhost:5000/pedidos' 
        : `http://localhost:5000/pedidos/usuario/${currentUserId}`; 

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
            throw new Error('Acesso negado. Você não tem permissão para visualizar todos os pedidos.');
        }
        throw new Error(errorData.message || 'Falha ao carregar pedidos.');
      }

      const data = await response.json();
      setPedidos(data.pedidos);
    } catch (err: any) {
      console.error("Erro ao buscar pedidos:", err);
      setError(err.message || 'Ocorreu um erro ao carregar os pedidos.');
      toast({
        title: 'Erro ao carregar pedidos',
        description: err.message || 'Não foi possível buscar os pedidos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      if (err.message.includes('Acesso negado')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]); 

  useEffect(() => {
    const verificarTokenEPerfil = () => {
      const token = sessionStorage.getItem("userToken");
      if (token) {
        try {
          const payloadBase64 = token.split(".")[1];
          const decodedPayload: JwtPayload = JSON.parse(atob(payloadBase64));

          const userIsAdmin = decodedPayload.perfil === "Admin";
          setIsAdmin(userIsAdmin);
          setUserId(decodedPayload.id);

          fetchPedidos(token, decodedPayload.id, decodedPayload.perfil);
        } catch (error) {
          console.error("Erro ao decodificar token no frontend:", error);
          setIsAdmin(false);
          setUserId(null);
          setLoading(false);
          setError("Erro na autenticação. Por favor, faça login novamente.");
          toast({
            title: 'Erro de autenticação',
            description: 'Não foi possível verificar suas credenciais. Faça login novamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/login');
        }
      } else {
        setIsAdmin(false);
        setUserId(null);
        setLoading(false);
        setError("Você precisa estar logado para ver os pedidos.");
        toast({
          title: 'Não autenticado',
          description: 'Você precisa estar logado para ver os pedidos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    };

    verificarTokenEPerfil();
  }, [navigate, toast, fetchPedidos]); 

  const handleUpdatePedido = useCallback(async (
    pedidoId: number, 
    newStatus: string | null = null, 
    newPosicao: string | null = null
  ) => {
    const token = sessionStorage.getItem("userToken");
    if (!token) {
      toast({
        title: 'Erro de autenticação',
        description: 'Token não encontrado. Faça login novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const body: { status?: string, posicao?: string } = {};
      if (newStatus) body.status = newStatus;
      if (newPosicao) body.posicao = newPosicao;

      const response = await fetch(`http://localhost:5000/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar pedido.');
      }

      const updatedPedido = await response.json();
      toast({
        title: 'Pedido Atualizado',
        description: `Pedido ID ${pedidoId} atualizado com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, status: updatedPedido.status, posicao: updatedPedido.posicao, atualizado: true } : p
        )
      );
    } catch (err: any) {
      console.error("Erro ao atualizar pedido:", err);
      toast({
        title: 'Erro ao atualizar',
        description: err.message || 'Não foi possível atualizar o pedido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const getStatusColor = (status: Pedido['status']) => {
    switch (status) {
      case 'Em andamento': return 'orange';
      case 'Concluído': return 'green';
      case 'Cancelado': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl" color="red.500">{error}</Text>
        <Button mt={4} onClick={() => navigate('/')}>Voltar à Página Inicial</Button>
      </Box>
    );
  }

  if (pedidos.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold">Nenhum pedido encontrado.</Text>
        <Button mt={4} colorScheme="teal" onClick={() => navigate('/')}>
          Fazer um pedido
        </Button>
      </Box>
    );
  }

  return (
    <Box py={8} bg="gray.50" minH="100vh">
      <Box maxW="container.xl" mx="auto" px={4}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" mb={6} color="teal.700">
            {isAdmin ? 'Todos os Pedidos' : 'Meus Pedidos'}
          </Heading>

          <TableContainer bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>ID Pedido</Th>
                  {isAdmin && (<Th>Cliente</Th>)}
                  <Th>Status</Th>
                  <Th>Data</Th>
                  <Th isNumeric>Valor Total</Th>
                  <Th>Posição</Th>
                  <Th>Atualizado</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pedidos.map((pedido) => (
                  <Tr key={pedido.id}>
                    <Td fontWeight="bold">{pedido.id}</Td>
                    {isAdmin && (<Td>{pedido.nomeUsuario}</Td>)}
                    <Td>
                      {isAdmin ? (
                        <Select
                          value={pedido.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Pedido['status'];
                            if (newStatus === 'Concluído') {
                                handleUpdatePedido(pedido.id, newStatus, 'Concluído');
                            } 
                            else if (newStatus === 'Cancelado') {
                                handleUpdatePedido(pedido.id, newStatus, 'Cancelado');
                            }
                            else {
                                handleUpdatePedido(pedido.id, newStatus);
                            }
                          }}
                          size="sm"
                          colorScheme={getStatusColor(pedido.status)}
                        >
                          {statusOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      ) : (
                        <Tag size="md" variant="solid" colorScheme={getStatusColor(pedido.status)}>
                          {pedido.status}
                        </Tag>
                      )}
                    </Td>
                    <Td>{formatDate(pedido.data)}</Td>
                    <Td isNumeric>R$ {pedido.valor.toFixed(2)}</Td>
                    <Td>
                      {isAdmin && pedido.status === 'Em andamento' ? ( 
                        <Select
                          value={pedido.posicao}
                          onChange={(e) => handleUpdatePedido(pedido.id, null, e.target.value)}
                          size="sm"
                        >
                          {posicaoOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      ) : (
                        <Text>{pedido.posicao}</Text>
                      )}
                    </Td>
                    <Td>
                      <Tag colorScheme={pedido.atualizado ? 'green' : 'red'}>
                        {pedido.atualizado ? 'Sim' : 'Não'}
                      </Tag>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>
      </Box>
    </Box>
  );
};

export default ListaPedidos;