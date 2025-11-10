import React, { useState } from "react";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom"; // Importe o useNavigate

const UsuarioPage = () => {
  const [cpf, setCpf] = useState(""); // Estado para guardar o CPF digitado
  const navigate = useNavigate(); // Hook para navegar entre páginas // Esta é a função correta para esta página (Etapa 1)

  const handleCpfCheck = async () => {
    // Limpa o CPF de pontos e traços
    const cpfLimpo = cpf.replace(/[.-]/g, "");

    if (!cpfLimpo) {
      alert("Por favor, digite um CPF.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/usuarios/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf: cpfLimpo }),
      });

      const data = await response.json();

      if (data.exists) {
        // === USUÁRIO EXISTE ===
        // Salva os dados do usuário
        localStorage.setItem("usuario", JSON.stringify(data.usuario)); // <-- CORREÇÃO AQUI
        navigate("/cardapio");
      } else {
        // === USUÁRIO NÃO EXISTE ===
        // Guarda o CPF para usar na próxima tela
        localStorage.setItem("cpfParaCadastro", cpfLimpo); // Redireciona para a tela de cadastro rápido
        navigate("/cadastro-rapido"); // <-- Vamos criar esta página
      }
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
      alert("Não foi possível verificar seu CPF. Tente novamente.");
    }
  };

  return (
    <div>
      <Header />
      <main className="flex flex-col justify-center items-center">
        <div className="border border-black rounded-lg flex flex-col items-center p-20 shadow-2xl">
          <label htmlFor="cpf" className="text-xl">
            Digite seu CPF:
          </label>
          <input
            id="cpf"
            placeholder="CPF"
            className="border rounded-2xl p-2 mt-6"
            value={cpf} // Controla o valor do input
            onChange={(e) => setCpf(e.target.value)} // Atualiza o estado
          />
          <button onClick={handleCpfCheck}>Continuar</button>
        </div>
      </main>
    </div>
  );
};

export default UsuarioPage;
