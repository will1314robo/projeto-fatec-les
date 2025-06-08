import { useState } from "react";
import {
  Box, Button, Container, FormControl, FormLabel, Heading, Input,
  SimpleGrid, VStack, useToast,
  Flex,
  Select,
  Spacer,
  FormErrorMessage
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import React from "react";
import { IMaskInput } from "react-imask"; 

interface User {
  nome: string;
  dataNasc: string;
  telefone: string;
  tipo: "PF" | "PJ"; 
  perfil: "Admin";
  cnpj?: string; 
  cpf?: string;
  email: string;
  senha: string;
}

const CadastroAdmin = () => {
  const [user, setUser] = useState<User>({
    nome: "",
    dataNasc: "",
    telefone: "",
    tipo: "PF", 
    perfil: "Admin",
    cnpj: "", 
    cpf: "",
    email: "",
    senha: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({}); 

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!user.nome.trim()) {
      newErrors.nome = "O nome é obrigatório.";
    } else if (user.nome.trim().length < 3) {
      newErrors.nome = "O nome deve ter no mínimo 3 caracteres.";
    } else if (user.nome.trim().length > 100) {
      newErrors.nome = "O nome deve ter no máximo 100 caracteres.";
    }

    if (!user.dataNasc) {
      newErrors.dataNasc = "A data de nascimento é obrigatória.";
    } else {
      const dataNasc = new Date(user.dataNasc);
      const hoje = new Date();
      if (dataNasc > hoje) {
        newErrors.dataNasc = "A data de nascimento não pode ser no futuro.";
      }
    }

    const cleanedTelefone = user.telefone.replace(/\D/g, '');
    if (!cleanedTelefone) {
      newErrors.telefone = "O telefone é obrigatório.";
    } else if (cleanedTelefone.length < 10 || cleanedTelefone.length > 11) {
      newErrors.telefone = "O telefone deve ter 10 ou 11 dígitos (incluindo DDD).";
    }

    if (user.tipo === "PF") {
      const cleanedCpf = user.cpf ? user.cpf.replace(/\D/g, '') : '';
      if (!cleanedCpf) {
        newErrors.cpf = "O CPF é obrigatório para Pessoa Física.";
      } else if (cleanedCpf.length !== 11) {
        newErrors.cpf = "O CPF deve ter 11 dígitos.";
      }
    } else if (user.tipo === "PJ") {
      const cleanedCnpj = user.cnpj ? user.cnpj.replace(/\D/g, '') : '';
      if (!cleanedCnpj) {
        newErrors.cnpj = "O CNPJ é obrigatório para Pessoa Jurídica.";
      } else if (cleanedCnpj.length !== 14) {
        newErrors.cnpj = "O CNPJ deve ter 14 dígitos.";
      }
    }

    if (!user.email.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "O e-mail deve ser um endereço de e-mail válido.";
    } else if (user.email.trim().length > 255) {
      newErrors.email = "O e-mail não pode ter mais de 255 caracteres.";
    }

    if (!user.senha) {
      newErrors.senha = "A senha é obrigatória.";
    } else if (user.senha.length < 8) {
      newErrors.senha = "A senha deve ter no mínimo 8 caracteres.";
    }

    if (!user.tipo) {
      newErrors.tipo = "O tipo de usuário é obrigatório.";
    }

    if (!user.perfil) {
      newErrors.perfil = "O perfil é obrigatório.";
    } else if (user.perfil !== "Admin") { 
      newErrors.perfil = "O perfil deve ser 'Admin'.";
    }

    setErrors(newErrors); 
    return Object.keys(newErrors).length === 0; 
  };

  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleMaskedInputChange = (name: string, value: string) => {
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: "Verifique os campos",
        description: "Por favor, corrija os erros no formulário.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return; 
    }

    const userToSubmit = { ...user };
    if (userToSubmit.telefone) {
      userToSubmit.telefone = userToSubmit.telefone.replace(/\D/g, '');
    }
    if (userToSubmit.cpf) {
      userToSubmit.cpf = userToSubmit.cpf.replace(/\D/g, '');
    }
    if (userToSubmit.cnpj) {
      userToSubmit.cnpj = userToSubmit.cnpj.replace(/\D/g, '');
    }

    try {
      const response = await fetch("http://localhost:5000/usuarios/usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToSubmit), 
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        });

        setTimeout(() => {
          navigate("/");
        }, 3000);

      } else {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((errMsg: string) => {
            toast({
              title: "Erro de Validação",
              description: errMsg,
              status: "error",
              duration: 3000,
              isClosable: true,
              position: "top"
            });
          });
        } else {
          toast({
            title: data.message || "Erro ao cadastrar usuário",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao conectar ao servidor",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
    }
  };

  return (
    <Box py={5}>
      <Spacer />
      <br />
      <Container maxW="container.xl">
        <Heading mb={4} justifyContent="center" textAlign="center">Cadastro de Administrador</Heading> {/* Alterei o título */}
        <SimpleGrid width="100%" borderWidth="1px" borderRadius="lg" overflow="hidden" p={6} sx={{ background: "rgba(255, 255, 255, 0.5)" }}>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={4} width="100%">
              <FormControl isRequired isInvalid={!!errors.nome}>
                <FormLabel>Nome</FormLabel>
                <Input name="nome" value={user.nome} onChange={handleChange} />
                {errors.nome && <FormErrorMessage>{errors.nome}</FormErrorMessage>}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.dataNasc}>
                <FormLabel>Data de Nascimento</FormLabel>
                <Input type="date" name="dataNasc" value={user.dataNasc} onChange={handleChange} />
                {errors.dataNasc && <FormErrorMessage>{errors.dataNasc}</FormErrorMessage>}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.telefone}>
                <FormLabel>Telefone</FormLabel>
                <Input
                  as={IMaskInput}
                  mask={[
                    { mask: '(00) 0000-0000' },
                    { mask: '(00) 00000-0000' }
                  ]}
                  name="telefone"
                  value={user.telefone}
                  onAccept={(value: any) => handleMaskedInputChange("telefone", value)}
                  placeholder="Seu telefone"
                  overwrite
                />
                {errors.telefone && <FormErrorMessage>{errors.telefone}</FormErrorMessage>}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.tipo}>
                <FormLabel>Tipo</FormLabel>
                <Select name="tipo" value={user.tipo} onChange={handleChange}>
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </Select>
                {errors.tipo && <FormErrorMessage>{errors.tipo}</FormErrorMessage>}
              </FormControl>

              {user.tipo === "PJ" && (
                <FormControl isRequired isInvalid={!!errors.cnpj}>
                  <FormLabel>CNPJ</FormLabel>
                  <Input
                    as={IMaskInput}
                    mask="00.000.000/0000-00"
                    name="cnpj"
                    value={user.cnpj}
                    onAccept={(value: any) => handleMaskedInputChange("cnpj", value)}
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    overwrite
                  />
                  {errors.cnpj && <FormErrorMessage>{errors.cnpj}</FormErrorMessage>}
                </FormControl>
              )}
              {user.tipo === "PF" && (
                <FormControl isRequired isInvalid={!!errors.cpf}>
                  <FormLabel>CPF</FormLabel>
                  <Input
                    as={IMaskInput}
                    mask="000.000.000-00"
                    name="cpf"
                    value={user.cpf}
                    onAccept={(value: any) => handleMaskedInputChange("cpf", value)}
                    placeholder="XXX.XXX.XXX-XX"
                    overwrite
                  />
                  {errors.cpf && <FormErrorMessage>{errors.cpf}</FormErrorMessage>}
                </FormControl>
              )}

              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" value={user.email} onChange={handleChange} />
                {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.senha}>
                <FormLabel>Senha</FormLabel>
                <Input type="password" name="senha" value={user.senha} onChange={handleChange} />
                {errors.senha && <FormErrorMessage>{errors.senha}</FormErrorMessage>}
              </FormControl>

              <Flex width="100%" justifyContent="flex-end" gap={4}>
                <Button as={RouterLink} to="/" colorScheme="orange" width="10%">
                  Voltar
                </Button>

                <Button type="submit" colorScheme="blue" width="10%">
                  Cadastrar
                </Button>
              </Flex>
            </VStack>
          </form>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default CadastroAdmin;