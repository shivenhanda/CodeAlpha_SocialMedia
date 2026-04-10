import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

export default function Login({ setUser, setForm }) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()
  const onSubmit = async (data) => {
    try {
      let res = await fetch("http://localhost:8000/api/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(data)
      })
      res = await res.json()
      if (res.success) {
        console.log(res.data)
        setUser(res.user);
        navigate("/")
      } else {
        setUser(null);
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
        <input id="user" {...register("user", { required: true })} className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 
focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" />
        {errors.user && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <label htmlFor="password" className='w-80 text-sm/6 font-medium text-gray-900 flex flex-start'>Enter Password</label>
        <input id="password" {...register("password", { required: true })} className="w-80 mt-1 rounded-lg border border-gray-300 px-3 py-2 
focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" />
        {errors.password && <span className="text-red-600 text-sm mt-1 block">This is required field</span>}
        <button className="w-80 bg-indigo-600 hover:bg-indigo-700 transition 
rounded-xl text-center p-2 text-white font-semibold">Login</button>
        <p onClick={() => setForm("signup")} className='text-sm text-center text-gray-600 cursor-pointer'>Don't have an Account? <span className='text-indigo-600 font-medium hover:underline'>Sign up</span></p>
      </form>
    </div>
  )
}
