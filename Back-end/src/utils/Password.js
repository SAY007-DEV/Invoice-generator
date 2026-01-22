import bcrypt from "bcrypt";


export const password =(password)=>{
    bcrypt.hash(password,10)
}

export const comparepassword =(password,hashedpassword)=>{
    bcrypt.compare(password,hashedpassword);
}