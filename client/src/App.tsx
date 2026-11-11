import { Routes, Route } from "react-router";
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Productdetail from './pages/Productdetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderPlaced from './pages/Orderplaced'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Productdetail/:id" element={<Productdetail />} />
      <Route path="/Productdetail" element={<Productdetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orderplaced" element={<OrderPlaced />} />
    </Routes>
  );
}

export default App;