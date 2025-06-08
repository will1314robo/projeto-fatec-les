import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  Text,
  Link,
  VStack,
  Spacer,
  Image,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface UserPopupProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const UserPopup = ({ isAuthenticated, isAdmin }: UserPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [userName, setUserName] = useState<string | null>(null);

  const getUsernameFromToken = () => {
    const token = sessionStorage.getItem("userToken");
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return decodedPayload.nome || decodedPayload.email || 'Usuário';
      } catch (error) {
        console.error("Erro ao decodificar token para nome de usuário:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (isAuthenticated) {
      setUserName(getUsernameFromToken());
    } else {
      setUserName(null);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    setIsOpen(false);

    toast({
      title: 'Sessão encerrada.',
      description: 'Você foi desconectado.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    window.location.reload();
  };

  return (
    <Box textAlign="right">
      <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <PopoverTrigger>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            _hover={{ background: 'transparent' }}
            _active={{ background: 'transparent' }}
            _focus={{ boxShadow: 'none' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#FFFF" width={20} height={20}>
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z" />
            </svg>
            {isAuthenticated && userName && (
              <Text ml={2} fontWeight="bold" color="teal.300">Olá, {userName}</Text>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent p={4} boxShadow="lg" sx={{ background: "rgba(0, 0, 0, 0.7)" }} color="white">
          <PopoverArrow />
          <PopoverCloseButton />

          {isAuthenticated ? (
            <VStack align="center" spacing={3}>
              <Spacer />
              <Box w="100%" display="flex" justifyContent="center">
                <Image src="/assets/img/logo.png" alt="Logo" h="65px" objectFit="contain" />
              </Box>
              <Spacer />
              <Button variant="outline" justifyContent="flex-start" width="full" color={"white"} onClick={() => { setIsOpen(false); navigate("/minha-conta"); }}>
                Minha Conta
              </Button>
              <Button variant="ghost" justifyContent="flex-start" width="full" color={"white"} onClick={() => { setIsOpen(false); navigate("/pedidos"); }}>
                Meus Pedidos
              </Button>
              <Button variant="ghost" justifyContent="flex-start" width="full" color={"white"} onClick={() => { setIsOpen(false); navigate("/alterar-senha"); }}>
                Alterar Senha
              </Button>

              {isAdmin && (
                <><Button variant="ghost" justifyContent="flex-start" width="full" color={"yellow.300"} onClick={() => { setIsOpen(false); navigate("/admin/dashboard"); }}>
                  Painel Admin
                </Button>
                  <Button variant="ghost" justifyContent="flex-start" width="full" color={"teal.300"} onClick={() => { setIsOpen(false); navigate("/chamados"); }}>
                    Chamados
                  </Button></>
              )}

              <Button color={"red.400"} variant="ghost" justifyContent="flex-start" width="full" onClick={handleLogout}>
                Sair
              </Button>
            </VStack>
          ) : (
            <Box textAlign="center">
              <Spacer />
              <Box w="100%" display="flex" justifyContent="center">
                <Image src="/assets/img/logo.png" alt="Logo" h="50px" objectFit="contain" />
              </Box>
              <Spacer />
              <Text mb={6} fontSize={18}>Acesse ou cadastre-se</Text>
              <Button
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.900" }}
                w="full"
                mb={4}
                fontWeight="bold"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login");
                }}
              >
                ENTRAR
              </Button>
              <Text>
                <Link color="blue.300" fontWeight="bold" onClick={() => { setIsOpen(false); navigate("/userform"); }}>
                  Cadastre-se
                </Link>
              </Text>
            </Box>
          )}
        </PopoverContent>
      </Popover>
    </Box>
  );
};

export default UserPopup;