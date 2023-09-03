const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;





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
        // console.log(key);
        schema[key] && query[key] ? (where[key] = query[key]) : null;
    });
    return {
        where: where,
        offset,
        limit
    };
};

async function getAllOrderLinesPagination(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.OrderLine.findAll(paginate(req.query, req.query))
        .then((obj) => {
            if (obj == null) {
                res.status(400).json([]);
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
        .catch((err) => res.status(400).json('Error getting ' + err.message));
}


async function getOrderLinesByOrderId(req, res) {
    try {

        // Fetch the order lines
        const orderLines = await db.OrderLine.findAll({
            where: { OrderId: req.params.id },
            include: [db.Product],
            // exclude: [db.Order]
        });

        // Return the order lines along with the customer information
        res.status(200).json(orderLines);
    } catch (error) {
        console.error("Error fetching order lines:", error);
        res.status(500).json({ error: "Error fetching order lines" });
    }
}



module.exports = {


    getAllOrderLinesPagination,
    getOrderLinesByOrderId




};