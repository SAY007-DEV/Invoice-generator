import User from "../models/User.model";
import { hashpassword } from "../utils/Password";



export const register = async (req,res)=>{
    const { password, email}= req.body;
try {

    const exist = await User.findOne({email});
    if (exist) {
        res.status(400).json({message:"User already exist"})
    }
       const  user = await User.create({
        email,
        password : await hashpassword(password)
       })
       res.status(201).json({
        message:"User created successfully",
        user})
       
    }
    
 catch (error) {

    console.log(error);
    res.status(500).json({message:"Internal server error"})
    

    
}
}