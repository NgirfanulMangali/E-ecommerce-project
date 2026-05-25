import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

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
         message:"Server error"
      });

   }

}