const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const { UserModel } = require("../models/user");
const { PodcastModel } = require("../models/podcast");
const { VideoModel } = require("../models/video");
const { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } = require("./constants");
const fs = require("fs");
const path = require("path");

function randomNumberGenerator(){
    return Math.floor((Math.random()*90000)+10000)

}
function signAccessToken(userId){
    return new Promise(async (resolve,reject) => {
        const user = await UserModel.findById(userId)
        const payload = {
            mobile : user.mobile
        };
        const secret = "";
        const options = {
            expiresIn : "2h"
        };
        JWT.sign(payload,ACCESS_TOKEN_SECRET_KEY,options, (err, token) => {
            if(err) reject(createError.InternalServerError("خطای سروری"))
            resolve(token)
        })
    })
}
function signRefreshToken(userId){
    return new Promise(async (resolve,reject) => {
        const user = await UserModel.findById(userId)
        const payload = {
            mobile : user.mobile
        };
        const options = {
            expiresIn : "1y"
        };
        JWT.sign(payload,REFRESH_TOKEN_SECRET_KEY,options, (err, token) => {
            if(err) reject(createError.InternalServerError("خطای سروری"))
            resolve(token)
        })
    })
}

function veifyRefreshToken(token){
    return new Promise((resolve,reject) => {
        JWT.verify(token,REFRESH_TOKEN_SECRET_KEY , async (err , payload) => {
            if(err) reject(createError.Unauthorized("وارد حساب کاربری خود شوید"))
            const {mobile} = payload || {};
            const user =  await UserModel.findOne({mobile}, {password:0,otp:0})
            if(!user) reject(createError.Unauthorized("حساب کاربری یافت نشد"));
            resolve(mobile)
        }) 
    })
   
}
function deleteFileInPublic(fileAddress){
    if(fileAddress){
        const filePath = path.join(__dirname , ".." , ".." , "public" , fileAddress)
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}
function deleteInvalidData(data = {} , blackListFields = []){
    let nullishData = ["", " " , "0" , 0 , null , undefined];
    Object.keys(data).forEach(key => {
        if(blackListFields.includes(key)) delete data[key];
        if(typeof data[key] == "string") data[key] = data[key].trim();
        if(nullishData.includes(data[key])) delete data[key];
        
    })
}
function copyOfObject(object){
    return JSON.parse(JSON.stringify(object))
}
function getModelName(modelName){
    let model
    if(modelName == "podcast") model = PodcastModel;
    else if(modelName == "video") model = VideoModel;
    return model
}
function listOfImagesFromRequest(files,fileUploadPath){
    if (files?.length > 0) {
        return ((files.map(file => path.join(fileUploadPath, file.filename))).map(item => item.replace(/\\/g, "/")))
    } else {
        return []
    }
}
module.exports = {
    randomNumberGenerator,
    signAccessToken,
    signRefreshToken,
    veifyRefreshToken,
    deleteFileInPublic,
    copyOfObject,
    deleteInvalidData,
    getModelName,
    listOfImagesFromRequest
}