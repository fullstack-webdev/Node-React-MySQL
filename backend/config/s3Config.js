const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3Config = new AWS.S3({
    accessKeyId: process.env.AWS_IAM_USER_KEY,
    secretAccessKey: process.env.AWS_IAM_USER_SECRET,
    Bucket: process.env.AWS_BUCKET_NAME
  });

const multerS3Config = multerS3({
    s3: s3Config,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        console.log(file);

        let imageNameSplitted = file.originalname != undefined && file.originalname != null ? file.originalname.split('.') : [];
        let extension = imageNameSplitted.length > 0 ? imageNameSplitted[imageNameSplitted.length - 1] : 'null';
        
        cb(null, req.locals.address + '.' + extension);

        req.locals.imageName = file.originalname;
        req.locals.imageExtension = extension;
    }
});




module.exports={s3Config, multerS3Config}
