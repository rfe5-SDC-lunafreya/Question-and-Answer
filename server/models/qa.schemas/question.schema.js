const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  id: Number,
  product_id: Number,
  body: String,
  date_written: {
    type: Date,
    default: Date.now,
  },
  asker_name: String,
  asker_email: String,
  reported: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
});
QuestionSchema.index({ id: 1 }, { unique: true });

const QuestionModel = mongoose.model("question", QuestionSchema);

module.exports = QuestionModel;
