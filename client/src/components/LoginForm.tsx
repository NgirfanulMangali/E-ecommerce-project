type Props = {
  formData: {
    email: string;
    password: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
    }>
  >;
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
};

function LoginForm({ formData, setFormData, setShowLoginForm }: Props) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login berhasil!");

      // Simpan token dan data user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.data));

      setShowLoginForm(false);
    } else {
      alert(data.message ?? "Login gagal");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
  }
}

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg w-75"
    >
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input
        name="email"
        placeholder="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        className="border w-full p-2 mb-3"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="border w-full p-2 mb-4"
        required
      />

      <div className="flex gap-2">
        <button className="bg-black text-white px-4 py-2 rounded">
          Login
        </button>

        <button
          type="button"
          onClick={() => setShowLoginForm(false)}
          className="border px-4 py-2 rounded"
        >
          Tutup
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
