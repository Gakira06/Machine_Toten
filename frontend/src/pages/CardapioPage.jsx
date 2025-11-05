import React, {useState, useEffect } from "react";
import axios from "axios";
import Hero from "../components/Hero";
import Header from "../components/layout/Header";

const API_URL = "http://localhost:5001/cardapio";
const API_URL_image = "http://localhost:5001";

const CardapioPage = () => {
  const [produto, setProdutos] = useState([]);

  const consultarProdutos = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      setProdutos(response.data);
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
      </main>
      <ul className="flex flex-wrap justify-center items-center gap-20 p-4" id="games">
        {produto.map((item) => {
          const imagePath = item.imagem.replace(/\\/g, "/");
          const imageUrl = `${API_URL_image}/${imagePath}`;
          return (
            <li key={item.id} className="shadow-3 flex flex-col justify-center itens-center ">
              <div className="flex items-center justify-center w-64 h-64">
                <img src={imageUrl} alt={item.nome} className="rounded-2xl w-full h-full object-cover hover:transition-opacity hover:opacity-55 duration-200" />
              </div>
              <div className="flex flex-col items-center">
                <strong>{item.nome} </strong>
                {item.descricao}
              </div>
              
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CardapioPage;
