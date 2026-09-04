import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export async function registerUser(name: string, email: string, password: string) {

    const hashedPassword= await bcrypt.hash(password,10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password:hashedPassword,
        },
    });
    return user;
} 

export async function checkEmailExists(email: string) {
    const userExist = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    return userExist ? true : false;
}   

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  
    if (!user) {
      return null;
    }
  
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
  
    if (!isPasswordValid) {
      return null;
    }
  
    return user;
  }