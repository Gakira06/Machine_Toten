import Header from "../components/layout/Header";
import { NavLink } from "react-router";

const LoginPage = () => {
  return (
    <div>
      <Header />
      <main className="flex justify-center items-center">
        <div className=" flex flex-col border border-s-black p-10">
          <h2 className="text-2xl">Gostaria de fazer Login?</h2>
          <div className="flex justify-center gap-30 mt-10">
            <NavLink to="/usuario">
              <button>Sim</button>
            </NavLink>
            <NavLink to="/cardapio">
              <button>Não</button>
            </NavLink>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
