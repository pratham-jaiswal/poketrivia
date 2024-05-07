import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithPopup } = useAuth0();

  return (
    <button className="nav-btn" onClick={() => loginWithPopup()}>
      <span>Login&nbsp;</span><i className="fa-solid fa-right-to-bracket" />
    </button>
  );
};

export default LoginButton;
