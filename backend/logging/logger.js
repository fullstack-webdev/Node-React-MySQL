const {format,createLogger,transports} = require('winston');
const path=require('path');
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;


let s3_stream;

if(process.env.NODE_ENV.trim() == 'production'){
    s3_stream = new S3StreamLogger({
        bucket:"ancient-logger-alpha",
        folder: "september",
        access_key_id: process.env.BUCKET_ACCESS_KEY,
        secret_access_key: process.env.BUCKET_SECRET_KEY,
        upload_every: 360000,  // 360 s
        buffer_size: 2000000,  // 500 k
        max_file_size: 100000000,
        name_format:"%Y-%m-%d-%H-%M-%S-dev-herokudev.log",
    })
}


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
    
    transports: process.env.NODE_ENV.trim() == 'production' ? [
        new transports.Console({
            level:'warn'
        }),
        new transports.Stream({
            level:'debug',
            stream:s3_stream
        })
    ] : [
        new transports.Console({
            level:'debug'
        })
    ]
});
module.exports=logger;
