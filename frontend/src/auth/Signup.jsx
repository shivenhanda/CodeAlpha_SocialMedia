import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup({ setForm }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          username: data.user, 
          email: data.email, 
          password: data.password 
        })
      });
      const result = await res.json();
      if (result.success) {
        const { user, token } = result;
        login(user, token);
        navigate("/");
      } else {
        alert(result.message || 'Signup failed');
      }
    } catch (error) {
      console.error("error", error);
      alert('Signup error');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100'>
      <form onSubmit={handleSubmit(onSubmit)} className="flex justify-center items-center flex-col gap-2 bg-white w-96 p-8 border border-gray-100 rounded-2xl shadow-xl">
        <h1 className='text-center text-2xl font-bold p-1 m-3'>Create An Account</h1>
        <label htmlFor="user" className='w-80 text-sm font-medium text-gray-900'>Username</label>
        <input 
          id="user" 
          {...register("user", { required: true })} 
          className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
          placeholder="Username"
        />
        {errors.user && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <label htmlFor="email" className='w-80 text-sm font-medium text-gray-900'>Email</label>
        <input 
          id="email" 
          {...register("email", { required: true })} 
          className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
          placeholder="email@example.com"
        />
        {errors.email && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <label htmlFor="password" className='w-80 text-sm font-medium text-gray-900'>Password</label>
        <input 
          id="password" 
          type="password"
          {...register("password", { required: true })} 
          className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" 
          placeholder="Password"
        />
        {errors.password && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <button className="w-80 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-center p-2 text-white font-semibold mt-2">
          Signup
        </button>
        <p className='text-sm text-center text-gray-600'>
          Already have an Account?{' '}
          <Link to="/login" className='text-indigo-600 font-medium hover:underline'>Login</Link>
        </p>
      </form>
    </div>
  );
}

