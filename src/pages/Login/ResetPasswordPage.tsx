import React, { useState } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading,
    Container, SimpleGrid, InputGroup, InputLeftElement, useToast,
    HStack
} from "@chakra-ui/react";
import { FaLock, FaUser, FaCalendarAlt } from 'react-icons/fa'; 
import { IMaskInput } from "react-imask";

const ResetPasswordPage = () => {
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [dataNascimento, setDataNascimento] = useState(''); 
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

        const cleanedCpfCnpj = cpfCnpj.replace(/\D/g, '');

        try {
            const response = await fetch("http://localhost:5000/usuarios/usuario/resetar-senha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cpfCnpj: cleanedCpfCnpj, 
                    dataNascimento,
                    novaSenha: newPassword,
                    confirmarNovaSenha: confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erro ao redefinir senha.");
            }

            toast({
                title: 'Sucesso',
                description: data.message,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);

            setCpfCnpj('');
            setDataNascimento('');
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
                    <Heading mb={6} textAlign="center" color="black" fontSize={20}>Redefinir Senha</Heading>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                            <FormControl isRequired id="cpfOuCnpj">
                                <FormLabel>CPF ou CNPJ</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FaUser color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                        as={IMaskInput} 
                                        mask={[
                                            { mask: '000.000.000-00', maxLength: 14 }, 
                                            { mask: '00.000.000/0000-00', maxLength: 18 } 
                                        ]}
                                        type="text" 
                                        placeholder="Digite seu CPF ou CNPJ"
                                        value={cpfCnpj}
                                        onAccept={(value: any) => setCpfCnpj(value)} 
                                        name="cpfOuCnpj" 
                                        overwrite 
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Data de Nascimento</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FaCalendarAlt color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                        type="date" 
                                        placeholder="DD/MM/AAAA" 
                                        value={dataNascimento}
                                        onChange={(e) => setDataNascimento(e.target.value)}
                                    />
                                </InputGroup>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Nova Senha</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none">
                                        <FaLock color="gray.300" />
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
                                        <FaLock color="gray.300" />
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
                                    loadingText="Redefinindo"
                                >
                                    Redefinir Senha
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default ResetPasswordPage;