import React, { useState, useEffect,  } from "react";
import axios from "axios";
import Hero from "../components/Hero";
import Header from "../components/layout/Header";
import Categorias from "../components/Categorias";
import Cart from "../components/Cart";
import { useCart } from "../context/CartContext"; // Importe o useCart direto

const API_URL_CARDAPIO = "http://localhost:5001/cardapio";
const API_URL_SUGESTAO = "http://localhost:5001/gerar-sugestao";
const API_URL_image = "http://localhost:5001";

const CardapioPage = () => {
  const [produto, setProdutos] = useState([]);
  const [allProdutos, setAllProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // --- NOVO STATE PARA A IA ---
  const [sugestao, setSugestao] = useState(null);

  // Pegar addToCart E cartItems do contexto
  const { addToCart, cartItems } = useCart();

  const filtrarItens = (categoria) => {
    // ... (sua função de filtro continua igual)
    if (categoria === "todos") {
      setProdutos(allProdutos);
    } else {
      const novosItens = allProdutos.filter(
        (item) => item.categoria === categoria
      );
      setProdutos(novosItens);
    }
  };

  const consultarProdutos = async () => {
    try {
      const response = await axios.get(API_URL_CARDAPIO);
      setAllProdutos(response.data);
      setProdutos(response.data);
      const allCategories = [
        "todos",
        ...new Set(response.data.map((item) => item.categoria)),
      ];
      setCategorias(allCategories);
    } catch (error) {
      console.log("erro ao consultar o produto", error);
    }
  };

  // useEffect para buscar produtos (continua o mesmo)
  useEffect(() => {
    consultarProdutos();
  }, []);

  // --- NOVO useEffect PARA CHAMAR A IA ---
  useEffect(() => {
    // Função que chama o backend para gerar a sugestão
    const gerarSugestao = async () => {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      // Só gera sugestão se o usuário estiver logado
      if (!usuario || !usuario.id) {
        return;
      }

      try {
        // O backend só precisa de: usuarioId, cartItems e (opcional) temperatura
        const body = {
          usuarioId: usuario.id,
          cartItems: cartItems,
          temperatura: 29, // Simulando 29°C (você pode trocar por uma API de clima)
        };

        const response = await axios.post(API_URL_SUGESTAO, body);
        setSugestao(response.data.sugestao);
      } catch (error) {
        console.error("Erro ao buscar sugestão da IA:", error);
        setSugestao(null); // Limpa sugestão em caso de erro
      }
    };

    // Só roda a IA se os produtos já estiverem carregados
    if (allProdutos.length > 0) {
      // Dá um pequeno delay para não rodar a IA
      // instantaneamente ou a cada milissegundo
      const timer = setTimeout(() => {
        gerarSugestao();
      }, 1000); // 1 segundo de delay

      return () => clearTimeout(timer); // Limpa o timer se o componente desmontar
    }
  }, [allProdutos, cartItems]); // <-- GATILHO: Roda quando os produtos carregam E quando o carrinho muda

  return (
    <div className="flex">
      <div className="grow">
        {/* Corrigido de 'grow' para 'flex-grow' */}
        <Header />
        <Hero />
        {/* --- NOVO BLOCO DE SUGESTÃO DA IA --- */}
        {sugestao && (
          <div
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 mx-8 my-4 rounded shadow-md"
            role="alert"
          >
            <p className="font-bold">Assistente 🤖 diz:</p>
            <p>{sugestao}</p>
          </div>
        )}
        {/* ----------------------------------- */}
        <main className="flex flex-col items-center mt-8">
          <h2 className="text-2xl">Cardapio Completo</h2>
          {/* ... (resto do seu JSX: Categorias, <ul>, <li>, etc) ... */}
          <Categorias filtroItems={filtrarItens} categorias={categorias} />

          <ul
            className="flex flex-wrap justify-center items-center gap-20 p-4 m-20 mt-0"
            id="games"
          >
            {produto.map((item) => {
              const imagePath = item.imagem.replace(/\\/g, "/");
              const imageUrl = `${API_URL_image}/${imagePath}`;
              return (
                <li
                  key={item.id}
                  className="shadow-3 flex flex-col justify-center items-center"
                >
                  <div className="flex items-center justify-center w-64 h-64">
                    <img
                      src={imageUrl}
                      alt={item.nome}
                      className="flex rounded-2xl w-full h-full object-cover hover:transition-opacity hover:opacity-55 duration-200"
                    />
                  </div>
                  <div>
                    <p className="flex flex-col justify-center items-center text-xl w-70 text-center">
                      <strong className="text-2xl">{item.nome} </strong>
                      {item.descricao}
                    </p>
                    <p className="text-center text-xl font-bold text-green-600 mt-2">
                      R$ {(Number(item.preco) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-green-500 text-white font-semibold p-3 mt-2 rounded-2xl hover:bg-green-700"
                    >
                      Comprar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </main>
      </div>
      <Cart />
    </div>
  );
};

export default CardapioPage;
