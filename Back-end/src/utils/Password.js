import bcrypt from "bcrypt";


export const hashpassword =(password)=>{
    bcrypt.hash(password,10)
}

export const comparepassword =(password,hashedpassword)=>{
    bcrypt.compare(password,hashedpassword);
}