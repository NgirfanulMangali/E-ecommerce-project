import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App'
import { CartProvider } from './contexts/CartContext'

createRoot(document.getElementById('root')!).render(
  
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  
)
