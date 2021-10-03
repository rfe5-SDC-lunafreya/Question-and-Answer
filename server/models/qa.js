const AnswerModel = require("./qa.schemas/answer.schema");
const AnswerPhotoModel = require("./qa.schemas/answer-photo.schema");
const QuestionModel = require("./qa.schemas/question.schema");
// connect to mongodb use mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/shop");

class QAService {
  constructor() {}

  exmaple() {
    return "example";
  }

  async getUnReportedQuestions(product_id, page, count) {
    page = page || 1;
    count = count || 5;

    product_id = Number(product_id);

    let questions = await QuestionModel.find({
      product_id,
      reported: false,
    })
      .skip((page - 1) * count)
      .limit(count)
      .lean();
    const questionsAnswers = await Promise.all(
      questions.map((question) => {
        return AnswerModel.find({
          question_id: question.id,
          reported: false,
        });
      })
    );
    questions = questions.map((question, index) => {
      let result = question;
      const answers = questionsAnswers[index];
      result.answers = {};
      answers.forEach((answer) => {
        result.answers[answer.id] = answer;
      });
      return result;
    });
    return questions;
  }

  async getPhotosOfAnswer(answer_id) {
    const photos = await AnswerPhotoModel.find({
      answer_id,
    });
    return photos;
  }

  async getAnswersOfQuestion(question_id, page, count) {
    page = page || 1;
    count = count || 5;
    question_id = Number(question_id);

    const answers = await AnswerModel.find({
      question_id,
      reported: false,
    })
      .skip((page - 1) * count)
      .limit(count)
      .lean();
    const answersPhotos = await Promise.all(
      answers.map((answer) => {
        return this.getPhotosOfAnswer(answer.id);
      })
    );
    answers.forEach((answer, index) => {
      const photos = answersPhotos[index];
      answer.photos = photos;
    });
    return answers;
  }

  async createQuestion(body, name, email, product_id) {
    product_id = Number(product_id);
    const maxIDData = await QuestionModel.find().sort({ _id: -1 }).limit(1);

    const maxID =
      (Array.isArray(maxIDData) &&
        maxIDData.length > 0 &&
        Number(maxIDData[0].id)) ||
      0;
    const questionID = maxID + 1;
    await QuestionModel.create({
      body,
      asker_name: name,
      asker_email: email,
      product_id,
      id: questionID,
    });
    return questionID;
  }

  async createAnswerPhoto(answer_id, url) {
    answer_id = Number(answer_id);
    const maxIDData = await AnswerPhotoModel.find().sort({ _id: -1 }).limit(1);
    const maxID =
      (Array.isArray(maxIDData) &&
        maxIDData.length > 0 &&
        Number(maxIDData[0].id)) ||
      0;
    const photoID = maxID + 1;
    return AnswerPhotoModel.create({
      id: photoID,
      answer_id,
      url,
    });
  }

  async createAnswer(question_id, body, name, email, photos) {
    question_id = Number(question_id);
    const maxIDData = await AnswerModel.find().sort({ _id: -1 }).limit(1);

    const maxID =
      (Array.isArray(maxIDData) &&
        maxIDData.length > 0 &&
        Number(maxIDData[0].id)) ||
      0;
    const answerID = maxID + 1;
    await AnswerModel.create({
      id: answerID,
      question_id,
      body,
      answerer_name: name,
      answerer_email: email,
    });
    await Promise.all(
      photos.map((photo) => {
        return this.createAnswerPhoto(answerID, photo);
      })
    );
    return answerID;
  }

  async updateQuestionHelful(question_id) {
    question_id = Number(question_id);
    const question = await QuestionModel.findOne({ id: question_id });
    if (!question) {
      throw new Error("404");
    }
    const helpful = Number(question.helpful);

    await QuestionModel.findOneAndUpdate(
      { id: question_id },
      { helpful: helpful + 1 }
    );
    return helpful + 1;
  }

  async updateQuestionReportStatus(question_id) {
    question_id = Number(question_id);
    await QuestionModel.findOneAndUpdate(
      { id: question_id },
      { reported: true }
    );
    return true;
  }

  async updateAnswerHelful(answer_id) {
    answer_id = Number(answer_id);
    const answer = await AnswerModel.findOne({ id: answer_id });
    if (!answer) {
      throw new Error("404");
    }
    const helpful = Number(answer.helpful);

    const newAnswer = await AnswerModel.findOneAndUpdate(
      { id: answer_id },
      { helpful: helpful + 1 }
    );
    return helpful + 1;
  }

  async updateAnswerReportStatus(answer_id) {
    answer_id = Number(answer_id);
    await AnswerModel.findOneAndUpdate({ id: answer_id }, { reported: true });
    return true;
  }
}

module.exports = new QAService();
