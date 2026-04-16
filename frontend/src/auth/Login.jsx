import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext';

export default function Login({ setForm }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const onSubmit = async (data) => {
    try {
let res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...data, username: data.user }) // map user to username
      });
      res = await res.json();
      if (res.success) {
        const { user, token } = res;
        login(user, token);
        navigate("/");
      } else {
        alert(res.message || 'Login failed');
      }
    }
    catch (error) {
      console.log("error", error)
    }
  }
  return (
    <div className='flex justify-center items-center'>
      <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex justify-center items-center flex-col gap-2 bg-white w-100 p-8  border-gray-100 rounded-2xl shadow-xl">
        <h1 className='text-center text-2xl font-bold p-1 m-3'>Sign in to your Account</h1>
        <label htmlFor="user" className='w-80 text-sm/6 font-medium text-gray-900 flex flex-start'>Username</label>
<input id="username" {...register("user", { required: true })} className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" placeholder="Username" />
        {errors.user && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <label htmlFor="password" className='w-80 text-sm/6 font-medium text-gray-900 flex flex-start'>Enter Password</label>
        <input id="password" {...register("password", { required: true })} className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 
focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" />
        {errors.password && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <button className="w-80 bg-indigo-600 hover:bg-indigo-700 transition 
rounded-xl text-center p-2 text-white font-semibold">Login</button>
        <Link to="/signup" className='text-sm text-center text-gray-600 cursor-pointer'>Don't have an Account? <span className='text-indigo-600 font-medium hover:underline'>Sign up</span></Link>
      </form>
    </div>
  );
}
