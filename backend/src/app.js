 import express, { urlencoded } from "express"
 import mongoose from "mongoose"
import {Server} from "socket.io"
import {createServer} from "node:http"
import cors from "cors"
import { connect } from "node:http2"
import { connectToSocket } from "./controllers/socketManager.js"
import { json } from "node:stream/consumers"


const app= express();

const port =8080;

const server = createServer(app);
const io= connectToSocket(server);

app.set("port",(process.env.PORT || 8080));


app.use(cors());
import userRoutes from "./routes/user.routes.js"
app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({ limit:"40kb", extended:true}))
app.use("/api/v1/users",userRoutes);
// app.use("/api/v2/users",newUserRoutes)

app.get("/home",(req,res)=>{
  return res.json({"hello":"worlds"});
});

const start = async()=>{
    const connectionDB= await mongoose.connect("mongodb+srv://zaidazmi7773_db_user:oBxU6zOGINX3fi3a@cluster0.jhowiyl.mongodb.net")
    console.log(`mongo connection db host ${connectionDB.connection.host}`)
    server.listen(app.get("port"),()=>{
    console.log("server starterd")
})

}

start();