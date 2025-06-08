import { Box, Flex, Text, VStack, HStack, Stat, StatLabel, StatNumber, Container, SimpleGrid, GridItem, useColorModeValue, useToast, Spinner, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; 

interface CardInfoProps {
  title: string;
  value: string | number;
  bgColor?: string;
}

const DashboardAdmin = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const [usuarios, setUsuarios] = useState(0);
  const [produtos, setProdutos] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [graficoDados, setGraficoDados] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAcessoEBuscarDados = async () => {
      setLoading(true); 
      setError(null); 
      const token = sessionStorage.getItem("userToken");

      if (!token) {
        toast({
          title: 'Acesso negado',
          description: 'Você precisa estar logado para acessar o painel administrativo.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login'); 
        setLoading(false);
        return;
      }

      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        if (decodedPayload.perfil !== "Admin") { 
          toast({
            title: 'Acesso não autorizado',
            description: 'Você não tem permissão para acessar o painel administrativo.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/'); 
          setLoading(false);
          return;
        }

        const usuariosRes = await axios.get("http://localhost:5000/usuarios/usuariototal", {
          headers: { Authorization: `Bearer ${token}` } 
        });
        const produtosRes = await axios.get("http://localhost:5000/produtos/getprod", {
          headers: { Authorization: `Bearer ${token}` } 
        });
        const totalVendasRes = await axios.get("http://localhost:5000/vendas/total", {
          headers: { Authorization: `Bearer ${token}` } 
        });
        const vendasMensaisRes = await axios.get("http://localhost:5000/vendas/mensais", {
          headers: { Authorization: `Bearer ${token}` } 
        });

        setUsuarios(usuariosRes.data.total); 
        setProdutos(produtosRes.data.length);
        setTotalVendas(totalVendasRes.data.total);
        setGraficoDados(vendasMensaisRes.data);

      } catch (err: any) {
        console.error("Erro ao buscar dados do dashboard:", err);

        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
            toast({
                title: 'Sessão expirada ou acesso negado',
                description: 'Faça login novamente ou verifique suas permissões.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            navigate('/login');
        } else {
            setError("Ocorreu um erro ao carregar os dados do painel.");
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados do painel.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
      } finally {
        setLoading(false); 
      }
    };

    verificarAcessoEBuscarDados();
  }, [navigate, toast]); 

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
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

  return (
    <Box minH="100vh" bg={bg} py={28} px={4}>
      <Container maxW="7xl">
        <Text fontSize="3xl" fontWeight="bold" mb={8} color="gray.700">
          Painel Administrativo
        </Text>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
          <GridItem>
            <CardInfo
              title="Total de Usuários"
              value={usuarios}
              bgColor="yellow.400"
            />
          </GridItem>
          <GridItem>
            <CardInfo
              title="Total de Produtos"
              value={produtos}
              bgColor="blue.500"
            />
          </GridItem>
          <GridItem>
            <CardInfo
              title="Total de Vendas"
              value={`R$ ${totalVendas.toFixed(2)}`}
              bgColor="green.500"
            />
          </GridItem>
        </SimpleGrid>
      </Container>
      <Box mt={16} bg="white" p={6} borderRadius="xl" boxShadow="md">
        <Text fontSize="xl" mb={4} fontWeight="bold" color="gray.700">
          Vendas Mensais
        </Text>
        {graficoDados.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graficoDados}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vendas" stroke="#3182CE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Text>Carregando dados do gráfico...</Text>
        )}
      </Box>
    </Box>
  );
};

const CardInfo = ({ title, value, bgColor = "white" }: CardInfoProps) => {
  return (
    <Stat
      bg={bgColor}
      p={6}
      shadow="md"
      borderRadius="xl"
      color="white"
    >
      <StatLabel fontSize="md" opacity={0.9}>
        {title}
      </StatLabel>
      <StatNumber fontSize="2xl">{value}</StatNumber>
    </Stat>
  );
};

export default DashboardAdmin;