import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { registerUser, checkEmailExists } from "../services/auth.service.js";

export const register = async (
 req: Request,
 res: Response
) => {

   const {name,email,password}=req.body;

   try{

      if (!name || !email || !password) {
         return res.status(400).json({
           message: "Name, email, and password are required",
           code: "MISSING_FIELDS",
         });
       }


      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         return res.status(400).json({
           message: "Invalid email format",
           code: "VALIDATION_ERROR",
         });
       }


       if(password.length < 10){
         return res.status(400).json({
           message:"Password must be at least 8 characters long",
           code:"PASSWORD_TOO_SHORT",
         });
       }

       if(password.length > 20){
         return res.status(400).json({
           message:"Password must be less than 20 characters long",
           code:"PASSWORD_TOO_LONG",
         });
       }  

       const emailExists = await checkEmailExists(email);
      if(emailExists){
        return res.status(409).json({
          message:"Email already registered. use a different email or login",
          code:"EMAIL_ALREADY_EXISTS",
        });
      }

      const user= await registerUser(name,email,password);

      const { password: _password, ...safeUser } = user;

      return res.status(201).json({
        message:"Registration successful",
        data:safeUser,
      });
   }catch{
      return res.status(500).json({
        message:"An error occurred on the server. Please try again later",
        code:"INTERNAL_SERVER_ERROR",
      });
    }

}



export const login = async (
 req: Request,
 res: Response
) => {

   const {email,password}=req.body;

   try{

      if(!email || !password){
          return res.status(400)
          .json({
            message:"Email dan password harus diisi"
          });
      }

      const user=
      await prisma.user.findUnique({
         where:{
             email
         }
      });

      if(!user){
          return res.status(401)
          .json({
            message:"Email atau password salah"
          });
      }

      const isPasswordValid=
      await bcrypt.compare(password,user.password);

      if(!isPasswordValid){
          return res.status(401)
          .json({
            message:"Email atau password salah"
          });
      }

      const token=jwt.sign(
         {id:user.id,email:user.email},
         process.env.JWT_SECRET || "your-secret-key",
         {expiresIn:"7d"}
      );

      return res.status(200)
      .json({
        message:"Login berhasil",
        token,
        data:{
          id:user.id,
          name:user.name,
          email:user.email
        }
      });

   }catch{

      return res.status(500)
      .json({
         message:"Terjadi kesalahan pada server. Silakan coba lagi nanti"
      });

   }

}