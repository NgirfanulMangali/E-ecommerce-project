import './index.css'
import hamburgerIcon from "../src/assets/resources/hamburgerIcon.svg";
import shopCo from "../src/assets/resources/shopCo.svg"
import searchIcon from "../src/assets/resources/searchIcon.svg"
import cart from "../src/assets/resources/cart.svg"
import login from "../src/assets/resources/login.png"
import { useState } from "react";



function App() {
  
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log(formData);
  }

  return (
    <div>
      <section className="h-[34px] bg-black flex items-center justify-center">
        <p className="text-white font-satoshi text-center text-xs">
          Sign up and get 20% off to your first order.

          <button
            onClick={() => setShowForm(true)}
            className="underline ml-1"
          >
            Sign Up Now
          </button>
        </p>
      </section>

      <header className="flex justify-around mt-5">
        <section className="flex justify-end">
          <img src={hamburgerIcon} alt="menu" className="mr-3 ml-4" />
          <img src={shopCo} alt="icon title" />
        </section>

        <section className="flex">
          <img src={searchIcon} alt="search" className="mr-3" />
          <img src={cart} alt="cart" className="mr-3" />
          <img src={login} alt="login" />
        </section>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg w-[300px]"
          >
            <h2 className="text-xl font-bold mb-4">
              Sign Up
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Nama"
              value={formData.name}
              onChange={handleChange}
              className="border w-full p-2 mb-3"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border w-full p-2 mb-3"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="border w-full p-2 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Daftar
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </form>

        </div>
      )}
    </div>
  );
}

export default App;