import OrderPlacedContent from "../components/Orderplaced";
import Header from "../components/Header";
import Footer from "../components/Footer";


function OrderPlacedPage() {
  return (
    <div>
      <Header />
      <OrderPlacedContent order={{ id: "1234567890", status: "PENDING" }} />
      <Footer />
    </div>
  );
}

export default OrderPlacedPage;