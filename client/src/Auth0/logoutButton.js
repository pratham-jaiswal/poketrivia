import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      className="auth-btn"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      <span>Log Out</span> <i className="fa-solid fa-right-from-bracket" />
    </button>
  );
};

export default LogoutButton;
