const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const messageSchema = new Schema({    
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    mensaje: {
        type: String      
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'RoomModel'
    },
    creado: {
        type: Date,
        default: Date
    }
    
})

module.exports = mongoose.model('Messages', messageSchema)