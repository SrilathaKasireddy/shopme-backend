
import  {itemRouter} from "./routes/itemsRouter.js";
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import randomstring from 'randomstring';
import { createUser, 
  getUserByName, 
  getUserByEmail, getUserById } from
  "./routes/helper.js";

import { ObjectId } from "mongodb";
// import Auth from "./Middleware/auth.js";


dotenv.config();
const app = express()
app.use(cors());
const PORT = process.env.PORT;
app.use(express.json())
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("mongo is connected");
  return client;
}
export const client = await createConnection();

app.use("/latestcollection", itemRouter)





app.listen(PORT, () => console.log(`App started in ${PORT}`));






async function generateHashedPassword(password) {
  const NO_OF_ROUNDS = 10; //Number of rounds of salting
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

app.post('/signup', async function (request, response) {
  const { UserName, Email, Password } = request.body;
  const userFromDB = await getUserByName(UserName);

  if (userFromDB) {
    response.status(400).send({ message: "Username already exists" });
  }
  else {
    const hashedPassword = await generateHashedPassword(Password)
    //db.users.insertOne(data);
    const result = await createUser({
      UserName: UserName,
      Email: Email,
      Password: hashedPassword,
    });
    response.send({ message: "successful Signup" });
  }
})

app.post('/login', async function (request, response) {
  const { UserName, Password } = request.body;
  const userFromDB = await getUserByName(UserName);
  

  if (!userFromDB) {
    response.status(400).send({ message: "Invalid Credential" });
  }
  else {
    // check password
    const storedPassword = userFromDB.Password;
    const isPasswordMatch = await bcrypt.compare(Password, storedPassword);
    if (isPasswordMatch) {
      const token = jwt.sign({ id: userFromDB._id, UserName: UserName }, 
        process.env.SECRET_KEY);
      response.send({ message: "successful login", token: token });
      console.log(userFromDB)
      // localStorage.setItem("currentUser",UserName);
    }
    else {
      response.status(400).send({ message: "Invalid Credential" });
    }
  

  }
})




app.post('/forgetPassword', async function (request, response) {
  const { Email } = request.body;
  const userFromDB = await getUserByEmail(Email);

  if (!userFromDB) {
    response.status(400).send({ message: "This is not a registered E-mail" });
  }
  else {
    //generate random string
    let randomString = randomstring.generate();

    //send a mail using nodemailer

    //Create Transporter
    const linkForUser = `${process.env.FRONTEND_URL}/reset-password/${userFromDB._id}/${randomString}`
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {

        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,

      }
    });
    //Mail options
    let mailOptions = {
      from: 'kasireddysrilatha17@gmail.com',
      to: Email,
      subject: 'Reset Password',
      html: `<h4>Hello User,</h4><br><p> You can reset the password by clicking the link below.</p><br><u><a href=${linkForUser}>${linkForUser}</a></u>`
    }
    //Send mail
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log(err);
      }
      else {
        console.log('email sent successfully')
      }
    })
    //Expiring date
    const expiresin = new Date();
    expiresin.setHours(expiresin.getHours() + 1);
    //store random string
    await client.db("users").collection("users").findOneAndUpdate({ Email: Email }, { $set: { resetPasswordToken: randomString, resetPasswordExpires: expiresin } });
    //Close the connection
    response.send({
      message: "User exists and password reset mail is sent",
    })

  }
})

app.post('/verifyToken', async function (request, response) {
  const { id, token } = request.body;
  const userFromDB = await getUserById(id);
  const currTime = new Date();
  currTime.setHours(currTime.getHours());
  try {
    if (currTime <= userFromDB.resetPasswordExpires) {
      if (token === userFromDB.resetPasswordToken) {
        response.send({ message: "Changing Password Approved" });
      }
      else {

        response.status(400).send({ message: "Token not valid" });
      }
    }
    else {
      response.status(400).send({ message: "Time expired" });
    }
  }
  catch (error) {
    response.status(500).send({
      message: "Something went wrong!"
    })
  }
  
});

app.put('/changePassword', async function (request, response) {
  const { Password, id } = request.body;

  try {
    // check password
    const hashedPassword = await generateHashedPassword(Password);
    await client.db("users").collection("users").findOneAndUpdate({ _id: ObjectId(id) }, { $set: { Password: hashedPassword } });
    //db.users.insertOne(data);
    response.send({ message: "Password updated successfully" });
  }
  catch (error) {
    response.send({ message: "Unexpected error in password updation" });
  }
})

