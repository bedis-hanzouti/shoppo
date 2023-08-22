var multer = require("multer");
const path = require("path");

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',

};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    // cb(null, `${fileName}`);
    cb(null, `image-${Date.now()}.${extension}`);
  }
});

function checkImageType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
const uploadOptions = multer({
  dest: 'public/uploads/', fileFilter: function (req, file, cb) {
    checkImageType(file, cb);
  }
});

// const uploadOptions = multer({
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     checkImageType(file, cb);

//   }
// });

module.exports = { uploadOptions }