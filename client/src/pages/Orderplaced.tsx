import OrderPlacedContent from "../components/Orderplaced";
import Header from "../components/Header";
import Footer from "../components/Footer";


function OrderPlacedPage() {
  return (
    <div>
      <Header />
      <OrderPlacedContent orderId="1234567890" estimatedDelivery="2028-11-11" />
      <Footer />
    </div>
  );
}

export default OrderPlacedPage;