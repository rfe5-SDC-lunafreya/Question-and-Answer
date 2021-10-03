const QAService = require("../models/qa");

class QAController {
  constructor() {}

  hello(req, res) {
    const data = QAService.exmaple();
    res.send(data);
  }

  async getQuestons(req, res) {
    try {
      const { product_id, page, count } = req.query;

      const questions = await QAService.getUnReportedQuestions(
        product_id,
        page,
        count
      );
      res.status(200).json({
        product_id,
        results: questions,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async getAnswersOfQuestion(req, res) {
    try {
      const { question_id } = req.params;
      const { page, count } = req.query;
      const answers = await QAService.getAnswersOfQuestion(
        question_id,
        page,
        count
      );
      res.status(200).json({
        question: question_id,
        page,
        count,
        results: answers,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async createQuestion(req, res) {
    try {
      const { body, name, email, product_id } = req.body;
      await QAService.createQuestion(body, name, email, product_id);
      res.status(201).send("CREATED");
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }

  async createAnswer(req, res) {
    try {
      const { question_id } = req.params;
      const { body, name, email, photos } = req.body;
      await QAService.createAnswer(question_id, body, name, email, photos);
      res.status(201).send("CREATED");
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async updateQuestionHelpful(req, res) {
    try {
      const { question_id } = req.params;
      await QAService.updateQuestionHelful(question_id);
      res.status(204).send("NO CONTENT");
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async updateQuestionReport(req, res) {
    try {
      const { question_id } = req.params;
      await QAService.updateQuestionReportStatus(question_id);
      res.status(204).send("NO CONTENT");
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async updateAnswerHelpful(req, res) {
    try {
      const { answer_id } = req.params;
      await QAService.updateAnswerHelful(answer_id);
      res.status(204).send("NO CONTENT");
    } catch (err) {
      res.status(500).json(err);
    }
  }

  async updateAnswerReport(req, res) {
    try {
      const { answer_id } = req.params;
      await QAService.updateAnswerReportStatus(answer_id);
      res.status(204).send("NO CONTENT");
    } catch (err) {
      res.status(500).json(err);
    }
  }
}

module.exports = new QAController();
