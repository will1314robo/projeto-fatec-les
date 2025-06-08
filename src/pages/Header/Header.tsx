import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  IconButton,
  Image,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Link
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import UserPopup from "../../components/UserPopup/UserPopup.tsx";

const Header = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const [isScrolled, setIsScrolled] = useState(false);

  const verificarToken = useCallback(() => {
    const token = sessionStorage.getItem("userToken");
    const authenticated = !!token;
    setIsAuthenticated(authenticated);

    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setIsAdmin(decodedPayload.perfil === "Admin");
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    verificarToken();

    const handleStorageChange = () => {
      verificarToken();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [verificarToken]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Box
        as="header"
        bg={isScrolled ? "blackAlpha.700" : "black"}
        color="white"
        py={4}
        px={6}
        transition="background-color 0.3s ease"
        boxShadow={isScrolled ? "md" : "none"}
        top="0"
        width="100%"
        zIndex={1000}
        position="relative"
      >
        <Flex align="center" justifyContent="space-between"> 
          <Box> 
            <IconButton
              icon={<HamburgerIcon />}
              aria-label="Menu"
              variant="ghost"
              color="white"
              fontSize="24px"
              onClick={() => setIsOpen(true)}
            />
          </Box>
          <Box
            position="absolute"
            left="50%"
            top="50%" 
            transform="translate(-50%, -50%)" 
            zIndex="1" 
          >
            <Image src="/assets/img/logo.png" alt="Logo" h="50px" objectFit="contain" />
          </Box>
          <Box>
            {location.pathname !== "/userform" && (
              <Flex gap={4}>
                {!isLoginPage && <UserPopup isAuthenticated={isAuthenticated} isAdmin={isAdmin} />}
                {isLoginPage && (
                  <a
                    href="/"
                    style={{ display: "inline-block", padding: "8px" }}
                    title="Retornar a Home"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      fill="#fff"
                      width="32"
                      height="32"
                    >
                      <path d="M48 256a208 208 0 1 1 416 0A208 208 0 1 1 48 256zm464 0A256 256 0 1 0 0 256a256 256 0 1 0 512 0zM217.4 376.9c4.2 4.5 10.1 7.1 16.3 7.1c12.3 0 22.3-10 22.3-22.3l0-57.7 96 0c17.7 0 32-14.3 32-32l0-32c0-17.7-14.3-32-32-32l-96 0 0-57.7c0-12.3-10-22.3-22.3-22.3c-6.2 0-12.1 2.6-16.3 7.1L117.5 242.2c-3.5 3.8-5.5 8.7-5.5 13.8s2 10.1 5.5 13.8l99.9 107.1z" />
                    </svg>
                  </a>
                )}
              </Flex>
            )}
          </Box>
        </Flex>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={() => setIsOpen(false)}>
        <DrawerOverlay bg="rgba(0, 0, 0, 0.5)" />
        <DrawerContent bg="blackAlpha.800">
          <DrawerCloseButton color="white" />
          <DrawerHeader color="white">Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="start" spacing={4}>
              <Link as={RouterLink} to="/" onClick={() => setIsOpen(false)} color="white">
                Home
              </Link>
              <Link as={RouterLink} to="/produtos" onClick={() => setIsOpen(false)} color="white">
                Nossos Produtos
              </Link>
              {isAdmin && (
                <>
                  <Link as={RouterLink} to="/cadastro-admin" onClick={() => setIsOpen(false)} color="white">
                    Cadastrar Admin
                  </Link>
                  <Link as={RouterLink} to="/produtoform" onClick={() => setIsOpen(false)} color="white">
                    Cadastrar Produto
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link as={RouterLink} to="/carrinho" onClick={() => setIsOpen(false)} color="white">
                  Ir ao carrinho
                </Link>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;