import React, { useEffect, useState } from 'react'
import Signup from './Signup'
import Login from './Login'
import Dashboard from './Dashboard'

export default function AuthPage({ user, setUser }) {
  const [form, setForm] = useState("signup")
  return (
    <div>
      {
        user ? <Dashboard user={user} /> :
          <>
            {form === "signup" ? <Signup setUser={setUser} setForm={setForm} /> :
              <Login setUser={setUser} setForm={setForm} />}
          </>
      }
    </div>
  )
}
