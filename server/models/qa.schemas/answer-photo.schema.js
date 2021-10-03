const mongoose = require("mongoose");

const AnswerPhotoSchema = new mongoose.Schema({
  id: Number,
  answer_id: Number,
  url: String,
});

const AnswerPhotoModel = mongoose.model("answers_photo", AnswerPhotoSchema);

module.exports = AnswerPhotoModel;
