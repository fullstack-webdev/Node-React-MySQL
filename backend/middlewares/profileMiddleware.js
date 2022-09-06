const logger = require('../logging/logger');
const { multerS3Config } = require('../config/s3Config');
const multer = require('multer');
const { json } = require('express');


const fileFilter = (req, img, cb) => {
    if (img.mimetype === 'image/jpeg' || img.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
        req.locals.mimetypeError = img.mimetype;
    }
}

const upload = multer({
    storage: multerS3Config,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 2 // we are allowing only 5 MB files
    }
}).single(`avatarFile`);

const uploadImageMiddleware = (req, res, next) => {
    
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            logger.error(`Error in UploadImageMiddleware: ${Utils.printErrorLog(err)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Uploading file error occured",
                    errorInfo: err
                }
            })
        } else if (err) {
            logger.error(`Error in UploadImageMiddleware: ${Utils.printErrorLog(err)}`)
            return res
            .status(401)
            .json({
                success: false,
                error: {
                    errorMessage: "Uploading file error occured",
                    errorInfo: err
                }
            })
        }

        next();
    });
}



module.exports = {
    uploadImageMiddleware
}