type Props = {
    formData: {
      name: string;
      email: string;
      password: string;
    };
    setFormData: React.Dispatch<
      React.SetStateAction<{
        name: string;
        email: string;
        password: string;
      }>
    >;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  };
  
  function SignupForm({ formData, setFormData, setShowForm }: Props) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      try {
        const response = await fetch("http://localhost:5000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
    
        const data = await response.json();
    
        console.log(data);
    
        if (response.ok) {
          alert("Register berhasil!");
          setShowForm(false); // tutup form setelah sukses
        } else {
          alert(data.message || "Register gagal");
        }
    
      } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan pada server. Silakan coba lagi nanti");
      }
    }
  
    return (
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-[300px]"
      >
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
  
        <input
          name="name"
          placeholder="Nama"
          value={formData.name}
          onChange={handleChange}
          className="border w-full p-2 mb-3"
        />
  
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border w-full p-2 mb-3"
        />
  
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border w-full p-2 mb-4"
        />
  
        <div className="flex gap-2">
          <button className="bg-black text-white px-4 py-2 rounded">
            Daftar
          </button>
  
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="border px-4 py-2 rounded"
          >
            Tutup
          </button>
        </div>
      </form>
    );
  }
  
  export default SignupForm;