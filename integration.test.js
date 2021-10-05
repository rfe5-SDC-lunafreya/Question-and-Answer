const app = require("./server/app");
const supertest = require("supertest");
const QuestionModel = require("./server/models/qa.schemas/question.schema");
const { addMockData, removeMockData } = require("./test.mock-data");
const AnswerModel = require("./server/models/qa.schemas/answer.schema");
const AnswerPhotoModel = require("./server/models/qa.schemas/answer-photo.schema");

const compareObjectsDeeply = (o1, o2, excludeKeys = []) => {
  if (o1 instanceof Date || o2 instanceof Date) {
    return new Date(o1).getTime() === new Date(o2).getTime();
  }
  if (typeof o1 !== typeof o2) {
    return false;
  }
  if (Array.isArray(o1) && !Array.isArray(o2)) return false;
  else if (!Array.isArray(o1) && Array.isArray(o2)) return false;
  if (Array.isArray(o1)) {
    for (let i = 0; i < o1.length; i++) {
      if (!compareObjectsDeeply(o1[i], o2[i])) {
        return false;
      }
    }
  }
  if (typeof o1 !== "object") return o1 === o2;

  for (let key in o1) {
    if (!excludeKeys.includes(key)) {
      if (!compareObjectsDeeply(o1[key], o2[key])) {
        return false;
      }
    }
  }
  return true;
};
afterAll((done) => {
  const mongoose = require("mongoose");
  mongoose.connection.close().then(() => done());
});

describe("test qa api for get", () => {
  let mockAnswers, mockAnswersPhotos, mockQuestions, product_id, questionID;
  beforeEach((done) => {
    addMockData().then((mockData) => {
      mockAnswers = mockData.mockAnswers;
      mockAnswersPhotos = mockData.mockAnswersPhotos;
      mockQuestions = mockData.mockQuestions;
      product_id = mockData.product_id;
      questionID = mockData.questionID;
      done();
    });
  });
  afterEach((done) => {
    removeMockData().then(() => {
      mockAnswers = null;
      mockAnswersPhotos = null;
      mockQuestions = null;
      product_id = null;
      done();
    });
  });
  test("get: /qa/questions", (done) => {
    mockAnswers.forEach((answer) => {
      answer.photos = [];
      mockAnswersPhotos.forEach((photo) => {
        if (photo.answer_id === answer.id) {
          answer.photos.push(photo);
        }
      });
    });
    mockQuestions.forEach((question) => {
      question.answers = {};
      mockAnswers.forEach((item) => {
        if (item.question_id === question.id) {
          question.answers[item.id] = item;
        }
      });
    });
    const expectedResult = {
      product_id: String(product_id),
      results: mockQuestions.filter((item) => !item.reported),
    };
    supertest(app)
      .get(`/qa/questions?product_id=${product_id}`)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(
          compareObjectsDeeply(expectedResult, res.body, ["_id", "__v"])
        ).toBe(true);
        done();
      });
  });
  test("get: /qa/questions/:question_id/answers", (done) => {
    const expectedResult = {};
    const expectedQuestion = mockQuestions.find(
      (item) => item.id === questionID
    );
    expectedResult.question = String(questionID);
    expectedResult.page = 1;
    expectedResult.count = 5;
    expectedResult.results = [];
    mockAnswers.forEach((answer) => {
      answer.photos = [];
      mockAnswersPhotos.forEach((photo) => {
        if (photo.answer_id === answer.id) {
          answer.photos.push(photo);
        }
      });
      if (answer.question_id === expectedQuestion.id && !answer.reported) {
        expectedResult.results.push(answer);
      }
    });
    supertest(app)
      .get(`/qa/questions/${questionID}/answers`)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(
          compareObjectsDeeply(expectedResult, res.body, ["_id", "__v"])
        ).toBe(true);
        done();
      });
  });
});

describe("test qa api for post", () => {
  afterEach(async () => {
    await QuestionModel.deleteMany({ product_id: 0 });
    await AnswerModel.deleteMany({ question_id: 0 });
    await AnswerPhotoModel.deleteMany({ url: "xxx" });
  });
  test("post: /qa/questions", async () => {
    const maxQuestionIDs = await QuestionModel.find().sort({ id: -1 }).limit(1);
    const maxQuestionID =
      (Array.isArray(maxQuestionIDs) &&
        maxQuestionIDs.length === 1 &&
        maxQuestionIDs[0].id) ||
      0;
    const expectedQuestion = {
      id: maxQuestionID + 1,
      body: "test question",
      asker_name: "tester",
      asker_email: "tester@gmail.com",
      product_id: 0,
      reported: false,
      helpful: 0,
    };
    const httpRequest = new Promise((resolve, reject) => {
      supertest(app)
        .post("/qa/questions")
        .send({
          body: expectedQuestion.body,
          name: expectedQuestion.asker_name,
          email: expectedQuestion.asker_email,
          product_id: expectedQuestion.product_id,
        })
        .expect(201)
        .end(async function (err, res) {
          if (err) return reject(err);
          resolve();
        });
    });
    await httpRequest;
    const newQuestion = await QuestionModel.findOne({
      id: expectedQuestion.id,
    }).lean();
    expect(
      compareObjectsDeeply(newQuestion, expectedQuestion, [
        "_id",
        "date_written",
        "__v",
      ])
    ).toBe(true);
  });
  test("POST /qa/questions/:question_id/answers", async () => {
    const maxAnswerIDs = await AnswerModel.find()
      .sort({ id: -1 })
      .limit(1)
      .lean();
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

    const expectedAnswerPhotos = [
      { answer_id: maxAnswerID + 1, url: "xxx", id: maxAnswerPhotoID + 1 },
    ];
    const expectedAnswer = {
      id: maxAnswerID + 1,
      question_id: 0,
      body: "test answer",
      answerer_name: "tester",
      answerer_email: "tester@gmail.com",
      reported: false,
      helpful: 0,
    };
    const requestPromise = new Promise((resolve, reject) => {
      supertest(app)
        .post(`/qa/questions/0/answers`)
        .send({
          body: expectedAnswer.body,
          name: expectedAnswer.answerer_name,
          email: expectedAnswer.answerer_email,
          photos: expectedAnswerPhotos.map((item) => item.url),
        })
        .expect(201)
        .end(function (err, res) {
          if (err) reject(err);
          resolve();
        });
    });
    await requestPromise;
    const newAnswer = await AnswerModel.findOne({ id: maxAnswerID + 1 }).lean();

    expect(
      compareObjectsDeeply(newAnswer, expectedAnswer, [
        "_id",
        "__v",
        "date_written",
      ])
    ).toBe(true);
    const newPhotos = await AnswerPhotoModel.find({
      answer_id: maxAnswerID + 1,
    }).lean();

    expect(
      compareObjectsDeeply(expectedAnswerPhotos, newPhotos, ["_id", "__v"])
    ).toBe(true);
  });
});

describe("test qa put api", () => {
  const question_id = 10,
    answer_id = 10;
  beforeEach(async () => {
    await QuestionModel.findOneAndUpdate(
      { id: question_id },
      {
        helpful: 0,
        reported: false,
      }
    );
    await AnswerModel.findOneAndUpdate(
      { id: answer_id },
      {
        helpful: 0,
        reported: false,
      }
    );
  });
  test("PUT /qa/questions/:question_id/helpful", async () => {
    const requestPromise = new Promise((resolve, reject) => {
      supertest(app)
        .put(`/qa/questions/${question_id}/helpful`)
        .expect(204)
        .end(function (err, res) {
          if (err) reject(err);
          resolve();
        });
    });
    await requestPromise;
    const newQuestion = await QuestionModel.findOne({ id: question_id });
    const newHelpful = newQuestion.helpful;
    expect(newHelpful).toBe(1);
  });
  test("PUT /qa/questions/:question_id/report", async () => {
    const requestPromise = new Promise((resolve, reject) => {
      supertest(app)
        .put(`/qa/questions/${question_id}/report`)
        .expect(204)
        .end(function (err, res) {
          if (err) reject(err);
          resolve();
        });
    });
    await requestPromise;
    const newQuestion = await QuestionModel.findOne({ id: question_id });
    const newReported = newQuestion.reported;
    expect(newReported).toBe(true);
  });
  test("PUT /qa/answers/:answer_id/helpful", async () => {
    const requestPromise = new Promise((resolve, reject) => {
      supertest(app)
        .put(`/qa/answers/${answer_id}/helpful`)
        .expect(204)
        .end(function (err, res) {
          if (err) reject(err);
          resolve();
        });
    });
    await requestPromise;
    const newAnswer = await AnswerModel.findOne({ id: answer_id });
    const newHelpful = newAnswer.helpful;
    expect(newHelpful).toBe(1);
  });
  test("PUT /qa/answers/:answer_id/report", async () => {
    const requestPromise = new Promise((resolve, reject) => {
      supertest(app)
        .put(`/qa/answers/${answer_id}/report`)
        .expect(204)
        .end(function (err, res) {
          if (err) reject(err);
          resolve();
        });
    });
    await requestPromise;
    const newAnswer = await AnswerModel.findOne({ id: answer_id });
    const newReported = newAnswer.reported;
    expect(newReported).toBe(true);
  });
});
