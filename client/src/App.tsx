import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NewArrivals from "./components/ NewArrivals";
import TopSelling from "./components/TopSelling";
import Testimonials from "./components/Testimonials";
import CategorySection from "./components/CategorySection";
import Footer from "./components/Footer";
import SignupModal from "./components/SignupModal";

function App() {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  return (
    <div>
      <Header setShowForm={setShowForm} />
      <Hero />
      <NewArrivals />
      <TopSelling />
      <CategorySection />
      <Testimonials />
      <Footer />

      <SignupModal
        showForm={showForm}
        setShowForm={setShowForm}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
}

export default App;