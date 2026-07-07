import hamburgerIcon from "../assets/resources/hamburgerIcon.svg";
import shopCo from "../assets/resources/shopCo.svg";
import searchIcon from "../assets/resources/searchIcon.svg";
import cart from "../assets/resources/cart.svg";
import login from "../assets/resources/login.png";
import { Link } from "react-router";


function Header() {
  return (
    <>
      <section className="h-8.5 bg-black flex items-center justify-center">
        <p className="text-white text-xs flex items-center gap-3">
          <span>Sign up and get 20% off to your first order. <Link to="/register" className="underline text-xs font-medium">Sign Up Now</Link></span>
        </p>
      </section>

      <header className="flex justify-around mt-5">
        <section className="flex">
          <img src={hamburgerIcon} alt="menu" className="mr-3" />
          <img src={shopCo} alt="logo" className="mr-15" />
        </section>

        <section className="flex">
          <img src={searchIcon} alt="search" className="mr-3" />
          <img src={cart} alt="cart" className="mr-3" />
          <img src={login} alt="login" className="mr-3" />
         
          
        </section>
      </header>
    </>
  );
}

export default Header;