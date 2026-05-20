import './index.css'
import hamburgerIcon from "../src/assets/resources/hamburgerIcon.svg";
import shopCo from "../src/assets/resources/shopCo.svg"
import searchIcon from "../src/assets/resources/searchIcon.svg"
import cart from "../src/assets/resources/cart.svg"
import login from "../src/assets/resources/login.png"

function App() {
  

  return (
    <div >
      <section className="h-[34px] bg-black flex items-center justify-center">
      <p className='text-white font-satoshi text-center text-xs'>Sign up and get 20% off to your first order.  <a href="/signup" className='underline'>Sign Up Now</a></p>
      </section>
      <header className='flex justify-around mt-5'>
        <section className='flex justify-end'>
          <img src={hamburgerIcon} alt="menu" className='mr-3 ml-4'/>
          <img src={shopCo} alt="icon title" />
        </section>
        <section className='flex'>
          <img src={searchIcon} alt="search" className='mr-3' />
          <img src={cart} alt="cart" className='mr-3' />
          <img src={login} alt="login" />
        </section>
      </header>

    </div>
    
  )
}

export default App
