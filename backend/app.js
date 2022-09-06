//ENV
const dotenv = require('dotenv');
if (process.env.NODE_LOCAL) {
    dotenv.config({ path: `.env.local` }); //Just to remember, fixed removing spaces in package.json
} else {
    dotenv.config({ path: `.env.${process.env.NODE_ENV.trim()}` }); //Just to remember, fixed removing spaces in package.json
}

console.log("ENV-FILE: ", process.env.ENV_FILE)


//REQUIRES
const express = require('express');
const enforce = require('express-sslify');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const random = require('random');
const logger = require('./logging/logger');
let { encrypt, decrypt } = require('./utils/encription')
const compression = require('compression')


//REQUIRE ROUTERS
const authRouter = require('./routes/authRouter');
logger.info("authRouter ON")

const buildingsRouter = require('./routes/buildingsRouter');
logger.info("buildingsRouter ON")

const userRouter = require('./routes/userRouter');
logger.info("userRouter ON")

const marketRouter = require('./routes/marketRouter');
logger.info("marketRouter ON")

const shopRouter = require('./routes/shopRouter');
logger.info("shopRouter ON")

const ticketRouter = require('./routes/ticketRouter');
logger.info("ticketRouter ON")

const profileRouter = require('./routes/profileRouter');
logger.info("profileRouter ON")

const serverRouter = require('./routes/serverRouter');
logger.info("serverRouter ON")

const inventoryRouter = require('./routes/inventoryRouter');
logger.info("inventoryRouter ON")

const contractRouter = require('./routes/contractRouter');
logger.info("contractRouter ON")

const leaderboardRouter = require(`./routes/leaderboardRouter`);
logger.info("leaderboardRouter ON")

const fishermanRouter = require(`./routes/fishermanRouter`);
logger.info("fishermanRouter ON")

const delegateRouter = require(`./routes/delegateRouter`);
logger.info("delegateRouter ON")

const marketInventoryRouter = require(`./routes/marketInventoryRouter`);
logger.info("marketInventoryRouter ON")

const landRouter = require(`./routes/landRouter`);
logger.info("landRouter ON")

const bonusRouter = require(`./routes/bonusRouter`);
logger.info("bonusRouter ON")




//EXPRESS
const app = express();
if (process.env.NODE_ENV == "production") app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './FE/build')));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, './FE/build', 'index.html'));
});



//API OBSFUSCATOR
const encodeInterceptor = (req, res, next) => {
    try {
        //Vars
        let oldJson = res.json;
        let regexAddress;

        //Disabled for setProfile
        regexAddress = /setProfile[?]+/
        if (regexAddress.test(req.url)) {
            next();
            return
        }

        //Disabled for Leaderboards
        regexAddress = /getLeaderboard/
        if (regexAddress.test(req.url)) {
            next();
            return
        }

        //Disabled for getCheapestInventories
        regexAddress = /getCheapestInventories/
        if (regexAddress.test(req.url)) {
            next();
            return
        }

        //Decrypt REQ
        let decryptDone;
        try {
            decryptDone = decrypt(req.body.fdbiuhshn87123hbjds);
        } catch (err) {
            return res
                .status(401)
                .json({
                    success: false,
                    error: 'Error 0x50458991'
                })
        }

        req.body = decryptDone;

        //Encrypt RES
        res.json = function (data) {
            arguments[0] = { fdbiuhgdfs23hbjds: encrypt(arguments[0]) };
            oldJson.apply(res, arguments);
        }

        next();
        return

    } catch (error) {
        return res
            .status(404)
            .json({
                success: false,
                error: 'Error 0x342678991'
            })
    }
}
if (process.env.OBFUSCATE === 'true') app.use(encodeInterceptor)

//ROUTERS
app.use("/api/m1/auth", authRouter);
app.use("/api/m1/buildings", buildingsRouter);
app.use("/api/m1/user", userRouter);
app.use("/api/m1/marketplace", marketRouter);
app.use("/api/m1/shop", shopRouter);
app.use("/api/m1/ticket", ticketRouter);
app.use("/api/c1/contract", contractRouter);
app.use("/api/m1/profile", profileRouter);
app.use("/api/m1/leaderboard", leaderboardRouter);
app.use("/api/m1/server", serverRouter);
app.use("/api/m1/inventory", inventoryRouter);
app.use("/api/m1/fisherman", fishermanRouter);
app.use("/api/m1/delegation", delegateRouter);
app.use("/api/m1/marketplaceInventory", marketInventoryRouter);
app.use("/api/m1/land", landRouter);
app.use("/api/m1/bonus", bonusRouter);


//KEY TO SIGN
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
process.env['SECRET_KEY_OLD_JWT'] = crypto.randomBytes(64).toString('hex');
process.env['SECRET_KEY_NEW_JWT'] = crypto.randomBytes(64).toString('hex');
process.env['SECRET_KEY_TO_SIGN'] = process.env.WELCOME_MESSAGE + " " + getRandomInt(1000000, 1000000000);



//SERVER LISTEN
app.listen(process.env.PORT || 5000, () => {
    console.log("Server started on port: ", process.env.PORT || 5000);
});