const multer = require("multer");
const path = require("path")
const fs = require("fs");
const createError = require("http-errors");
function createRoute (req){
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.getMonth().toString();
    const day = date.getDate().toString();
    const directory = path.join(__dirname , "..","..","public", "uploads" , "podcast", year,month,day)
    req.body.fileUploadPath = path.join( "uploads" , "podcast", year,month,day);
    fs.mkdirSync(directory, {recursive : true})
    return directory
}
const storage = multer.diskStorage({
    destination : (req , file , cb) => {
        if(file?.originalname){
            const filePath = createRoute(req);
            return cb(null , filePath)
        }
        cb(null, null)
    },
    filename : (req,file,cb) => {
        if(file.originalname){
            const ext = path.extname(file.originalname);
            const fileName = String(new Date().getTime() + ext)
            req.body.filename = fileName
            return cb(null , fileName)
        }
        cb(null, null)
    }
});
function fileFilter(req,file,cb){
    const ext = path.extname(file.originalname);
    const mimtypes = [".jpg",".jpeg",".png","webp",".gif"];
    if(mimtypes.includes(ext)){
        return cb(null, true)
    }
    return cb(createError.BadRequest("فرمت ارسال شده ی تصویر صحیح نمی باشد"))
}
const maxSize = 4 * 1000 * 1000 ;
const uploadFile = multer({storage , fileFilter , limits : {fileSize : maxSize}});
module.exports = {
    uploadFile
}