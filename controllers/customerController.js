const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require("../config/sendMail");
const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const customerSchema = require('../config/joi_validation/customerSchema')


async function login(req, res) {
    if (!req.body.email) return res.status(400).send({ err: 'email is empty' });
    const user = await db.Customer.findOne({ where: { email: req.body.email }, attributes: { include: ['password'] } });
    // console.log({ body: user.password });
    const secret = process.env.secret || '123456azerty';
    if (!user) {
        return res.status(400).send({ err: 'The userModel not found' });
    }
    const match = await bcrypt.compareSync(req.body.password, user.password)
    // console.log({ match: match });
    if (user && match) {
        const tokenData = {
            id: user.id,

            city: user.city,
            status: user.status,
            activity: user.activity,

            login: user.login,
        }
        const token = jwt.sign(
            {
                user: tokenData,

                // isAdmin: userModel.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        );
        const clearUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            city: user.city,
            status: user.status,
            activity: user.activity,
            phonenumber: user.phonenumber
        }


        res.status(200).send({ user: clearUser, token: token });
    } else {
        res.status(400).send({ err: 'password is wrong!' });
    }
}

async function register0(req, res) {

    const olduser = await db.Customer.findOne({ where: { email: req.body.email } });
    if (olduser) {
        return res.status(400).send({ msg: 'Email Exist' });
    }

    await db.Customer.create({
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        status: req.body.status,
        activity: req.body.activity,
        login: req.body.login,
        password: bcrypt.hashSync(req.body.password, 10)
    })
        .then(async (obj) => {

            if (!obj.email) return res.status(400).send({ err: 'email is empty' });
            const user = await db.Customer.findOne({ where: { email: obj.email }, attributes: { include: ['password'] } });
            // console.log({ body: obj.password });
            // console.log({ user: user.password });
            const secret = process.env.secret;
            if (!user) {
                return res.status(400).send({ err: 'The userModel not found' });
            }
            const match = await bcrypt.compareSync(obj.password, user.password)
            console.log({ match: match });
            if (user && match) {
                // console.log(user);
                const token = jwt.sign(
                    {
                        id: user.id,

                        // isAdmin: userModel.isAdmin
                    },
                    secret,
                    { expiresIn: '1d' }
                );

                res.status(200).send({ user: user, token: token });
            } else {
                res.status(400).send({ err: 'password is wrong!' });
            }
        })
        .catch((err) => res.status(400).json('Error creating ' + err.message));
}

async function register(req, res) {
    try {
        const oldUser = await db.Customer.findOne({ where: { email: req.body.email } });
        if (oldUser) {
            return res.status(400).send({ msg: 'Email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        const newUser = await db.Customer.create({
            name: req.body.name,
            email: req.body.email,
            city: req.body.city,
            status: req.body.status,
            activity: req.body.activity,
            login: false,
            phonenumber: req.body.phonenumber,
            password: hashedPassword
        });

        if (newUser) {

            const user = await db.Customer.findOne({
                where: { email: newUser.email },
                attributes: { include: ['password'] }
            });

            if (!user) {
                return res.status(400).send({ err: 'The userModel not found' });
            }

            const match = await bcrypt.compare(req.body.password, user.password);

            if (user && match) {
                const secret = process.env.secret;
                const tokenData = {
                    id: user.id,

                    city: user.city,
                    status: user.status,
                    activity: user.activity,

                    login: user.login,
                }
                const token = jwt.sign(
                    {
                        user: tokenData,

                        // isAdmin: userModel.isAdmin
                    },
                    secret,
                    { expiresIn: '1d' }
                );
                const userWithoutPassword = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    city: user.city,
                    status: user.status,
                    activity: user.activity,
                }

                res.status(200).send({ user: userWithoutPassword, token: token });
            } else {
                res.status(400).send({ err: 'Password is wrong!' });
            }
        }

    } catch (error) {
        res.status(400).json('Error creating ' + error.message);
    }
}



async function deletUser(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'id is empty' });

    await db.Customer.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({});
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

    const user = req.user.user
    try {

        const obj = await db.Customer.findOne({ where: { id: user.id } });
        if (!obj) {
            return res.status(400).json({});
        }
        return res.status(200).json({
            status: 'success',
            data: obj

        });
    } catch (err) {
        return res.status(500).json({ error: 'Error getting data: ' + err.message });
    }
}

async function RestoreOneUser(req, res) {
    // if (!req.params.id) return res.status(400).send({ err: 'id is empty' });

    await db.Customer.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({});
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
    await db.Customer.findAll({ limit, offset, order: [['createdAt', 'DESC']] })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status getted',
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json([]));
}

async function getAllSoftUser(req, res) {

    await db.Customer.findAll({

        where: { deletedAt: { [Op.not]: null } },
        paranoid: false,
        order: [['deletedAt', 'DESC']]
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status delated',
                data: obj

            });
        })
        .catch((err) => res.status(400).json('Error  ' + err.message));
}

async function changerPasswordCustomer(req, res, next) {
    const user = await db.Customer.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "Email doesn't exists" });
    }
    const checkPassword = await bcrypt.compare(req.body.password, user.password);
    if (!checkPassword) {
        return res.status(400).json({ message: "Invalid Email or Password " });
    }
    const salt = await bcrypt.genSalt(10);
    const verifPassword = await bcrypt.compare(
        req.body.oldpassword,
        user.password
    );

    if (!verifPassword) {
        return res.status(400).json({ message: "Invalid old password " });
    } else {
        user.password = await bcrypt.hash(req.body.Confirmpassword, salt);
        await user.save();
        return res.status(200).json({ message: "Password Changed " });

    }
};

async function updateUser(req, res) {

    const user = req.user.user

    await db.Customer.findOne({
        where: {
            id: user.id
        }
    })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({});
            }
            obj.name = req.body.name || obj.name;
            obj.email = req.body.email || obj.email;
            obj.city = req.body.city || obj.city;
            obj.phonenumber = req.body.phonenumber || obj.phonenumber;

            obj.status = req.body.status || obj.status;
            obj.activity = req.body.activity || obj.activity;


            await obj.save();
            res.status(200).send(obj);
        })
        .catch((e) => {
            res.status(400).json({ error: e.message });
        });
}

async function updateUserAdresse(req, res) {

    const user = req.user.user

    await db.Customer.findOne({
        where: {
            id: user.id
        }
    })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({});
            }

            obj.city = req.body.city || obj.city;


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
        // console.log(key)
        schema[key] && query[key] ? (where[key] = query[key]) : null;
    });
    return {
        where: where,
        offset,
        limit,
    };
};


async function getAllStudentPagination(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Customer.findAll({ attributes: { exclude: ['password'], order: [['createdAt', 'DESC']] } }, paginate(req.query, req.query))
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',
                message: 'status getted',
                data: obj

            });
        })
        .catch((err) => res.status(400).json('Error  ' + err.message));
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
    if (!req.body.email) return res.status(400).send({ err: 'email is empty' });

    try {


        const user = await db.Customer.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        else {
            const token = jwt.sign(
                {
                    id: user.id,

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
    if (!req.params.userId) return res.status(400).send({ err: 'userId is empty' });

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
    getAllStudentPagination,
    updateUserAdresse,
    changerPasswordCustomer
};
