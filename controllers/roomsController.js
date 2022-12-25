const Rooms = require('../models/RoomModel.js');
const { validationResult } = require("express-validator");

exports.crearNewRoom = async (req, res, next) => {
  console.log('ESTOY CREANDO A SACO')
const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  console.log('newRoom', req.body)
  try {
    // Crear New Room
    const room = new Rooms(req.body);
      //GUARDAMOS EL ROOM
    await room.save();
    res.json(room);

  } catch (error) {
      console.log(error)
  }

}

exports.getOrCreateRoom = async (req, res, next) => {
  console.log('HOLAAAA ESTOY AQUÍ ')
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  const roomTitle = req.body.title
  try {
   const room = await Rooms.findOneAndUpdate(
    {title: roomTitle},
    {$setOnInsert: req.body},
    { upsert: true }     
  )
  res.json(room)

  } catch (error) {
      console.log(error)
  }

}
exports.getChatRoomById = async (req, res, next) => {
const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  const roomTitle = req.query.title
  try {
   const room = await Rooms.find({title: roomTitle});    
   res.json(room);
  } catch (error) {
      console.log(error)
  }

}

exports.getChatRoomsByUser = async (req, res, next) => {
  console.log('req.query', req.query)
const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  const user = req.query.user
  try {
   const room = await Rooms.find({$or:[{user1: user}, {user2: user}] });    
   res.json(room);
  } catch (error) {
      console.log(error)
  }

}