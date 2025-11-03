import React from "react";
import Hero from "../components/Hero";
import Header from "../components/layout/Header";

const CardapioPage = () => {
  return (
    <div>
      <Header />
      <Hero />
      <main className="flex flex-col items-center mt-8">
        <h2 className="text-2xl">Cardapio Completo</h2>
      </main>
    </div>
  );
};

export default CardapioPage;
