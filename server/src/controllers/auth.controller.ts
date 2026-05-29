import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const register = async (
 req: Request,
 res: Response
) => {

   const {name,email,password}=req.body;

   try{

      const userExist=
      await prisma.user.findUnique({
         where:{
             email
         }
      });

      if(userExist){

          return res.status(400)
          .json({
            message:"Email sudah dipakai"
          });
      }

      const hashedPassword=
      await bcrypt.hash(password,10);

      const user=
      await prisma.user.create({

          data:{
              name,
              email,
              password:hashedPassword
          }

      });

      return res.status(201)
      .json({
        message:"Register berhasil",
        data:user
      });

   }catch(error){

      return res.status(500)
      .json({
         message:"Terjadi kesalahan pada server. Silakan coba lagi nanti"
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

   }catch(error){

      return res.status(500)
      .json({
         message:"Terjadi kesalahan pada server. Silakan coba lagi nanti"
      });

   }

}