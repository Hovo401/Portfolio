import { Link, useLocation } from "react-router-dom";
import s from "./Header.module.css";

function Header() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4 text-white">
        <li className={`${location.pathname == "/" ? s.container : ""}`}>
          <Link to="/" className="hover:text-blue-300">
            Home
          </Link>
        </li>
        <li className={`${location.pathname == "/about" ? s.container : ""}`}>
          <Link to="/about" className="hover:text-blue-300">
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
