import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Adicionar item ao carrinho (ou incrementar quantidade)
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.id === product.id);
      if (itemExists) {
        // Se o item já existe, apenas incrementa a quantidade
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Se é um novo item, adiciona ao carrinho com quantidade 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Atualizar a quantidade de um item (para botões + e -)
  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        // Remove o item se a quantidade for 0 ou menor
        return prevItems.filter((item) => item.id !== productId);
      }
      // Atualiza a quantidade do item específico
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  // Limpar o carrinho (após finalizar a compra)
  const clearCart = () => {
    setCartItems([]);
  };

  // Calcular o preço total
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      // Certifique-se que item.preco existe e é um número
      const price = Number(item.preco) || 0; 
      return total + price * item.quantity;
    }, 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;