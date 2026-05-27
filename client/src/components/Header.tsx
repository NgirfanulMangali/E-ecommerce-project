import hamburgerIcon from "../assets/resources/hamburgerIcon.svg";
import shopCo from "../assets/resources/shopCo.svg";
import searchIcon from "../assets/resources/searchIcon.svg";
import cart from "../assets/resources/cart.svg";
import login from "../assets/resources/login.png";

type Props = {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
};

function Header({ setShowForm }: Props) {
  return (
    <>
      <section className="h-[34px] bg-black flex items-center justify-center">
        <p className="text-white text-xs">
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
        <section className="flex">
          <img src={hamburgerIcon} alt="menu" className="mr-3" />
          <img src={shopCo} alt="logo" className="mr-15" />
        </section>

        <section className="flex">
          <img src={searchIcon} alt="search" className="mr-3" />
          <img src={cart} alt="cart" className="mr-3" />
          <img src={login} alt="login" />
        </section>
      </header>
    </>
  );
}

export default Header;