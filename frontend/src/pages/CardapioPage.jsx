import React, { useState, useEffect } from "react";
import axios from "axios";
import Hero from "../components/Hero";
import Header from "../components/layout/Header";
import Categorias from "../components/Categorias";

const API_URL = "http://localhost:5001/cardapio";
const API_URL_image = "http://localhost:5001";

const CardapioPage = () => {
  const [produto, setProdutos] = useState([]);
  const [allProdutos, setAllProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const filtrarItens = (categoria) => {
    if (categoria === "todos") {
      // Se a categoria for "todos", mostra a lista original completa
      setProdutos(allProdutos);
    } else {
      // Filtra a lista original baseada na categoria selecionada
      const novosItens = allProdutos.filter(
        (item) => item.categoria === categoria
      );
      setProdutos(novosItens);
    }
  };

  const consultarProdutos = async () => {
    try {
      const response = await axios.get(`${API_URL}`);

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

  useEffect(() => {
    consultarProdutos();
  }, []);

  return (
    <div>
      <Header />
      <Hero />
      <main className="flex flex-col items-center mt-8">
        <h2 className="text-2xl">Cardapio Completo</h2>
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
                </div>
                <div className="flex items-center justify-center">
                  <button className="bg-green-500 p-3 mt-2 rounded-2xl hover:bg-green-700">
                    Comprar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default CardapioPage;
