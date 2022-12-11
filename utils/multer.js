const multer = require("multer");
const path = require("path");
let ext;
// Multer config
module.exports = multer({
  storage: multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null,"public/productimages/");
    },
    fileFilter: (req, file, cb) => {
       ext = path.extname(file.originalname);  
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        cb(new Error("File type is not supported"), false);
        return;
      }
      cb(null, true);
    },  filename: function (req, file, cb) {
      ext = path.extname(file.originalname); 
      cb(null,`${file.fieldname}-${Date.now()}${ext}`)
    }
  }),



  
});