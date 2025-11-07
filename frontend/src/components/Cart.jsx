import React from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Cart = () => {
  const { cartItems, updateQuantity, getTotalPrice, clearCart } = useCart();
  const API_URL_PEDIDOS = "http://localhost:5001/pedidos"; // Novo endpoint no seu backend

  const handleCheckout = async () => {
    const pedido = {
      items: cartItems,
      total: getTotalPrice(),
      data: new Date().toISOString(),
      status: 'pendente' // O funcionário verá isso
    };

    try {
      // 1. (Opcional) Integrar com API de pagamento aqui
      // Se o pagamento for bem-sucedido:

      // 2. Envia o pedido para o backend
      const response = await axios.post(API_URL_PEDIDOS, pedido);
      
      console.log('Pedido enviado com sucesso:', response.data);

      // 3. Limpa o carrinho e avisa o usuário
      alert('Pedido realizado com sucesso! Retire sua senha.');
      clearCart();

    } catch (error) {
      console.error('Erro ao finalizar o pedido:', error);
      alert('Houve um erro ao processar seu pedido. Tente novamente.');
    }
  };

  return (
    <aside className="w-96 bg-gray-100 p-6 shadow-lg h-screen sticky top-0 overflow-y-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Seu Pedido</h2>
      
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">Seu carrinho está vazio.</p>
      ) : (
        <div className="flex flex-col h-full justify-between">
          {/* Lista de Itens */}
          <ul className="flex flex-grow space-y-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow">
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
                    className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold"
                  >
                    +
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