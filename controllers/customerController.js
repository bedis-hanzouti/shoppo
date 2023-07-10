const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require("../config/sendMail");
const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function login(req, res) {
    const user = await db.User.findOne({ where: { email: req.body.email }, attributes: { include: ['password'] } });

    //console.log({user:user.name});
    const secret = process.env.secret || '123456azerty';
    if (!user) {
        return res.status(400).send({ err: 'The User not found' });
    }

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = jwt.sign(
            {
                userModelId: user.id,
                userModelN: user.name
                // isAdmin: userModel.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        );

        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send({ err: 'password is wrong!' });
    }
}

async function register(req, res) {
    const olduser = await db.Customer.findOne({ where: { email: req.body.email } });
    if (olduser) {
        return res.status(400).send({ err: 'Email Exist' });
    }
    // const {error}=validationSchema(req.body)
    // if(error){
    //   return res.status(404).send({error:error.details[0].message});
    // }
    await db.Customer.create({
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        status: req.body.status,
        activity: req.body.activity,
        login: req.body.login,
        password: bcrypt.hashSync(req.body.password, 10)
    })
        .then((obj) => {
            res.json({
                status: true,
                message: 'success.',
                date: obj
            });
        })
        .catch((err) => res.status(400).json('Error creating ' + err.message));
}

async function addUser(req, res) {
    // const {error}=validationSchema(req.body)
    // if(error){
    //   return res.status(404).send({error:error.details[0].message});
    // }

    Customer.sync({ force: false }).then(() => {
        Customer.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            age: req.body.age,
            phone: req.body.phone
        })
            .then((obj) => {
                res.status(200).send(obj);
            })
            .catch((e) => {
                res.status(400).json({ error: e.message });
            });
    });
}

async function deletUser(req, res) {
    await db.Customer.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'USER NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}

async function getOneUser(req, res) {
    await db.Customer.findOne({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'USER NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function RestoreOneUser(req, res) {
    await db.Customer.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'USER NOT FOUND' });
            }
            await obj.restore();
            res.status(200).json({
                status: 'restored success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));


}

async function getAllUser(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Customer.findAndCountAll({ limit, offset, order: [['createdAt', 'DESC']] })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status getted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}

async function getAllSoftUser(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Customer.findAll({

        where: { deletedAt: { [Op.not]: null } },
        paranoid: false,
        order: [['deletedAt', 'DESC']]
    })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status delated',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}



async function updateUser(req, res) {
    console.log(req.params.id);
    await db.Customer.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'USER NOT FOUND' });
            }
            obj.name = req.body.name || obj.name;
            obj.email = req.body.email || obj.email;
            obj.city = req.body.city || obj.city;

            obj.status = req.body.status || obj.status;
            obj.activity = req.body.activity || obj.activity;
            obj.login = req.body.login || obj.login;
            obj.password = req.body.password || obj.password;
            await obj.save();
            res.status(200).send(obj);
        })
        .catch((e) => {
            res.status(400).json({ error: e.message });
        });
}

const paginate = (query, schema) => {
    let page = query.page ? query.page - 1 : 0;
    page = page < 0 ? 0 : page;
    let limit = parseInt(query.limit || 10);
    limit = limit < 0 ? 10 : limit;
    const offset = page * limit;
    const where = {};
    delete query.page;
    delete query.limit;
    delete schema.limit;
    delete schema.page;

    Object.keys(schema).forEach((key) => {
        console.log(key)
        schema[key] && query[key] ? (where[key] = query[key]) : null;
    });
    return {
        where: where,
        offset,
        limit,
    };
};


async function getAllStudentPagination(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))

    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Customer.findAndCountAll({ attributes: { exclude: ['password'] } }, paginate(req.query, req.query))
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'status getted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}

async function RestoreOneCategory(req, res) {
    await db.Customer.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'USER NOT FOUND' });
            }
            await obj.restore();
            res.status(200).json({
                status: 'restored success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));


}

async function forgetPassword(req, res) {
    try {


        const user = await db.Customer.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        else {
            const token = jwt.sign(
                {
                    userModelId: user.id,
                    userModelN: user.name
                    // isAdmin: userModel.isAdmin
                },
                secret,
                { expiresIn: '1d' }
            );
            const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token}`;
            await sendEmail(user.email, "Password reset", link);


        }


        res.send("password reset link sent to your email account");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
}

async function resetPassword(req, res) {
    try {


        const user = await db.Customer.findById(req.params.userId);
        if (!user) return res.status(400).send("invalid link or expired");
        const token = req.params.token


        if (!token) return res.status(400).send("Invalid link or expired");

        user.password = req.body.password;
        await user.save();



        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
}
module.exports = {
    register,
    login,
    getAllUser,
    deletUser,
    updateUser,
    getOneUser,
    getAllSoftUser,
    RestoreOneUser,
    forgetPassword,
    resetPassword,
    getAllStudentPagination
};
