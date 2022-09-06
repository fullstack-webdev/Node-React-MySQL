const {format,createLogger,transports} = require('winston');
const path=require('path');
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;


let s3_stream;


s3_stream = new S3StreamLogger({
    bucket:"log-fake-apis",
    access_key_id: process.env.BUCKET_ACCESS_KEY,
    secret_access_key: process.env.BUCKET_SECRET_KEY,
    upload_every: 360000,  // 360 s
    buffer_size: 500000,  // 500 k
    max_file_size: 1000000,
    name_format:"%Y-%m-%d-%H-%M-%S-hack-herokuhack.log",
})



const logFormat = format.printf(({ level,message,label,timestamp,stack})=>{
    return `${timestamp} [${label}] ${level}: ${stack || message}`;
    });


const logger=createLogger({
    format:format.combine(
        //format.colorize(),
        format.timestamp({format: "HH:mm:ss"}),
        // format.label({label: __filename}),
        format.errors({stack:true}),
        logFormat
        ),
    
    transports: [
        new transports.Console({
            level:'info'
        }),
        new transports.Stream({
            level:'debug',
            stream:s3_stream
        })
    ]
});
module.exports=logger;
