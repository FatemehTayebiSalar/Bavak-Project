const { tryWithPath } = require("@hapi/joi/lib/common");
const createError = require("http-errors");
const { UserModel } = require("../../../../models/user");
const { ROLES } = require("../../../../utils/constants");
const { randomNumberGenerator, signAccessToken, veifyRefreshToken, signRefreshToken } = require("../../../../utils/functions");
const {getOtpSchema,checkOtpSchema} = require("../../../validators/user/auth.schema");
const {StatusCodes : HttpStatus} = require("http-status-codes");
const Controller = require("../../contoller");
class UserAuthContoller extends Controller{
    async getOtp(req,res,next){
        try {
            await getOtpSchema.validateAsync(req.body)
            const {mobile} = req.body;
            const code = randomNumberGenerator();
            const result = await this.saveUser(mobile,code);
            if(!result) throw createError.Unauthorized("ورود شما انجام نشد")
            return res.status(HttpStatus.OK).send({
                statusCode : HttpStatus.OK,
                data:{
                    message : "کد اعتبارسنجی با موفقیت برای شما ارسال شد",
                    code,
                    mobile
                }
            })
        } catch (error) {
            next(error);
        }
    }
    async checkOtp(req,res,next){
        try {
            await checkOtpSchema.validateAsync(req.body);
            const {mobile,code} = req.body;
            const user = await UserModel.findOne({mobile});
            if(!user) throw createError.NotFound("کاربر یافت نشد");
            if(user.otp.code != code) throw createError.Unauthorized("کد ارسال شده صحیح نمی باشد")
            const now = Date.now();
            if(+user.otp.expiresIn < now) throw createError.Unauthorized("کد شما منقضی شده است")
            const accessToken = await signAccessToken(user._id)
            const refreshToken = await signRefreshToken(user._id);
            return res.status(HttpStatus.OK).json({
                statusCode: HttpStatus.OK,
                data: {
                    accessToken,
                    refreshToken
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async refreshToken(req,res,next){
        try {
            const {refreshToken} = req.body;
            const mobile = await veifyRefreshToken(refreshToken);
            const user = await UserModel.findOne({mobile});
            const accessToken = await signAccessToken(user._id);
            const newRefreshToken = await signRefreshToken(user._id);
            return res.json({
                data:{
                    accessToken,
                    refreshToken : newRefreshToken
                }
            })
            
        } catch (error) {
            next(error)
        }
    }
    async saveUser(mobile,code){
        let otp = {
            code,
            expiresIn : (new Date().getTime() + 120000)
        }
        const result = await this.checkExistUser(mobile);
        if(result){
            return ( await this.updateUser(mobile,{otp }))
        }
        return !!(await UserModel.create({
            mobile,
            otp,
            role : ROLES.USER
        }))
        
    }
    async checkExistUser(mobile){
        const user = await UserModel.findOne({mobile});
        return !!user
    }
    async updateUser(mobile, objectData = {}){
        Object.keys(objectData).forEach(key =>{
            if([""," ",0,null,undefined,"0",NaN].includes(objectData[key])) delete objectData[key]
        })
        const updateResult = await UserModel.updateOne({mobile},{$set : objectData})
        return !!updateResult.modifiedCount
    }
}

module.exports ={
    UserAuthContoller : new UserAuthContoller()
}