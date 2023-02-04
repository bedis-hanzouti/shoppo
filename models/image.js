



module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
      
        
        alt: { type: DataTypes.INTEGER, allowNull: false },
        url: { type: DataTypes.INTEGER, allowNull: false },
        name: { type: DataTypes.INTEGER, allowNull: false },
        
        
        
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
   
    Image.associate = models => {
        Image.belongsTo(models.Product, {
            
            onDelete: "cascade"
        });
    }
    return Image;
};










