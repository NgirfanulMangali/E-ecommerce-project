import { Routes, Route } from "react-router";
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Productdetail from './pages/Productdetail'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/Productdetail/:id" element={<Productdetail />} />
      <Route path="/Productdetail" element={<Productdetail />} />
    </Routes>
  );
}

export default App;