import React from "react";
import { Link } from "react-router-dom";
import LoginButton from "../Auth0/loginButton";
import poketrivia from "../Images/poketrivia.png";
import LogoutButton from "../Auth0/logoutButton";

function Navbar({ isAuthenticated, userData }) {
  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-row">
          <Link className="logo-container" to="/">
            <img
              draggable="false"
              className="logo"
              src={poketrivia}
              alt="React Logo"
            />
          </Link>
          <div className="navbar-links">
            {!isAuthenticated && <LoginButton />}
            {(isAuthenticated && userData) && (
              <>
                {/* <Link className="nav-btn" to="/profile">
                  <span>Profile</span> <i className="fa-solid fa-user" />
                </Link> */}
                <div className="nav-btn">
                  {userData.totalScore}pts
                </div>
                <div className="nav-btn">
                  {userData.pokecoins}₱
                </div>
                <Link className="nav-btn" to="/pokemart">
                  <span>PokéMart</span> <i className="fa-solid fa-cart-shopping" />
                </Link>
                <div title="Coming Soon" className="nav-btn">
                  <span>Leaderboards*</span> <i className="fa-solid fa-ranking-star" />
                </div>
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
