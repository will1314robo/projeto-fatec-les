import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Text, VStack, Button, Spinner, useToast,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex, Heading, AlertDialog,
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface Chamado {
  id: number;
  pedidoId: number;
  descricao: string;
  whatsapp: string;
  email: string;
  dataAbertura: string;
}

interface JwtPayload {
  id: number;
  email: string;
  perfil: string;
  exp: number;
  iat: number;
}

const ListaChamados: React.FC = () => {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [chamadoToDelete, setChamadoToDelete] = useState<number | null>(null); 
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure(); 
  const cancelRef = React.useRef<HTMLButtonElement>(null); 

  const fetchChamados = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = 'http://localhost:5000/chamados';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error('Acesso negado. Você não tem permissão para visualizar chamados.');
        }
        throw new Error(errorData.message || 'Falha ao carregar chamados.');
      }

      const data = await response.json();
      setChamados(data.chamados);
    } catch (err: any) {
      console.error("Erro ao buscar chamados:", err);
      setError(err.message || 'Ocorreu um erro ao carregar os chamados.');
      toast({
        title: 'Erro ao carregar chamados',
        description: err.message || 'Não foi possível buscar os chamados.',
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

          if (userIsAdmin) {
            fetchChamados(token); 
          } else {
            setLoading(false);
            setError("Você não tem permissão para acessar esta página.");
            toast({
              title: 'Acesso Negado',
              description: 'Apenas administradores podem visualizar a lista de chamados.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
            navigate('/');
          }
        } catch (error) {
          console.error("Erro ao decodificar token no frontend:", error);
          setIsAdmin(false);
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
        setLoading(false);
        setError("Você precisa estar logado para acessar esta página.");
        toast({
          title: 'Não autenticado',
          description: 'Você precisa estar logado para acessar esta página.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    };

    verificarTokenEPerfil();
  }, [navigate, toast, fetchChamados]); 

  const handleDeleteClick = (chamadoId: number) => {
    setChamadoToDelete(chamadoId);
    onOpen(); 
  };

  const handleDeleteConfirm = async () => {
    onClose(); 
    if (chamadoToDelete === null) return;

    setLoading(true);
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
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/chamados/${chamadoToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao deletar chamado.');
      }

      toast({
        title: 'Chamado Deletado',
        description: `Chamado ID ${chamadoToDelete} foi deletado com sucesso.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setChamados(prevChamados => prevChamados.filter(c => c.id !== chamadoToDelete));

    } catch (err: any) {
      console.error("Erro ao deletar chamado:", err);
      toast({
        title: 'Erro ao deletar',
        description: err.message || 'Não foi possível deletar o chamado.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setChamadoToDelete(null);
    }
  };


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!loading && !isAdmin && error) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl" color="red.500">{error}</Text>
        <Button mt={4} onClick={() => navigate('/')}>Voltar à Página Inicial</Button>
      </Box>
    );
  }

  if (isAdmin && chamados.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="2xl" fontWeight="bold">Nenhum chamado encontrado.</Text>
        <Button mt={4} colorScheme="teal" onClick={() => navigate('/novo-chamado')}>
          Abrir um Chamado
        </Button>
      </Box>
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

  return (
    <Box py={8} bg="gray.50" minH="100vh">
      <Box maxW="container.xl" mx="auto" px={4}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" mb={6} color="teal.700">
            Todos os Chamados
          </Heading>

          <TableContainer bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Table variant="simple" size="md">
              <Thead bg="gray.100">
                <Tr>
                  <Th>ID Chamado</Th>
                  <Th>ID Pedido</Th>
                  <Th>Descrição</Th>
                  <Th>Whatsapp</Th>
                  <Th>Email</Th>
                  <Th>Data Abertura</Th>
                  <Th>Ações</Th> 
                </Tr>
              </Thead>
              <Tbody>
                {chamados.map((chamado) => (
                  <Tr key={chamado.id}>
                    <Td fontWeight="bold">{chamado.id}</Td>
                    <Td>{chamado.pedidoId}</Td>
                    <Td>{chamado.descricao}</Td>
                    <Td>{chamado.whatsapp}</Td>
                    <Td>{chamado.email}</Td>
                    <Td>{formatDate(chamado.dataAbertura)}</Td>
                    <Td>
                      <Button 
                        colorScheme="red" 
                        size="sm" 
                        onClick={() => handleDeleteClick(chamado.id)}
                      >
                        Deletar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deletar Chamado
            </AlertDialogHeader>

            <AlertDialogBody>
              Você tem certeza? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ListaChamados;