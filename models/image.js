



module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
      
        
        alt: { type: DataTypes.STRING, allowNull: false },
        url: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
       
        
        
        
         
          


    },{
        sequelize,
        paranoid: true,
      
        // If you want to give a custom name to the deletedAt column
        // deletedAt: 'destroyTime'
      });
   
    Image.associate = models => {
        Image.belongsTo(models.Product, {
            
            foreignKey: {
                allowNull: false
            }
        });
    }
    return Image;
};










