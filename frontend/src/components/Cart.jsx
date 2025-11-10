import React from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, updateQuantity, getTotalPrice, clearCart } = useCart();
  // A URL da API continua a mesma
  const API_URL_PEDIDOS = "http://localhost:5001/pedidos";
  const navigate = useNavigate(); // <-- 2. INICIALIZE O HOOK
  //
  // --- FUNÇÃO ATUALIZADA ---
  //
  const handleCheckout = async () => {
    // 1. Pega o usuário logado do localStorage
    //    (Seu LoginPage/CadastroPage deve salvar 'usuario' no localStorage)
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // 2. Trava de segurança: impede a compra se o usuário não estiver logado
    if (!usuario || !usuario.id) {
      alert(
        "Erro: Usuário não identificado. Por favor, faça o login antes de finalizar o pedido."
      );
      // (Opcional: redirecionar para a página de login)
      return;
    }

    // 3. Cria o objeto do pedido (AGORA MAIS SIMPLES)
    //    O backend agora só espera: items, total, e o usuarioId.
    //    'data' e 'status' são gerados automaticamente no servidor.
    const pedido = {
      items: cartItems,
      total: getTotalPrice(),
      usuarioId: usuario.id, // <-- ESSA É A LIGAÇÃO CRUCIAL
    };

    try {
      // (Pagamento viria aqui)

      // 4. Envia o pedido para o backend
      const response = await axios.post(API_URL_PEDIDOS, pedido);

      console.log("Pedido enviado com sucesso:", response.data);

      // 5. Limpa o carrinho e avisa o usuário
      alert("Pedido realizado com sucesso!");
      clearCart();

      // --- 3. LÓGICA DE LOGOUT E REDIRECIONAMENTO ---
      localStorage.removeItem("usuario"); // Apaga o usuário do localStorage
      navigate("/"); // Redireciona para a página inicial (UsuarioPage)
      // ---------------------------------------------

    } catch (error) {
      console.error("Erro ao finalizar o pedido:", error);
      alert("Houve um erro ao processar seu pedido. Tente novamente.");
    }
  };
  //
  // --- FIM DA FUNÇÃO ATUALIZADA ---
  //

  // O JSX (parte visual) continua o mesmo
  return (
    <aside className="w-96 bg-gray-100 p-6 shadow-lg h-screen sticky top-0 overflow-y-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Seu Pedido</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">Seu carrinho está vazio.</p>
      ) : (
        <div className="flex flex-col h-full justify-between">
          {/* Lista de Itens */}
          {/* A classe 'grow' foi corrigida para 'flex-grow' para melhor compatibilidade */}
          <ul className="grow space-y-4 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
              >
                <div>
                  <h4 className="font-semibold">{item.nome}</h4>
                  <p className="text-sm text-gray-600">
                    R$ {(Number(item.preco) || 0).toFixed(2)}
                  </p>
                </div>
                {/* Controles de Quantidade */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold hover:bg-red-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold hover:bg-green-600"
                  >
                    + A{" "}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Total e Finalizar */}
          <div className="border-t-2 border-gray-300 pt-4 mt-4">
            <div className="flex justify-between items-center text-2xl font-bold mb-4">
              <span>Total:</span>
              <span>R$ {getTotalPrice().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white p-4 rounded-lg text-lg font-bold hover:bg-blue-700"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Cart;
