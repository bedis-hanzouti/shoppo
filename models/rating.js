



module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
      
        rating: { type: DataTypes.INTEGER, allowNull: false },
        ProductId: { type: DataTypes.INTEGER, allowNull: false },
        CustomerId: { type: DataTypes.INTEGER, allowNull: false },
        comment: { type: DataTypes.STRING, allowNull: false },
        
       
       
        
          


    },{
        sequelize,
        paranoid: true,
      
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
   
    return Rating;
};










