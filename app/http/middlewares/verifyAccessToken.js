const createError = require("http-errors");
const { UserModel } = require("../../models/user");
const JWT = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET_KEY } = require("../../utils/constants");

function getToken(headers){
    const [bearer,token] = headers?.["access-token"]?.split(" ") || [];
    if(token && ["Bearer" , "bearer"].includes(bearer)) return token;
    throw createError.Unauthorized("حساب کاربری شناسایی نشد وارد حساب کاربری خود شوید");
}
function veifyAccessToken(req,res,next){
    try {
        const token = getToken(req.headers);
        JWT.verify(token, ACCESS_TOKEN_SECRET_KEY , async (err , payload) => {
            if(err) throw createError.Unauthorized("وارد حساب کاربری خود شوید")
            const {mobile} = payload || {};
            const user =  await UserModel.findOne({mobile}, {password:0,otp:0})
            if(!user) throw createError.Unauthorized("حساب کاربری یافت نشد");
            req.user = user;
            return next();

        }) ;
    } catch (error) {
        next(error);
    }
}

function checkRole(role){
    return function (req,res,next){
        try {
            const user = req.user;
            if(user.roles.includes(role)) return next();
            throw createError.Forbidden("شما به این قسمت دسترسی ندارید");
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    veifyAccessToken,
    checkRole
}