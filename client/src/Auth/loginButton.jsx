import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button className="nav-btn" onClick={() => loginWithRedirect()}>
      <span>Login&nbsp;</span><i className="fa-solid fa-right-to-bracket" />
    </button>
  );
};

export default LoginButton;
