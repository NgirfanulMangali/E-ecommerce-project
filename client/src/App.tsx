import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import NewArrivals from "./components/ NewArrivals";
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