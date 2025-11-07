import LoginPage from "./pages/LoginPage";
import UsuarioPage from "./pages/UsuarioPage";
import CadastroRapidoPage from "./pages/CadastroPage";
import CardapioPage from "./pages/CardapioPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/usuario" element={<UsuarioPage />} />
        <Route path="/cadastro-rapido" element={<CadastroRapidoPage />} />
        <Route
          path="/cardapio"
          element={
            <CartProvider>
              <CardapioPage />
            </CartProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
