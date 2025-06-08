--
-- Banco de dados: charada
--
CREATE DATABASE IF NOT EXISTS charada DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE charada;

-- --------------------------------------------------------

--
-- Estrutura para tabela carrinhos
--

DROP TABLE IF EXISTS carrinhos;
CREATE TABLE IF NOT EXISTS carrinhos (
  id int NOT NULL AUTO_INCREMENT,
  usuario_id int NOT NULL,
  criado_em datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY usuario_id (usuario_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela carrinho_item
--

DROP TABLE IF EXISTS carrinho_item;
CREATE TABLE IF NOT EXISTS carrinho_item (
  ID int NOT NULL AUTO_INCREMENT,
  ID_Usuario int NOT NULL,
  ID_Produto int NOT NULL,
  Quantidade int NOT NULL DEFAULT '1',
  PRIMARY KEY (ID),
  KEY FK_Usuario (ID_Usuario),
  KEY FK_Produto (ID_Produto)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela carrinho_itens
--

DROP TABLE IF EXISTS carrinho_itens;
CREATE TABLE IF NOT EXISTS carrinho_itens (
  id int NOT NULL AUTO_INCREMENT,
  carrinho_id int NOT NULL,
  produto_id int NOT NULL,
  quantidade int NOT NULL,
  PRIMARY KEY (id),
  KEY carrinho_id (carrinho_id),
  KEY produto_id (produto_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela chamados
--

DROP TABLE IF EXISTS chamados;
CREATE TABLE IF NOT EXISTS chamados (
  ID int NOT NULL AUTO_INCREMENT,
  PedidoID int NOT NULL,
  Descricao text NOT NULL,
  Whatsapp varchar(50) NOT NULL,
  Email varchar(100) NOT NULL,
  DataAbertura timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID),
  KEY PedidoID (PedidoID)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela cupons
--

DROP TABLE IF EXISTS cupons;
CREATE TABLE IF NOT EXISTS cupons (
  ID int NOT NULL AUTO_INCREMENT,
  Codigo varchar(50) NOT NULL,
  Usuario_ID int NOT NULL,
  MesAno varchar(7) NOT NULL,
  DataCriacao datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  DataUtilizacao datetime DEFAULT NULL,
  Utilizado tinyint(1) NOT NULL DEFAULT '0',
  ValorDesconto decimal(10,2) NOT NULL,
  Tipo enum('Aniversario','Promocional') NOT NULL,
  PRIMARY KEY (ID),
  UNIQUE KEY Codigo (Codigo),
  KEY Usuario_ID (Usuario_ID)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela envioaniversariantes
--

DROP TABLE IF EXISTS envioaniversariantes;
CREATE TABLE IF NOT EXISTS envioaniversariantes (
  id int NOT NULL AUTO_INCREMENT,
  mes_ano varchar(7) NOT NULL,
  data_envio datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY mes_ano (mes_ano)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela imagem_dados
--

DROP TABLE IF EXISTS imagem_dados;
CREATE TABLE IF NOT EXISTS imagem_dados (
  ImagemID int NOT NULL AUTO_INCREMENT,
  Dados longblob NOT NULL,
  PRIMARY KEY (ImagemID)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela imagem_produto
--

DROP TABLE IF EXISTS imagem_produto;
CREATE TABLE IF NOT EXISTS imagem_produto (
  ID int NOT NULL AUTO_INCREMENT,
  ProdutoID int NOT NULL,
  Caminho text NOT NULL,
  Tipo enum('url','upload') NOT NULL,
  MimeType varchar(100) DEFAULT NULL,
  Tamanho int DEFAULT NULL,
  PRIMARY KEY (ID),
  KEY ProdutoID (ProdutoID)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela itempedido
--

DROP TABLE IF EXISTS itempedido;
CREATE TABLE IF NOT EXISTS itempedido (
  ID int NOT NULL,
  ID_Produto int NOT NULL,
  Quantidade int NOT NULL,
  Preco double(10,2) NOT NULL,
  PRIMARY KEY (ID),
  KEY ID_Produto (ID_Produto)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela pagamento
--

DROP TABLE IF EXISTS pagamento;
CREATE TABLE IF NOT EXISTS pagamento (
  ID int NOT NULL,
  ID_Pedido int NOT NULL,
  ID_Usuario int NOT NULL,
  MetodoDePag enum('Cartão de Crédito','Cartão de Débito','Boleto','Pix','Dinheiro') NOT NULL,
  PRIMARY KEY (ID),
  KEY ID_Pedido (ID_Pedido),
  KEY ID_Usuario (ID_Usuario)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela pedido
--

DROP TABLE IF EXISTS pedido;
CREATE TABLE IF NOT EXISTS pedido (
  ID int NOT NULL AUTO_INCREMENT,
  ID_Usuario int NOT NULL,
  Status enum('Em andamento','Concluído','Cancelado','Pendente') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  Data date NOT NULL,
  Valor decimal(10,2) NOT NULL,
  Posicao varchar(100) NOT NULL,
  atualizado tinyint NOT NULL DEFAULT '0',
  ID_Cupom int DEFAULT NULL,
  PRIMARY KEY (ID),
  KEY ID_Usuario (ID_Usuario)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela pedido_itempedido
--

DROP TABLE IF EXISTS pedido_itempedido;
CREATE TABLE IF NOT EXISTS pedido_itempedido (
  ID_Pedido int NOT NULL,
  ID_ItemPedido int NOT NULL,
  PRIMARY KEY (ID_Pedido,ID_ItemPedido),
  KEY ID_ItemPedido (ID_ItemPedido)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela pedido_itens
--

DROP TABLE IF EXISTS pedido_itens;
CREATE TABLE IF NOT EXISTS pedido_itens (
  ID int NOT NULL AUTO_INCREMENT,
  ID_Pedido int NOT NULL,
  ID_Produto int NOT NULL,
  Quantidade int NOT NULL,
  PrecoUnitario decimal(10,2) NOT NULL,
  PRIMARY KEY (ID),
  KEY ID_Pedido (ID_Pedido),
  KEY ID_Produto (ID_Produto)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela produto
--

DROP TABLE IF EXISTS produto;
CREATE TABLE IF NOT EXISTS produto (
  ID int NOT NULL AUTO_INCREMENT,
  Nome varchar(100) NOT NULL,
  Preco decimal(10,2) NOT NULL,
  Status enum('Disponível','Indisponível') NOT NULL,
  Categoria varchar(50) NOT NULL,
  Descricao text NOT NULL,
  PRIMARY KEY (ID)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela relatorio
--

DROP TABLE IF EXISTS relatorio;
CREATE TABLE IF NOT EXISTS relatorio (
  ID int NOT NULL,
  ID_Usuario int NOT NULL,
  ID_Pagamento int NOT NULL,
  Obs text,
  Status enum('Pendente','Finalizado','Cancelado') NOT NULL,
  PRIMARY KEY (ID),
  KEY ID_Usuario (ID_Usuario),
  KEY ID_Pagamento (ID_Pagamento)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela usuario
--

DROP TABLE IF EXISTS usuario;
CREATE TABLE IF NOT EXISTS usuario (
  ID int NOT NULL AUTO_INCREMENT,
  Nome varchar(100) NOT NULL,
  DataNasc date NOT NULL,
  Telefone varchar(20) DEFAULT NULL,
  Tipo enum('PF','PJ') NOT NULL,
  Perfil enum('Cliente','Admin') NOT NULL,
  CNPJ varchar(18) DEFAULT NULL,
  CPF varchar(14) DEFAULT NULL,
  Email varchar(100) NOT NULL,
  Senha varchar(255) NOT NULL,
  PRIMARY KEY (ID),
  UNIQUE KEY Email (Email),
  UNIQUE KEY CNPJ (CNPJ),
  UNIQUE KEY CPF (CPF)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;
