import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isLoginPage = currentPath === "/login";
  const isRegisterPage = currentPath === "/register";
  const isForgotPasswordPage = currentPath === "/forgot-password";
  const isResetPasswordPage = currentPath ==="/reset-password";

  return (
    <header className="bg-white shadow-sm p-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">
          Xpenzo
        </h1>

        {/* Conditionally render button */}
        <div>
          {isLoginPage ? (
            <Link
              to="/register"
              className="inline-block px-6 py-2 bg-blue-500 text-white font-medium text-sm rounded-full shadow hover:bg-blue-600 transition duration-200"
            >
              Register
            </Link>
          ) : (isRegisterPage || isForgotPasswordPage || isResetPasswordPage) ? (
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-blue-500 text-white font-medium text-sm rounded-full shadow hover:bg-blue-600 transition duration-200"
            >
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
