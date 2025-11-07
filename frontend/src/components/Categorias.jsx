import IconCart from "../assets/icons/shopping-cart.svg"

const Categorias = ({ categorias, filtroItems }) => {
  return (
    <div className="flex flex-col items-center transition z-50  sticky top-0">
      <nav className="flex justify-center flex-wrap gap-4 mb-12 mt-8">
        {categorias.map((categoria, index) => (
          <button
            key={index}
            onClick={() => filtroItems(categoria)}
            className="bg-white text-orange-600 font-bold border-none rounded-lg px-5 py-3 text-base cursor-pointer transition-all duration-300 ease-in-out shadow-md hover:bg-red-700 hover:scale-105 hover:shadow-lg focus:outline-none  focus:ring-red-700 focus:ring-opacity-50"
          >
            {categoria}
          </button>
        ))}
        <img src={IconCart} />
      </nav>
    </div>
  );
};

export default Categorias;
