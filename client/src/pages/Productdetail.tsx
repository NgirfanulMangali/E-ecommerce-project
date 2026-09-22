import { useParams } from "react-router";
import { ProductDetail} from "../components/Productdetail";
import Header from "../components/Header";
import Footer from "../components/Footer";


function Productdetail() {
    const { id } = useParams<{ id: string }>();
 
    if (!id) {
      return (
        <div>
          <Header />
          <div className="max-w-sm mx-auto px-5 py-10 text-center text-sm text-neutral-500">
            Product ID is missing from the URL.
          </div>
          <Footer />
        </div>
      );
    }
   
    return (
      <div>
        <Header />
        <ProductDetail productId={id} />
        <Footer />
      </div>
    );
}

export default Productdetail;