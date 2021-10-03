const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  id: Number,
  question_id: Number,
  body: String,
  date_written: {
    type: Date,
    default: Date.now,
  },
  answerer_name: String,
  answerer_email: String,
  reported: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
});
AnswerSchema.index({ id: 1 }, { unique: true });

const AnswerModel = mongoose.model("answer", AnswerSchema);

module.exports = AnswerModel;
