const QuestionModel = require("./server/models/qa.schemas/question.schema");
const AnswerModel = require("./server/models/qa.schemas/answer.schema");
const AnswerPhotoModel = require("./server/models/qa.schemas/answer-photo.schema");

const product_id = 0;
let mockQuestions, mockAnswers, mockAnswersPhotos;

const addMockData = async () => {
  const maxQuestionIDs = await QuestionModel.find().sort({ id: -1 }).limit(1);
  const maxQuestionID =
    (Array.isArray(maxQuestionIDs) &&
      maxQuestionIDs.length === 1 &&
      maxQuestionIDs[0].id) ||
    0;

  const maxAnswerIDs = await AnswerModel.find().sort({ id: -1 }).limit(1);
  const maxAnswerID =
    (Array.isArray(maxAnswerIDs) &&
      maxAnswerIDs.length === 1 &&
      maxAnswerIDs[0].id) ||
    0;

  const maxAnswerPhotoIDs = await AnswerPhotoModel.find()
    .sort({ id: -1 })
    .limit(1);
  const maxAnswerPhotoID =
    (Array.isArray(maxAnswerPhotoIDs) &&
      maxAnswerPhotoIDs.length === 1 &&
      maxAnswerPhotoIDs[0].id) ||
    0;

  mockQuestions = [
    {
      id: maxQuestionID + 1,
      product_id: product_id,
      body: "first test question",
      date_written: new Date(),
      asker_name: "Bob",
      asker_email: "Bob@gmail.com",
      reported: false,
      helpful: 0,
    },
    {
      id: maxQuestionID + 2,
      product_id: product_id,
      body: "second test question",
      date_written: new Date(),
      asker_name: "Jack",
      asker_email: "Jack@gmail.com",
      reported: true,
      helpful: 1,
    },
    {
      id: maxQuestionID + 3,
      product_id: product_id,
      body: "third test question",
      date_written: new Date(),
      asker_name: "Siry",
      asker_email: "Siry@gmail.com",
      reported: false,
      helpful: 3,
    },
  ];

  mockAnswers = [
    {
      id: maxAnswerID + 1,
      question_id: maxQuestionID + 1,
      body: "first answer",
      date_written: new Date(),
      answerer_name: "Box",
      answerer_email: "Box@gmail.com",
      reported: true,
      helpful: 2,
    },
    {
      id: maxAnswerID + 2,
      question_id: maxQuestionID + 1,
      body: "second answer",
      date_written: new Date(),
      answerer_name: "Jhe",
      answerer_email: "Jhe@gmail.com",
      reported: false,
      helpful: 1,
    },
  ];

  mockAnswersPhotos = [
    {
      id: maxAnswerPhotoID + 1,
      answer_id: maxAnswerID + 1,
      url: "xxx",
    },
  ];

  // insert mock data
  await QuestionModel.insertMany(mockQuestions);
  await AnswerModel.insertMany(mockAnswers);
  await AnswerPhotoModel.insertMany(mockAnswersPhotos);
  return {
    mockQuestions,
    mockAnswers,
    mockAnswersPhotos,
    product_id,
    questionID: maxQuestionID + 1,
  };
};

const removeMockData = async () => {
  await Promise.all([
    ...mockQuestions.map((item) => {
      return QuestionModel.findOneAndDelete({ id: item.id });
    }),
    ...mockAnswers.map((item) => {
      return AnswerModel.findOneAndDelete({ id: item.id });
    }),
    ...mockAnswersPhotos.map((item) => {
      return AnswerPhotoModel.findOneAndDelete({ id: item.id });
    }),
  ]);
};

module.exports = {
  addMockData,
  removeMockData,
};
