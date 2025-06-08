import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagens: string[];
  quantidade: number;
}

interface CarrinhoContextType {
  itens: Produto[];
  adicionarProduto: (produto: Produto) => Promise<void>;
  removerProduto: (id: number) => Promise<void>;
  alterarQuantidade: (id: number, quantidade: number) => Promise<void>;
  carregarCarrinho: () => Promise<void>;
  carregando: boolean;
  clearCarrinho: () => Promise<void>;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export const CarrinhoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itens, setItens] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);

  const getAuthInfo = () => {
    const token = sessionStorage.getItem("userToken");
    let userId: number | null = null;

    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        userId = decodedPayload.id || null; 
      } catch (error) {
        console.error("Erro ao decodificar token para userId:", error);
        return { token: null, userId: null };
      }
    }
    return { token, userId };
  };

  const carregarCarrinho = useCallback(async () => {
    setCarregando(true);
    const { token, userId } = getAuthInfo(); 

    try {
      if (!token || !userId) { 
        const localCart = sessionStorage.getItem('carrinhoLocal');
        setItens(localCart ? JSON.parse(localCart) : []);
        return;
      }

      const response = await fetch('http://localhost:5000/carrinho/pegarCarrinho', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        const itensFormatados = data.itens.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          preco: parseFloat(item.preco),
          quantidade: item.quantidade,
          imagens: item.imagens || [],
        }));
        console.log('Itens formatados no carrinho:', itensFormatados);
        setItens(itensFormatados);
      } else {
        console.error('Erro ao carregar carrinho do backend:', response.statusText);
        setItens([]);
      }
    } catch (error) {
      console.error('Erro de rede ao carregar carrinho:', error);
      setItens([]);
    } finally {
      setCarregando(false);
    }
  }, []); 

  const adicionarProduto = async (produto: Produto) => {
    const { token, userId } = getAuthInfo();
    const novoItem = { ...produto, quantidade: 1 };

    setItens(prev => {
      const existente = prev.find(item => item.id === produto.id);
      const novosItens = existente
        ? prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
        : [...prev, novoItem];

      if (!token) { 
        sessionStorage.setItem('carrinhoLocal', JSON.stringify(novosItens));
      }
      return novosItens;
    });

    if (token && userId) { 
      try {
        await fetch('http://localhost:5000/carrinho/adicionar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            produtoId: produto.id,
            quantidade: 1,
            userId: userId 
          })
        });
        await carregarCarrinho(); 
      } catch (error) {
        console.error('Erro ao adicionar ao carrinho no backend:', error);
        await carregarCarrinho(); 
      }
    }
  };

  const removerProduto = async (id: number) => {
    const { token, userId } = getAuthInfo();
    const itemRemovido = itens.find(i => i.id === id); 

    setItens(prev => {
      const novosItens = prev.filter(item => item.id !== id);
      if (!token) {
        sessionStorage.setItem('carrinhoLocal', JSON.stringify(novosItens));
      }
      return novosItens;
    });

    if (token && userId) {
      try {
        await fetch(`http://localhost:5000/carrinho/remover/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: userId }) 
        });
        await carregarCarrinho(); 
      } catch (error) {
        console.error('Erro ao remover do carrinho no backend:', error);
        await carregarCarrinho(); 
      }
    }
  };

  const alterarQuantidade = async (id: number, quantidade: number) => {
    const { token, userId } = getAuthInfo();
    const novaQuantidade = Math.max(quantidade, 0); 

    if (novaQuantidade === 0) {
      await removerProduto(id);
      return;
    }

    setItens(prev => {
      const novosItens = prev.map(item =>
        item.id === id ? { ...item, quantidade: novaQuantidade } : item
      );
      if (!token) {
        sessionStorage.setItem('carrinhoLocal', JSON.stringify(novosItens));
      }
      return novosItens;
    });

    if (token && userId) {
      try {
        await fetch('http://localhost:5000/carrinho/atualizar', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            produtoId: id,
            quantidade: novaQuantidade,
            userId: userId 
          })
        });
        await carregarCarrinho(); 
      } catch (error) {
        console.error('Erro ao atualizar quantidade no backend:', error);
        await carregarCarrinho(); 
      }
    }
  };

  const clearCarrinho = async () => {
    setItens([]); 
    sessionStorage.removeItem('carrinhoLocal'); 

    const { token, userId } = getAuthInfo();
    if (token && userId) {
      try {
        await fetch('http://localhost:5000/carrinho/limpar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ userId: userId }) 
        });
      } catch (error) {
        console.error('Erro ao limpar carrinho no backend:', error);
        await carregarCarrinho(); 
      }
    }
  };

  useEffect(() => {
    carregarCarrinho();
  }, [carregarCarrinho]); 

  return (
    <CarrinhoContext.Provider value={{
      itens,
      adicionarProduto,
      removerProduto,
      alterarQuantidade,
      carregarCarrinho,
      carregando,
      clearCarrinho
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  }
  return context;
};