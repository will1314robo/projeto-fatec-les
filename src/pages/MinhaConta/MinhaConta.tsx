import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  Container,
  SimpleGrid,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";

type Usuario = {
  nome: string;
  cpfOuCnpj: string;
  dataNascimento: string;
  email: string | null;
  telefone: string | null;
};

const MinhaConta = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editNome.trim()) {
      newErrors.nome = "O nome é obrigatório.";
    } else if (editNome.trim().length < 3) {
      newErrors.nome = "O nome deve ter no mínimo 3 caracteres.";
    } else if (editNome.trim().length > 100) {
      newErrors.nome = "O nome deve ter no máximo 100 caracteres.";
    }

    if (!editEmail.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      newErrors.email = "O e-mail deve ser um endereço de e-mail válido.";
    } else if (editEmail.trim().length > 255) {
      newErrors.email = "O e-mail não pode ter mais de 255 caracteres.";
    }

    const cleanedTelefone = editTelefone.replace(/\D/g, '');
    if (!cleanedTelefone) {
      newErrors.telefone = "O telefone é obrigatório.";
    } else if (cleanedTelefone.length < 10 || cleanedTelefone.length > 11) {
      newErrors.telefone = "O telefone deve ter 10 ou 11 dígitos (incluindo DDD).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUsuarioData = useCallback(async () => {
    setLoading(true);
    const token = sessionStorage.getItem("userToken");

    if (!token) {
      navigate("/login");
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para ver seus dados.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/usuarios/perfil", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao buscar dados do usuário.");
      }

      const data: Usuario = await res.json();
      setUsuario(data);
      setEditNome(data.nome || "");
      setEditEmail(data.email || "");
      setEditTelefone(data.telefone ? data.telefone.replace(/\D/g, '') : "");

    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro",
        description: err.message || "Não foi possível carregar os dados do usuário.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      if (err.message.includes("autenticado") || err.message.includes("Token")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchUsuarioData();
  }, [fetchUsuarioData]);

  const handleSave = async () => {
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
    setIsSaving(true);
    const token = sessionStorage.getItem("userToken");

    if (!token) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Faça login novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/usuarios/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: editNome,
          email: editEmail,
          telefone: editTelefone.replace(/\D/g, ''),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar informações.");
      }

      toast({
        title: "Sucesso!",
        description: "Informações atualizadas com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchUsuarioData();
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      toast({
        title: "Erro ao salvar",
        description: err.message || "Não foi possível atualizar as informações.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return dateString;
    }
  };

  const formatPhoneNumberDisplay = (phoneNumber: string | null) => {
    if (!phoneNumber) return "N/A";
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length === 11) {
      formatted = cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      formatted = cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return formatted;
  };

  const formatCpfCnpjDisplay = (value: string | null) => {
    if (!value) return "N/A";
    const cleaned = ('' + value).replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (cleaned.length === 14) {
      return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!usuario) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Text color="red.400">Não foi possível carregar os dados do usuário.</Text>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, blue.500, purple.500)"
    >
      <Container maxW="md">
        <SimpleGrid borderWidth="1px" borderRadius="lg" p={8} boxShadow="lg" bg="white">
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">
              Minha Conta
            </Heading>
            <VStack spacing={3} align="start">
              <Text>
                <strong>Nome:</strong> {usuario.nome}
              </Text>
              <Text>
                <strong>Email:</strong> {usuario.email || "N/A"}
              </Text>
              <Text>
                <strong>Telefone:</strong> {formatPhoneNumberDisplay(usuario.telefone)}
              </Text>
              <Text>
                <strong>CPF/CNPJ:</strong> {formatCpfCnpjDisplay(usuario.cpfOuCnpj)} (Não editável)
              </Text>
              <Text>
                <strong>Data de Nascimento:</strong>{" "}
                {formatDate(usuario.dataNascimento)} (Não editável)
              </Text>
            </VStack>
            <Button colorScheme="teal" onClick={onOpen} mt={4}>
              Editar Perfil
            </Button>
          </VStack>
        </SimpleGrid>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Informações</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="nome" isRequired isInvalid={!!errors.nome}>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  placeholder="Seu nome completo"
                />
                {errors.nome && <FormErrorMessage>{errors.nome}</FormErrorMessage>}
              </FormControl>

              <FormControl id="email" isRequired isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Seu email"
                />
                {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              </FormControl>

              <FormControl id="telefone" isRequired isInvalid={!!errors.telefone}>
                <FormLabel>Telefone</FormLabel>
                <Input
                  as={IMaskInput}
                  mask={[
                    { mask: '(00) 0000-0000' },
                    { mask: '(00) 00000-0000' }
                  ]}
                  value={editTelefone}
                  onAccept={(value: any) => setEditTelefone(value)}
                  placeholder="Seu telefone"
                  overwrite
                />
                {errors.telefone && <FormErrorMessage>{errors.telefone}</FormErrorMessage>}
              </FormControl>

              <FormControl id="cpfOuCnpj">
                <FormLabel>CPF/CNPJ</FormLabel>
                <Input value={formatCpfCnpjDisplay(usuario.cpfOuCnpj)} isReadOnly border="none" bg="gray.100" />
              </FormControl>
              <FormControl id="dataNascimento">
                <FormLabel>Data de Nascimento</FormLabel>
                <Input
                  value={formatDate(usuario.dataNascimento)}
                  isReadOnly
                  border="none"
                  bg="gray.100"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="teal" ml={3} onClick={handleSave} isLoading={isSaving}>
              Salvar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MinhaConta;