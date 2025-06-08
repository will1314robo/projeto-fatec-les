import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading,
  Container, SimpleGrid, InputGroup, InputLeftElement, useToast,
  HStack
} from "@chakra-ui/react";

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'A nova senha e a confirmação devem ser iguais.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("userToken"); 

      const response = await fetch("http://localhost:5000/usuarios/usuario/senha", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          senhaAntiga: oldPassword,
          novaSenha: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao alterar senha.");
      }

      toast({
        title: 'Sucesso',
        description: data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      sessionStorage.removeItem("userToken");
      toast({
        title: 'Sessão encerrada',
        description: 'Faça login novamente com sua nova senha.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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
          <Heading mb={6} textAlign="center" color="black" fontSize={20}>Alterar Senha</Heading>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Senha Antiga</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={15} width={15}>
                      <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" />
                    </svg>
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Digite sua senha antiga"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nova Senha</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={15} width={15}>
                      <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" />
                    </svg>
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={15} width={15}>
                      <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z" />
                    </svg>
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </InputGroup>
              </FormControl>

              <HStack spacing={4} width="100%" justifyContent={'end'}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="50%"
                  _hover={{ bg: "blue.600" }}
                  isLoading={loading}
                  loadingText="Alterando"
                >
                  Alterar Senha
                </Button>
              </HStack>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;
