const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const orderSchema = require('../config/joi_validation/orderSchema')
const customerController = require('../controllers/customerController')
const sendEmail = require("../config/sendMail");






async function addNewOrder0(req, res) {

    try {
        varp = []
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
            shipping: orderData.shipping,
            total: orderData.total,
            discount: orderData.discount || 0,
            quantity: orderData.quantity,
            total_discount: orderData.total_discount,
            CustomerId: customer.id,
            // transaction: t, 
        });
        const factureItems = [];
        // Create the order lines
        if (orderLines && orderLines.length > 0) {
            for (const orderLineData of orderLines) {
                const { orderQuantity, price, discount, total, total_discount, productId, quantity } = orderLineData;

                const orderLine = await db.OrderLine.create({
                    orderQuantity,
                    price,
                    quantity,
                    discount,
                    total,
                    total_discount,
                    OrderId: order.id,
                    ProductId: productId,
                });


                const product = await db.Product.findOne({
                    where: {
                        id: productId,
                    },
                });


                const factureItem = {
                    productName: product.name,
                    quantity: quantity,
                    total_discount,

                };

                factureItems.push(factureItem);
            }
        }
        console.log(factureItems);


        await sendEmail(customer.email, "Order Confirmation", customer.name, factureItems);

        return res.status(201).json({ message: 'Order created', order });
    } catch (error) {
        console.error('Error creating order:', error);
        // await t.rollback();
        return res.status(500).json({ error: error.message });
    }
}

async function addNewOrder(req, res) {
    // const validationResult = orderSchema.validate(req.body);
    // // console.log(validationResult);
    // if (validationResult.error)
    //     return res.status(404).send({ error: validationResult.error.details[0].message });


    // const t = await db.sequelize.transaction();
    try {
        varp = []
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
            shipping: orderData.shipping,
            total: orderData.total,
            discount: orderData.discount || 0,
            quantity: orderData.quantity,
            total_discount: orderData.total_discount,
            CustomerId: customer.id,
            // transaction: t, 
        });
        const factureItems = [];
        // Create the order lines
        if (orderLines && orderLines.length > 0) {
            for (const orderLineData of orderLines) {
                const { orderQuantity, price, discount, total, total_discount, productId, quantity } = orderLineData;

                const orderLine = await db.OrderLine.create({
                    orderQuantity,
                    price,
                    quantity,
                    discount,
                    total,
                    total_discount,
                    OrderId: order.id,
                    ProductId: productId,
                });


                const product = await db.Product.findOne({
                    where: {
                        id: productId,
                    },
                });


                const factureItem = {
                    productName: product.name,
                    quantity: quantity,
                    total_discount,

                };

                factureItems.push(factureItem);
            }
        }
        console.log("customer_email", customer.email);


        await sendEmail(customer.email, "Order Confirmation", customer.name, factureItems);

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
        // order.shipping = req.body.shipping || order.shipping
        // order.canceled = req.body.canceled === 'canceled' ? Sequelize.fn('now') : order.canceled;
        // order.confirmed = req.body.confirmed === 'confirmed' ? Sequelize.fn('now') : order.confirmed;
        // order.delivered = req.body.delivered === 'delivered' ? Sequelize.fn('now') : order.delivered;
        // order.expedied = req.body.expedied === "expedied" ? Sequelize.fn('now') : order.expedied;
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
    try {
        const order = await db.Order.findOne({
            where: { id: req.params.id }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Fetch the customer using the CustomerId from the order
        const customer = await db.Customer.findOne({
            where: { id: order.CustomerId }
        });

        const orderWithLines = await db.Order.findOne({
            where: { id: req.params.id },
            include: [
                { model: db.OrderLine, include: [{ model: db.Product }] }
            ]
        });

        if (!orderWithLines) {
            return res.status(400).json({});
        }


        orderWithLines.dataValues.customer = customer;


        res.status(200).json({
            status: 'success',
            data: orderWithLines
        });
    } catch (error) {
        console.error("Error getting order:", error);
        res.status(500).json({ error: "Error getting order" });
    }
}


async function getOneOrderWithProduct(req, res) {
    try {
        const order = await db.Order.findOne({
            where: { id: req.params.id },
            include: [{
                model: db.OrderLine,
                include: [{ model: db.Product }],
                order: [['createdAt', 'DESC']]
            }]
        });

        if (order === null) {
            res.status(400).json({});
        } else {
            const product = order.OrderLines.map(orderLine => orderLine.Product);

            const orderData = {
                id: order.id,
                pending: order.pending,
                canceled: order.canceled,
                delivered: order.delivered,
                expedied: order.expedied,
                total: order.total,
                total_discount: order.total_discount,
                quantity: order.quantity,
                discount: order.discount,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                deletedAt: order.deletedAt,
                CustomerId: order.CustomerId,

                Product: product

            };
            res.status(200).json({
                status: 'success',

                data: orderData
            });
        }
    } catch (err) {
        res.status(400).json('Error getting ' + err.message);
    }
}




async function getOrderByCustomer(req, res) {


    try {
        const customerId = req.params.id;
        console.log(customerId);

        const orders = await db.Order.findAll({
            where: {
                CustomerId: customerId,
            },
            include: [{

                model: db.OrderLine, include: [{ model: db.Product }],
            }], order: [['createdAt', 'DESC']]
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
async function getAllOrdersPagination0(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    const order = await db.Order.findAll({
        limit, offset, order: [['createdAt', 'DESC']]
    })
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
async function getAllOrdersPagination(req, res) {
    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;

    try {
        const orders = await db.Order.findAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        const ordersWithCustomers = await Promise.all(orders.map(async (order) => {
            const customer = await db.Customer.findOne({ where: { id: order.CustomerId } });
            if (customer) {
                order.dataValues.Customer = customer;
            }
            return order;
        }));


        res.status(200).json({
            status: 'success',
            message: 'Orders fetched successfully',
            data: ordersWithCustomers
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: error.message });
    }
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
    getOneOrderWithProduct
};
