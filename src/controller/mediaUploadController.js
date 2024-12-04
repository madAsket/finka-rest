const multer = require("multer");
const path =  require("path");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { User } = require("../db/models");

const upload = multer({
    limits:1000,
    storage: multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null, "upload/images")
        },
        filename:(req,file,cb)=>{
            let ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${Date.now()}${ext}`);
        }
    }),
    fileFilter:(req,file, cb)=>{
        const allowedFileType = ["jpg", "jpeg", "png"];
        if(allowedFileType.includes(file.mimetype.split("/")[1])){
            cb(null, true)
        }else{
            cb(null, false)
        }
    }
});

const uploadAvatar = catchAsync(async (req, res, next) => {
    if(!req.file){
        throw new AppError("Image not found", 400);
    }
    let filePath = `images/${req.file.filename}`;
    await User.update({
        avatar:filePath,
    },
    {
        where:{
            id:req.user.id
        }
    });
    return res.json({
        status:"success",
        data:{
            avatar:filePath
        }
    });
});


module.exports = {uploadAvatar, upload};