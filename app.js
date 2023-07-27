const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const winston = require('winston');
//const morgan = require('morgan');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const db = require('./models');
var path = require('path');
const figlet = require('figlet');

db.Sequelize = Sequelize;
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logger.log' }) // Output logs to a file
    ]
});
//const logger = require('morgan');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());
const stream = fs.createWriteStream(path.join(__dirname, 'logger.log'), { flags: 'a' });
// app.use(logger('combined', { stream: process.env.NODE_ENV === 'production' ? stream : '' }));
app.use((req, res, next) => {
    const start = new Date();

    res.on('finish', () => {
        const end = new Date();
        const responseTime = end - start;
        console.log(res);
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.baseUrl + req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            error: res.error
        };

        logger.info(logEntry);
    });

    next();
});
//app.use(logger('combined'));

//middleware
app.use(express.json());
//app.use(morgan('tiny'));
// app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
// app.use(errorHandler);

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const customerssRoutes = require('./routes/customer');
const imagesRoutes = require('./routes/image');
const ordersRoutes = require('./routes/orders');

const api = process.env.API_URL;

app.use(`${api}/category`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/user`, usersRoutes);
app.use(`${api}/customer`, customerssRoutes);
app.use(`${api}/image`, imagesRoutes);
app.use(`${api}/orders`, ordersRoutes);

db.sequelize
    .sync({ alter: false, force: false })
    .then(() => {
        app.listen(3000, () => {
            console.log('server running in port 3000');

            figlet('H3B - ENGINE', function (err, data) {
                if (err) {
                    console.log('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data);
            });
        });
    })
    .catch((error) => {
        console.error('Unable to connect to the database: ', error.message);
    });
