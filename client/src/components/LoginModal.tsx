import LoginForm from "./LoginForm";

type Props = {
  showLoginForm: boolean;
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  loginFormData: {
    email: string;
    password: string;
  };
  setLoginFormData: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
    }>
  >;
};

function LoginModal({
  showLoginForm,
  setShowLoginForm,
  loginFormData,
  setLoginFormData,
}: Props) {
  if (!showLoginForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <LoginForm
        formData={loginFormData}
        setFormData={setLoginFormData}
        setShowLoginForm={setShowLoginForm}
      />
    </div>
  );
}

export default LoginModal;
