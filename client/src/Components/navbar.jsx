import { Link } from "react-router-dom";
import LoginButton from "../Auth/loginButton";
import LogoutButton from "../Auth/logoutButton";

function Navbar({ isAuthenticated, userData }) {
  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-row">
          <Link className="logo-container" to="/">
            <img
              draggable="false"
              className="logo"
              src={`${import.meta.env.VITE_APP_CLOUDINARY_BASE}/poketrivia_cdgrdj.png`}
              alt="React Logo"
            />
          </Link>
          <div className="navbar-links">
            {!isAuthenticated && <LoginButton />}
            {(isAuthenticated && userData) && (
              <>
                <div className="nav-btn">
                  {userData.totalScore}pts
                </div>
                <div className="nav-btn">
                  {userData.pokecoins}₱
                </div>
                <Link className="nav-btn" to="/pokemon-nursery">
                  <span>Pokémon Nursery&nbsp;</span><i className="fa-solid fa-cart-shopping" />
                </Link>
                <LogoutButton />
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
