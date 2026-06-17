import { useState } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authSlice';
import { login } from '../services/authService';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { bg } from '../utils/constants';
import logoAqua from '../assets/logoAqua.png'
import vagueAqua  from '../assets/vagueAqua.png'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        
      const { access_token, user } = await login(email, password);
  
      setAuth(access_token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className={`
    h-full
    overflow-hidden
    ${bg}
    flex
    items-center
    justify-center
    px-4
 `}>


    {/* CARTE LOGIN */}
    <div className={`
      w-full
      max-w-[900px]
      h-[520px]
      ${bg}
      border
      border-[#12304a]
      rounded-xl
      overflow-hidden
      flex
       `}>



      {/* PARTIE GAUCHE LOGO */}
      <div className="
        w-1/2
        
        relative
        flex
        flex-col
        items-center
        justify-center
        border-r
        border-[#12304a]
        overflow-hidden
      ">

<div className='mb-16'>

<img
  src={logoAqua}
  alt="AquaSmart"
  className="
    relative
    z-10
    w-32
    md:w-44
    mb-4
  "
/>

{/* Nom */}
        <motion.h1
  className="
    relative
    z-10
    text-3xl
    md:text-4xl
    font-bold
    tracking-wide
    flex
  "
>


  {"AquaSmart".split("").map((letter, index) => (

    <motion.span
      key={index}
      className={
        index < 4
        ? "text-white"
        : "text-[#00BFFF]"
      }

      animate={{
        y: [0, -8, 0],
      }}

      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.12,
      }}
    >

      {letter}

    </motion.span>

  ))}


</motion.h1>



        <p className="
          text-gray-300
          text-sm
          mt-3
          relative
          z-10
        ">
          Smart Water Management System
        </p>
        </div>

        <img
  src={vagueAqua}
  alt=""
  className="
    absolute
    top-64
    left-0
    w-full
    opacity-40

   
  "
/>

 </div>







      {/* FORMULAIRE DROIT */}
      <div className="
        w-1/2
        px-12
        flex
        flex-col
        justify-center
      ">


        <h2 className="
          text-white
          text-2xl
          font-semibold
          mb-2
        ">
          Bienvenue !
        </h2>



        <p className="
          text-gray-400
          text-sm
          mb-8
        ">
          Connectez-vous à votre compte
        </p>




        <form onSubmit={handleSubmit}>


          {/* EMAIL */}
          <div className="mb-5">

            <label className="
              text-gray-300
              text-xs
              block
              mb-2
            ">
              Email
            </label>


            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="
                w-full
                h-10
                rounded
                bg-[#081c2c]
                border
                border-[#17415f]
                px-3
                text-white
                text-sm
                outline-none
                focus:border-[#00BFFF]
              "
              required
            />


          </div>





          {/* PASSWORD */}
          <div className="mb-4">

            <label className="
              text-gray-300
              text-xs
              block
              mb-2
            ">
              Mot de passe
            </label>



            <input
              type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="
                w-full
                h-10
                rounded
                bg-[#081c2c]
                border
                border-[#17415f]
                px-3
                text-white
                text-sm
                outline-none
                focus:border-[#00BFFF]
              "
              required
            />

          </div>






          {/* OPTIONS */}

          <div className="
            flex
            justify-between
            items-center
            text-xs
            mb-6
          ">


            <label className="
              text-gray-400
              flex
              gap-2
              items-center
            ">

              <input type="checkbox"/>

              Se souvenir de moi

            </label>



            <span className="
              text-[#00BFFF]
            ">
              Mot de passe oublié ?
            </span>


          </div>






          {
            error &&
            <Alert
              type="error"
              message={error}
            />
          }






        <Button
  type="submit"
  isLoading={loading}
  className="
    w-full
    h-10
    mt-2
    rounded-md
    bg-[#007BFF]
    hover:bg-[#00BFFF]
    text-white
    transition
  "
>
  Se connecter
</Button>



        </form>


      </div>


    </div>


  </div>
)
}