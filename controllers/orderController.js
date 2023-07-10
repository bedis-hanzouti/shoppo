const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// add skill
// async function addNewOrder(req, res) {
//     orderLines = req.body.orderLines;

//     db.Customer.findOne({
//         where: {
//             id: req.params.id
//         }
//     })
//         .then((obj) => {
//             if (obj == null) {
//                 res.status(400).json({ error: 'CUSTOMER NOT FOUND' });
//             }
//             db.Product.findOne({
//                 where: {
//                     id: req.body.product
//                 }
//             });
//         })
//         .then((customer) => {
//             if (customer) 
//             db.Order.create({
//                 status: req.body.status || 'Pending',
//                 total: req.body.total,
//                 discount: req.body.discount || 0,
//                 quantity: req.body.quantity,
//                 total_discount: req.body.total_discount,

//                 CustomerId: customer.id
//             })
//                 .then((order) => {
//                     if (orderLines.length > 0) {
//                         orderLines.forEach((orderLine) => {
//                             db.orderLine
//                                 .create({
//                                     customerId: customer.id,
//                                     ProductId: prod.id
//                                 })

//                                 .catch((e) => res.status(400).json({ error: e.message }));
//                         });
//                     }
//                     res.status(201).json(order);
//                 })
//                 .then((or) => res.send(or));
//         });
// }

async function addNewOrder0(req, res) {
    try {
        const orderLines = req.body.orderLines;
        const customerId = req.params.id;
        const productId = req.body.product;

        const customer = await db.Customer.findOne({
            where: {
                id: customerId,
            },
        });

        if (!customer) {
            return res.status(400).json({ error: 'CUSTOMER NOT FOUND' });
        }

        const product = await db.Product.findOne({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return res.status(400).json({ error: 'PRODUCT NOT FOUND' });
        }

        const order = await db.Order.create({
            pending: Date.now(),
            total: req.body.total,
            discount: req.body.discount || 0,
            quantity: req.body.quantity,
            total_discount: req.body.total_discount,
            CustomerId: customer.id,
        });

        if (orderLines.length > 0) {
            for (let i = 0; i < orderLines.length; i++) {
                const orderLine = orderLines[i];

                await db.orderLine.create({
                    customerId: customer.id,
                    ProductId: product.id,
                });
            }
        }

        return res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(400).json({ error: 'Error creating order' });
    }
}

async function addNewOrder(req, res) {
    try {
        const orderData = req.body;
        const customerId = orderData.customer_id;
        const orderLines = orderData.orderLines;

        const customer = await db.Customer.findOne({
            where: {
                id: customerId,
            },
        });

        if (!customer) {
            return res.status(400).json({ error: 'CUSTOMER NOT FOUND' });
        }

        const order = await db.Order.create({
            pending: Date.now(),
            total: orderData.total,
            discount: orderData.discount || 0,
            quantity: orderData.quantity,
            total_discount: orderData.total_discount,
            CustomerId: customer.id,
        });

        if (orderLines && orderLines.length > 0) {
            for (let i = 0; i < orderLines.length; i++) {
                const orderLine = orderLines[i];

                const product = await db.Product.findOne({
                    where: {
                        name: orderLine.name,
                    },
                });

                if (!product) {
                    return res.status(400).json({ error: `PRODUCT NOT FOUND: ${orderLine.name}` });
                }

                await db.orderLine.create({
                    customerId: customer.id,
                    ProductId: product.id,
                });
            }
        }

        return res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(400).json({ error: 'Error creating order' });
    }
}



// async function updateOrder(req, res) {
//     await db.Order.findOne({
//         where: {
//             id: req.params.id
//         }
//     })
//         .then(async (obj) => {
//             if (obj == null) {
//                 res.status(400).json({ error: 'Order NOT FOUND' });
//             }

//             obj.status = req.body.status || obj.status;
//             obj.total = req.body.total || obj.total;
//             obj.total_discount = req.body.total_discount || obj.total_discount;
//             obj.quantity = req.body.quantity || obj.quantity;
//             obj.discount = req.body.discount || obj.discount;
//             obj.CustomerId = req.body.CustomerId || obj.CustomerId;

//             await obj.save();
//             res.status(200).send(obj);
//         })
//         .catch((e) => {
//             res.status(400).json({ error: e.message });
//         });
// }

async function updateOrder(req, res) {
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

        order.pending = req.body.pending ? Date.now() : order.pending;
        order.canceled = req.body.canceled ? Date.now() : order.canceled;
        order.delivered = req.body.delivered ? Date.now() : order.delivered;
        order.expedied = req.body.expedied ? Date.now() : order.expedied;
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
    await db.Order.findOne({ where: { id: req.params.id }, include: db.Customer })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'Order NOT FOUND' });
            }
            res.status(200).json({
                status: 'success',
                totalPrice: obj.total,

                data: obj
                //   user:doc.payload.userN
            });
        })
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}

// async function getOrderByCustomer(req, res) {
//     await db.Order.findAllAndCount({ where: { CustomerId: req.params.id }, include: db.Customer })
//         .then((obj) => {
//             if (obj == null) {
//                 res.status(400).json({ error: 'Orders NOT FOUND' });
//             }
//             let totalAmount = 0;

//             obj.forEach((order) => {
//                 totalAmount += order.total;
//             });
//             res.status(200).json({
//                 status: 'success',
//                 totalPrice: totalAmount,
//                 data: obj
//                 //   user:doc.payload.userN
//             });
//         })
//         .catch((err) => res.status(400).json('Error getting ' + err.message));
// }

async function getOrderByCustomer(req, res) {
    try {
        const customerId = req.params.id;

        const orders = await db.Order.findAll({
            where: {
                CustomerId: customerId,
            },
            include: db.Customer,
        });

        if (orders.length === 0) {
            return res.status(400).json({ error: 'Orders NOT FOUND' });
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
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))
    await db.Order.findAll({
        where: { deletedAt: { [Op.not]: null } },
        include: db.Customer,
        paranoid: false,
        order: [['deletedAt', 'DESC']]
    })
        .then((obj) => {
            if (obj == null) {
                res.status(400).json({ error: 'Orders NOT FOUND' });
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

async function getAllOrdersPagination(req, res) {
    // let token=req.headers.authorization
    // let doc =jwt.decode(token,({complete:true}))

    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.Order.findAndCountAll({ include: db.Customer }, paginate(req.query, req.query))
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
