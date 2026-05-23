import SignupForm from "./SignupForm";

type Props = {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
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
};

function SignupModal({ showForm, setShowForm, formData, setFormData }: Props) {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <SignupForm
        formData={formData}
        setFormData={setFormData}
        setShowForm={setShowForm}
      />
    </div>
  );
}

export default SignupModal;