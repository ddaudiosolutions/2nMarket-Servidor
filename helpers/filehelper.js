'use strict';
const multer = require('multer');
const path = require('path')
const {cloudinary} = require('../cloudinary')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, cloudinary); 
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + path.extname(file.originalname));
    }
});


const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' 
        || file.mimetype === 'image/jpeg'){
            cb(null, true);
        }else {
            cb(null, false);
        }
}

const upload = multer({storage: storage, fileFilter: filefilter});

module.exports = {upload}