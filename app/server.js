const express = require("express");
const mongoose = require("mongoose");
const path = require ("path"); 
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

    }
    createRoutes(){
        this.#app.use(AllRoutes)
    }
    errorHandling(){
        this.#app.use((req,res,next) => {
            return res.status(404).json({
                statusCode : 404,
                message : "آدرس مورد نظر یافت نشد" 
            })
        })
        this.#app.use((error,req,res,next) => {
            const statusCode = error.status || 500;
            const message = error.message || "InternalServerError";
            return res.status(statusCode).json({
                statusCode,
                message
            })
        })
    }

}