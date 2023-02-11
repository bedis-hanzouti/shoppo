const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// add skill
async function addNewOrder(req, res) {
    orderLines = req.body.orderLines;

    db.Customer.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(() => {
            db.Product.findOne({
                where: {
                    id: req.body.product
                }
            });
        })
        .then((customer) => {
            db.Order.create({
                status: req.body.status || 'Pending',
                total: req.body.total,
                discount: req.body.discount || 0,
                quantity: req.body.quantity,
                total_discount: req.body.total_discount,

                CustomerId: customer.id
            })
                .then((order) => {
                    if (orderLines.length > 0) {
                        orderLines.forEach((orderLine) => {
                            db.orderLine
                                .create({
                                    cusyomerId: customer.id,
                                    product_id: prod.id
                                })
                                .then()
                                .catch((e) => res.status(400).json({ error: e }));
                        });
                    }
                    res.status(201).json(order);
                })
                .then((or) => res.send(or));
        });
}

async function updateOrder(req, res) {
    await db.Order.findOne({
        where: {
            id: req.params.id
        }
    })
        .then(async (obj) => {
            console.log('hello', obj);

            obj.status = req.body.status || obj.status;
            obj.total = req.body.total || obj.total;
            obj.total_discount = req.body.total_discount || obj.total_discount;
            obj.quantity = req.body.quantity || obj.quantity;
            obj.discount = req.body.discount || obj.discount;
            obj.CustomerId = req.body.CustomerId || obj.CustomerId;

            await obj.save();
            res.status(200).send(obj);
        })
        .catch((e) => {
            res.status(400).json({ error: e });
        });
}
async function deleteOrder(req, res) {
    await db.Order.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err));
}

async function getOneOrder(req, res) {
    await db.Order.findOne({ where: { id: req.params.id }, include: db.Customer })
        .then((obj) => {
            res.status(200).json({
                status: 'success',
                totalPrice: obj.total,

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err));
}

async function getOrderByCustomer(req, res) {
    await db.Order.findAllAndCount({ where: { CustomerId: req.params.id }, include: db.Customer })
        .then((obj) => {
            let totalAmount = 0;

            obj.forEach((order) => {
                totalAmount += order.total;
            });
            res.status(200).json({
                status: 'success',
                totalPrice: totalAmount,
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err));
}

async function getAllSoftOrders(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Order.findAll({
        where: { deletedAt: { [Op.not]: null } },
        include: db.Customer,
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
        .catch((err) => res.status(400).json('Error getting ' + err));
}

async function RestoreOneOrder(req, res) {
    await db.Order.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            // console.log(obj);
            await obj.restore();
            res.status(200).json({
                status: 'restored success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error restoring ' + err));
}

async function getAllOrdersPagination(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))

    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Order.findAndCountAll({ include: db.Customer }, paginate(req.query, req.query))
        .then((obj) => {
            let totalAmount = 0;
            obj.forEach((order) => {
                totalAmount += order.total;
            });
            res.status(200).json({
                status: 'success',
                totalPrice: totalAmount,
                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err));
}

module.exports = {
    addNewOrder,
    RestoreOneOrder,
    getAllSoftOrders,
    getOneOrder,
    getAllOrdersPagination,
    deleteOrder,
    updateOrder,
    getOrderByCustomer
};
