import React, { useState, useEffect } from "react";
import axios from "axios";

// URL da sua API
const API_URL = "http://localhost:5001/pedidos";

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Função para buscar os pedidos no backend
  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      // Ordena os pedidos do mais velho a o mais novo
      setPedidos(
        response.data.sort((a, b) => new Date(a.data) - new Date(b.data))
      );
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Não foi possível carregar os pedidos.");
    } finally {
      setLoading(false);
    }
  };

  // 2. useEffect para buscar os pedidos quando a página carregar
  useEffect(() => {
    fetchPedidos();
  }, []);

  // 3. Função para finalizar (deletar) um pedido
  const handleFinalizar = async (id) => {
    // Confirmação para evitar cliques acidentais
    if (!window.confirm("Tem certeza que deseja finalizar este pedido?")) {
      return;
    }

    try {
      // Chama a rota DELETE no backend
      await axios.delete(`${API_URL}/${id}`);

      // Atualiza a lista de pedidos na tela IMEDIATAMENTE,
      // removendo o que foi finalizado.
      setPedidos((prevPedidos) =>
        prevPedidos.filter((pedido) => pedido.id !== id)
      );
    } catch (err) {
      console.error("Erro ao finalizar pedido:", err);
      alert("Erro ao tentar finalizar o pedido. Tente novamente.");
    }
  };

  // --- Renderização ---
  if (loading) {
    return <div className="p-8 text-center text-xl">Carregando pedidos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-xl text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        Painel de Pedidos
      </h1>

      {pedidos.length === 0 ? (
        <p className="text-center text-2xl text-gray-500">
          Nenhum pedido pendente no momento.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {/* 4. Mapeia cada pedido para um "Card" */}
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Pedido (Total: R$ {pedido.total.toFixed(2)})
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Recebido às: {new Date(pedido.data).toLocaleTimeString()}
                </p>

                {/* Lista de itens no pedido */}
                <ul className="list-disc list-inside mb-6 space-y-1">
                  {pedido.items.map((item) => (
                    <li key={item.id} className="text-lg">
                      <span className="font-semibold">{item.quantity}x</span>{" "}
                      {item.nome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Botão para finalizar/deletar */}
              <button
                onClick={() => handleFinalizar(pedido.id)}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Finalizar Pedido
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PedidosPage;
