import React, { useState } from "react";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";

const CadastroRapidoPage = () => {
  const [nome, setNome] = useState(""); // Estado para guardar o NOME digitado
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Esta é a função da Etapa 2 (que você tinha colocado na página errada)

  const handleRegisterSubmit = async () => {
    // Pega o CPF que salvamos na tela anterior
    const cpf = localStorage.getItem("cpfParaCadastro");

    if (!cpf) {
      alert("Erro: CPF não encontrado. Volte para a tela inicial.");
      window.location.href = "/usuario"; // Manda de volta para a tela de CPF
      return;
    }

    if (!nome) {
      alert("Por favor, digite seu nome.");
      return;
    }

    if (!celular) {
      alert("Por favor, digite seu número.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/usuarios/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: cpf,
          nome: nome,
          celular: celular,
          email: email,
        }), // Envia CPF e nome
      });

      const data = await response.json();

      if (response.status === 201) {
        // CADASTROU COM SUCESSO!
        localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
        localStorage.removeItem("cpfParaCadastro");
        navigate("/cardapio");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Não foi possível realizar seu cadastro. Tente novamente.");
    }
  };

  return (
    <div>
      <Header />
      <main className="flex flex-col justify-center items-center">
        <div className="border border-black rounded-lg flex flex-col items-center p-20 shadow-2xl">
          <h2 className="text-xl">Cadastro Rápido</h2>
          <p className="text-sm text-gray-600 mb-4">
            Vimos que é seu primeiro acesso. Digite seu nome:
          </p>

          <label htmlFor="nome" className="text-lg">
            Nome:
          </label>

          <input
            id="nome"
            placeholder="Seu Nome"
            className="border rounded-2xl p-2 mt-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label htmlFor="celular" className="text-lg">
            Celular:
          </label>

          <input
            id="celular"
            placeholder="Seu celular"
            className="border rounded-2xl p-2 mt-2"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
          <label htmlFor="email" className="text-lg">
            Email(opicional):
          </label>

          <input
            id="email"
            placeholder="Seu email"
            className="border rounded-2xl p-2 mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleRegisterSubmit}>Finalizar Cadastro</button>
        </div>
      </main>
    </div>
  );
};

export default CadastroRapidoPage;
