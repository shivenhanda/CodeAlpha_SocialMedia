import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import connectDB from './model.js'

const app=express()
const port=8000
app.get("/",(req,res)=>{
    connectDB
    res.send("Welcome Social Media")
})

app.listen(port,()=>{
    console.log("Available to localhost",port)
})