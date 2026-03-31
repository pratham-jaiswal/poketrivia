import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      className="nav-btn"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      <span>Logout&nbsp;</span><i className="fa-solid fa-right-from-bracket" />
    </button>
  );
};

export default LogoutButton;
