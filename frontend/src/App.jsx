import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Signup from './auth/Signup'
import Login from './auth/Login'

export default function App() {
  return (
    <>
      <Link to="/">Home</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/login">Login</Link>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </>
  )
}
