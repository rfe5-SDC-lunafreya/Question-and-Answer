const QAService = require("./server/models/qa");
const QuestionModel = require("./server/models/qa.schemas/question.schema");
const AnswerModel = require("./server/models/qa.schemas/answer.schema");
const AnswerPhotoModel = require("./server/models/qa.schemas/answer-photo.schema");
const QuestionSchema = {
  id: Number,
  product_id: Number,
  body: String,
  date_written: Date,
  asker_name: String,
  asker_email: String,
  reported: Boolean,
  helpful: Number,
};
const AnswerSchema = {
  id: Number,
  question_id: Number,
  body: String,
  date_written: Date,
  answerer_name: String,
  answerer_email: String,
  reported: Boolean,
  helpful: Number,
};
const AnswerPhotoSchema = {
  id: Number,
  answer_id: Number,
  url: String,
};
jest.setTimeout(70000);
const checkObjectProperties = (object, schema) => {
  let res = true;
  for (let key in schema) {
    if (!Object(object[key]) instanceof schema[key]) {
      res = false;
      break;
    }
  }
  return res;
};
afterAll((done) => {
  const mongoose = require("mongoose");
  mongoose.connection.close().then(() => done());
});
test("query questions of product", async () => {
  const page = 1,
    count = 5,
    product_id = 2;
  const questions = await QAService.getUnReportedQuestions(
    product_id,
    page,
    count
  );
  expect(Array.isArray(questions)).toBe(true);
  expect(questions.length).toBeLessThanOrEqual(count);
  for (let i = 0; i < questions.length; i++) {
    expect(
      checkObjectProperties(
        questions[i],
        Object.assign(QuestionSchema, {
          answers: Object,
        })
      )
    );
  }
});
test("query answers of question", async () => {
  const question_id = 10,
    page = 1,
    count = 4;
  const answers = await QAService.getAnswersOfQuestion(
    question_id,
    page,
    count
  );
  expect(Array.isArray(answers)).toBe(true);
  expect(answers.length).toBeLessThanOrEqual(count);
  for (let i = 0; i < answers.length; i++) {
    expect(
      checkObjectProperties(
        answers[i],
        Object.assign(AnswerSchema, {
          photos: Array,
        })
      )
    );
  }
});
test("create question", async () => {
  const body = "This is a test question",
    name = "Developer",
    email = "developer@gmail.com",
    product_id = 10;
  const questionID = await QAService.createQuestion(
    body,
    name,
    email,
    product_id
  );
  const question = await QuestionModel.findOne({ id: questionID });
  expect(typeof question).toBe("object");
  expect(checkObjectProperties(question, QuestionSchema));
  // remove test question
  await QuestionModel.deleteOne({ id: questionID });
});
test("create photo of answer", async () => {
  const answer_id = 10,
    url = "xxx.xxx.jpg";
  const answerPhoto = await QAService.createAnswerPhoto(answer_id, url);
  expect(typeof answerPhoto).toBe("object");
  expect(checkObjectProperties(answerPhoto, AnswerPhotoSchema));
  // remove test photo
  await AnswerPhotoModel.deleteOne({ id: answerPhoto.id });
});
test("create answer, get photos of answer", async () => {
  const question_id = 10,
    body = "This is test answer",
    name = "developer",
    email = "developer@gmail.com",
    photos = ["x1.jpg", "x2.jpg"];
  const answerID = await QAService.createAnswer(
    question_id,
    body,
    name,
    email,
    photos
  );
  const answer = await AnswerModel.findOne({ id: answerID });

  expect(typeof answer).toBe("object");
  expect(checkObjectProperties(answer, AnswerSchema));
  const newPhotos = await QAService.getPhotosOfAnswer(answerID);
  expect(Array.isArray(newPhotos)).toBe(true);
  for (let i = 0; i < newPhotos.length; i++) {
    expect(checkObjectProperties(newPhotos[i], AnswerPhotoSchema));
  }
  // remove examples
  await AnswerModel.deleteOne({ id: answerID });
  await AnswerPhotoModel.deleteMany({ answer_id: answerID });
});
test("update question helpful", async () => {
  const question_id = 10;
  const question = await QuestionModel.findOne({ id: question_id });
  const oldHelpFul = question.helpful;
  const newHelpful = await QAService.updateQuestionHelful(question_id);
  expect(typeof oldHelpFul).toBe("number");
  expect(newHelpful).toBe(oldHelpFul + 1);
  // update to old value
  await QuestionModel.findOneAndUpdate(
    { question_id },
    { helpful: oldHelpFul }
  );
});
test("update question report status", async () => {
  const question_id = 10;
  const oldQuestion = await QuestionModel.findOne({ id: question_id });
  const oldReported = oldQuestion.reported;
  const newReported = await QAService.updateQuestionReportStatus(question_id);
  expect(newReported).toBe(true);
  // update to old value
  await QuestionModel.findOneAndUpdate(
    {
      id: question_id,
    },
    {
      reported: oldReported,
    }
  );
});
test("update answer helful", async () => {
  const answer_id = 10;
  const oldAnswer = await AnswerModel.findOne({
    id: answer_id,
  });
  const oldHelpFul = oldAnswer.helpful;
  const newHelpful = await QAService.updateAnswerHelful(answer_id);

  expect(newHelpful).toBe(oldHelpFul + 1);
  // update to old value
  await AnswerModel.findOneAndUpdate(
    {
      id: answer_id,
    },
    {
      helpful: oldHelpFul,
    }
  );
});
test("update answer report", async () => {
  const answer_id = 10;
  const oldAnswer = await AnswerModel.findOne({
    id: answer_id,
  });
  const oldReported = oldAnswer.reported;
  const newReported = await QAService.updateAnswerReportStatus(answer_id);
  expect(newReported).toBe(true);
  // update to old value
  await AnswerModel.findOneAndUpdate(
    { id: answer_id },
    {
      reported: oldReported,
    }
  );
});
