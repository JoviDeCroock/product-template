import { useLocation } from "preact-iso";
import { AuthForm } from "../../components/AuthForm";

export function Auth() {
  const { route } = useLocation();

  function handleSuccess() {
    route("/dashboard");
  }

  return <AuthForm onSuccess={handleSuccess} />;
}
