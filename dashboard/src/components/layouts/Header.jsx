import Profile  from "../pages/ProfileModal";

const Header = ( { setAuth } ) => {
    return (
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Xpenzo</h1>
        <div className="flex items-center gap-4">
        <Profile setAuth={setAuth}/>
        </div>
      </header>
    );
  };
  
  export default Header;