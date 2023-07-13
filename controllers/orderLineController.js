const db = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;







async function getAllOrderLinesPagination(req, res) {


    const limit = req.query.size ? +req.query.size : 10;
    const offset = req.query.page ? req.query.page * limit : 0;
    await db.OrderLine.findAll({ include: db.Customer }, paginate(req.query, req.query))
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

module.exports = {

    getOneOrder,
    getAllOrderLinesPagination,



};