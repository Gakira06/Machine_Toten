import LoginPage from "./pages/LoginPage";
import UsuarioPage from "./pages/UsuarioPage";
import CardapioPage from "./pages/CardapioPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/usuario" element={<UsuarioPage />} />
        <Route path="/cardapio" element = {<CardapioPage />} />
      </Routes>
    </Router>
  );
}

export default App;
