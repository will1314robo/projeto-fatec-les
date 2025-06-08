import { Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./pages/Header/Header.tsx";
import Footer from "./pages/Footer/Footer.tsx";
import Home from "./pages/Home/Home.tsx";
import Produtos from "./pages/Produtos/Produtos.tsx";
import UserForm from "./pages/Usuarios/UserForm.tsx";
import ProdutoForm from "./pages/Produtos/ProdutoForm.tsx";
import LoginPage from "./pages/Login/LoginPage.tsx";
import ChangePasswordPage from "./pages/Login/ChangePasswordPage.tsx";
import PrivateRoute from "./components/Private/PrivateRoute.tsx";
import ProdutoEspecifico from "./pages/ProdutoEspecifico/ProdutoEspecifico.tsx";
import CatalogCarousel from "./pages/CatalogCarousel/CatalogCarousel.tsx";
import Carrinho from "./pages/Carrinho/Carrinho.tsx";
import { CarrinhoProvider } from "./components/Carrinho/CarrinhoContext.tsx";
import React from "react";
import "./App.css"; 
import CadastroAdmin from "./pages/Usuarios/CadastroAdmin.tsx";
import EditProduto from "./pages/Produtos/EditProduto.tsx";
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin.tsx";
import MinhaConta from "./pages/MinhaConta/MinhaConta.tsx";
import ListaPedidos from "./pages/ListaPedidos/ListaPedidos.tsx";
import ListaChamados from "./pages/ListaChamados/ListaChamados.tsx";
import DeleteProduto from "./pages/Produtos/DeleteProduto.tsx";
import ResetPasswordPage from "./pages/Login/ResetPasswordPage.tsx";

function App() {
  return (
    <CarrinhoProvider>
      <Router>
        <Box minH="100vh" display="flex" flexDirection="column" bg="gray.100">
          <Header />
          <Box as="main" flex="1">
            <Routes>
              <Route path="/produtos/editprod/:id" element={<EditProduto />} />
              <Route path="/produtos/deleteprod/:id" element={<DeleteProduto />} />
              <Route path="/pedidos" element={<ListaPedidos />} />
              <Route path="/chamados" element={<ListaChamados />} />
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/produto-especifico/:id" element={<ProdutoEspecifico />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/catalogo" element={<CatalogCarousel />} />
              <Route path="/userform" element={<UserForm />} />
              <Route path="/produtoform" element={<ProdutoForm />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/alterar-senha" element={<ChangePasswordPage />} />
              <Route path="/cadastro-admin" element={<CadastroAdmin />} />
              <Route path="/admin/dashboard" element={<DashboardAdmin />} />
              <Route path="/minha-conta" element={<MinhaConta />} />
              <Route path="/esqueci-senha" element={ <ResetPasswordPage />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </CarrinhoProvider>
  );
}


export default App;
