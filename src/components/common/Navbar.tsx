import React from 'react';
import { useAuthStore } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut } from 'lucide-react';


export const Navbar: React.FC = () => {

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (

    <nav
      className="
        w-full
        py-3
        px-6
        flex
        justify-between
        items-center
      "
    >


      {/* LOGO / TITRE */}

      <h1
        className="
          text-xl
          font-bold
          text-[#00BFFF]
        "
      >
        AquaSmart
      </h1>





      {/* PARTIE DROITE */}

      <div
        className="
          flex
          items-center
          gap-5
        "
      >


        {/* BARRE DE RECHERCHE */}

        <div
          className="
            hidden
            md:flex
            items-center
            gap-2
            border
            border-gray-300/30
            rounded-lg
            px-3
            py-2
          "
        >

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            placeholder="Rechercher..."
            className="
              bg-transparent
              outline-none
              text-sm
              text-white
              placeholder-gray-400
              w-40
            "
          />

        </div>





        {/* NOTIFICATION */}

        <button
          className="
            relative
            text-gray-400
            hover:text-[#00BFFF]
            transition
          "
        >

          <Bell size={22}/>


          {/* petit point notification */}

          <span
            className="
              absolute
              top-0
              right-0
              w-2
              h-2
              bg-[#00BFFF]
              rounded-full
            "
          />

        </button>





        {/* UTILISATEUR */}

        <span
          className="
            hidden
            lg:block
            text-gray-300
            text-sm
          "
        >
          {user?.email}
        </span>





        {/* DECONNEXION ICON */}

        <button
          onClick={handleLogout}
          className="
            text-gray-400
            hover:text-red-400
            transition
          "
          title="Déconnexion"
        >

          <LogOut size={22}/>

        </button>


      </div>


    </nav>

  );
};