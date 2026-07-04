import Header from "../components/Header";
import Hero from "../components/Hero";
import NewArrivals from "../components/ NewArrivals";
import TopSelling from "../components/TopSelling";
import Testimonials from "../components/Testimonials";
import CategorySection from "../components/CategorySection";
import Footer from "../components/Footer";
import Newsletter from "../components/Newsletter";

function Home() {
 
  return (
    <div>
      <Header />
      <Hero />
      <NewArrivals />
      <TopSelling />
      <CategorySection />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}

export default Home;