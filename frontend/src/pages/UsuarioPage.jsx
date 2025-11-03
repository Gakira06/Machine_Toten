import React from "react";
import Header from "../components/layout/Header";

const UsuarioPage = () => {
  return (
    <div>
      <Header />
      <main className="flex flex-col justify-center items-center">
        <div className="border border-black rounded-lg flex flex-col items-center p-20 shadow-2xl">
          <label htmlFor="cpf" className="text-xl">Digite seu CPF:</label>
          <input id="cpf" placeholder="CPF" className="border rounded-2xl p-2 mt-6" />
        </div>
      </main>
    </div>
  );
};

export default UsuarioPage;
