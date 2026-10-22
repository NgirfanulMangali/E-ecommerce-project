import hamburgerIcon from "../assets/resources/hamburgerIcon.svg";
import shopCo from "../assets/resources/shopCo.svg";
import searchIcon from "../assets/resources/searchIcon.svg";
import Carticon from "../assets/resources/cart.svg";
import login from "../assets/resources/login.png";
import { Link } from "react-router";
import { useCart } from "../contexts/CartContext";


function Header() {
  const { cart } = useCart();
  const totalItems = cart?.totalItems ?? 0;
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

        <section className="flex items-center">
          <img src={searchIcon} alt="search" className="mr-3" />
          
          <Link to="/cart"
          aria-label={`Cart, ${totalItems} items`}
          className="relative mr-3 inline-flex items-center"
          > 

          <img src={Carticon} alt="cart" /> 

          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
         )}</Link>
          
          <Link to="/login">
            <img src={login} alt="login" />
          </Link>
         
          
        </section>
      </header>
    </>
  );
}

export default Header;