const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const orderSchema = require('../config/joi_validation/orderSchema')





async function addNewOrder(req, res) {
    // const validationResult = orderSchema.validate(req.body);
    // // console.log(validationResult);
    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });


    // const t = await db.sequelize.transaction();
    try {
        const orderData = req.body;
        const customerId = orderData.customer_id;
        const orderLines = orderData.orderLines;

        const customer = await db.Customer.findOne({
            where: {
                id: customerId,
            },
            // transaction: t,
        });

        if (!customer) {
            // await t.rollback();
            return res.status(400).json({ error: 'CUSTOMER NOT FOUND' });
        }

        const order = await db.Order.create({
            // pending: Sequelize.fn('now'),
            total: orderData.total,
            discount: orderData.discount || 0,
            quantity: orderData.quantity,
            total_discount: orderData.total_discount,
            CustomerId: customer.id,
            // transaction: t,
        });

        // Create the order lines
        if (orderLines && orderLines.length > 0) {
            for (const orderLineData of orderLines) {
                const { orderQuantity, price, discount, total, total_discount, productId } = orderLineData;

                await db.OrderLine.create({
                    orderQuantity,
                    price,
                    discount,
                    total,
                    total_discount,
                    OrderId: order.id,
                    ProductId: productId,
                    // transaction: t,
                });
            }
        }
        // await t.commit();

        return res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        console.error('Error creating order:', error);
        // await t.rollback();
        return res.status(500).json({ error: error.message });
    }
}





async function updateOrder(req, res) {
    // const validationResult = orderSchema.validate(req.body);
    // // console.log(validationResult);
    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });
    // if (!req.params.id) return res.status(400).send({ err: 'orderId is empty' });

    try {
        const orderId = req.params.id;

        const order = await db.Order.findOne({
            where: {
                id: orderId,
            },
        });

        if (!order) {
            return res.status(400).json({ error: 'Order NOT FOUND' });
        }

        order.pending = order.pending;
        order.canceled = req.body.canceled === 'canceled' ? Sequelize.fn('now') : order.canceled;
        order.delivered = req.body.delivered === 'delivered' ? Sequelize.fn('now') : order.delivered;
        order.expedied = req.body.expedied === "expedied" ? Sequelize.fn('now') : order.expedied;
        order.total = req.body.total || order.total;
        order.total_discount = req.body.total_discount || order.total_discount;
        order.quantity = req.body.quantity || order.quantity;
        order.discount = req.body.discount || order.discount;
        order.CustomerId = req.body.CustomerId || order.CustomerId;

        await order.save();

        return res.status(200).send(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return res.status(400).json({ error: error.message });
    }
}



async function deleteOrder(req, res) {
    await db.Order.destroy({ where: { id: req.params.id } })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'Order NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',
                message: 'object delated',
                data: obj
            });
        })
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}

async function getOneOrder(req, res) {

    await db.Order.findOne({ where: { id: req.params.id }, include: [db.Customer, db.OrderLine] })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({});
            }
            res.status(200).json({
                status: 'success',
                totalPrice: obj.total,

                data: obj

            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}



async function getOrderByCustomer(req, res) {


    try {
        const customerId = req.params.id;
        console.log(customerId);

        const orders = await db.Order.findAll({
            where: {
                CustomerId: customerId,
            },
            include: [db.OrderLine],
        });

        if (orders.length === 0) {
            return res.status(400).json([]);
        }

        let totalAmount = 0;
        orders.forEach((order) => {
            totalAmount += order.total;
        });

        return res.status(200).json({
            status: 'success',
            totalPrice: totalAmount,
            data: orders,
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        return res.status(400).json({ error: error.message });
    }
}






async function getAllSoftOrders(req, res) {

    await db.Order.findAll({
        where: { deletedAt: { [Op.not]: null } },
        include: [db.Customer, db.OrderLine],
        paranoid: false,
        order: [['deletedAt', 'DESC']]
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
            }
            res.status(200).json({
                status: 'success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

async function RestoreOneOrder(req, res) {
    if (!req.params.id) return res.status(400).send({ err: 'orderId is empty' });

    await db.Order.findOne({ where: { id: req.params.id }, paranoid: false })
        .then(async (obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'Order NOT FOUND' });
            }
            await obj.restore();
            res.status(200).json({
                status: 'restored success',

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error restoring ' + err.message));
}

async function getAllOrdersPagination0(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))

    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Order.findAll({ include: db.Customer }, paginate(req.query, req.query))
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'Orders NOT FOUND' });
            }
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
        .catch((err) => res.status(400).json('Error deleting ' + err.message));
}
async function getAllOrdersPagination(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Order.findAll({ limit, offset, order: [['createdAt', 'DESC']] })
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
        .catch((err) => res.status(400).json('Error  ' + err.message));
}

module.exports = {
    addNewOrder,
    RestoreOneOrder,
    getAllSoftOrders,
    getOneOrder,
    getAllOrdersPagination,
    deleteOrder,
    updateOrder,
    getOrderByCustomer,

};
