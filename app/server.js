const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require ("path"); 
const createError = require ("http-errors");
const { AllRoutes } = require("./router/router");
module.exports = class Application{
    #app = express()
    #DB_URI;
    #PORT;
    constructor(PORT,DB_URI){
        this.#PORT = PORT;
        this.#DB_URI = DB_URI;
        this.configApplicatn();
        this.connectToMongoDB();
        this.createServer();
        this.createRoutes();
        this.errorHandling();
    }
    configApplicatn(){
        this.#app.use(morgan("dev"))
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({extended : true}));
        this.#app.use(express.static(path.join(__dirname,"..","public")));
    }
    createServer(){
        const http = require("http");
        http.createServer(this.#app).listen(this.#PORT,() =>{
            console.log("run > http://localhost:" + this.#PORT);
        })
    }
    connectToMongoDB(){
        mongoose.connect(this.#DB_URI,{
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            family: 4,
        },(error) => {
            if(!error) return console.log("Connected to MongoDB");
            return console.log("Failed to cennect to MongoDB");
        })
        mongoose.connection.on("connected" , () => {
            console.log("mongoose connected to DB")
        })
        mongoose.connection.on("disconnected", () => {
            console.log("mongoose connection is disconnected")
        })
        process.on("SIGINT", async() => {
            await mongoose.connection.close();
            process.exit(0)
        })

    }
    createRoutes(){
        this.#app.use(AllRoutes)
    }
    errorHandling(){
        this.#app.use((req,res,next) => {
           next(createError.NotFound("آدرس مورد نظر یافت نشد" ))
        })
        this.#app.use((error,req,res,next) => {
            const serverError = createError.InternalServerError();
            const statusCode = error.status || serverError.status;
            const message = error.message || serverError.message;
            return res.status(statusCode).json({
                errors : {
                    statusCode,
                    message
                }
            })
        })
    }

}