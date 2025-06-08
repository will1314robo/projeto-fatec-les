import { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading,
  Container, SimpleGrid, InputGroup, InputLeftElement, Icon, Link,
  useToast
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import React from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("userToken", data.token);
        toast({ title: "Login realizado com sucesso!", status: "success", duration: 3000, position: "top" });

        setTimeout(() => window.location.href = "/", 1000); 
      }
      else {
        toast({ title: data.message || "Erro ao fazer login", status: "error", duration: 3000, position: "top" });
      }
    } catch (error) {
      toast({ title: "Erro ao conectar ao servidor", status: "error", duration: 3000, position: "top" });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, blue.500, purple.500)"
    >
      <Container maxW="md">
        <SimpleGrid
          borderWidth="1px"
          borderRadius="lg"
          p={8}
          boxShadow="lg"
          bg="white"
        >
          <Heading mb={6} textAlign="center" color="black" fontSize={16}>Digite seu e-mail para iniciar sessão</Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={EmailIcon} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={LockIcon} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <Link as={RouterLink} to="/esqueci-senha" color="blue.500" fontSize="sm" alignSelf="flex-end">
                Esqueci minha senha
              </Link>

              <Button
                type="submit"
                colorScheme="blue"
                width="100%"
                _hover={{ bg: "blue.600" }}
              >
                Entrar
              </Button>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default LoginPage;
