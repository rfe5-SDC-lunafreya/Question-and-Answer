var controller = require("./controllers");
var router = require("express").Router();
const QAController = require("./controllers/qa");
//Connect controller methods to their corresponding routes
//products
// router.get('/products', controller.xx.get);
// router.get('/products/:product_id/styles', controller.xx.get);
// router.get('/products/:product_id/related', controller.xx.get);
// router.get('/cart', controller.xx.get);
// router.post('/cart', controller.xx.get);

//qa
router.get("/qa/questions", QAController.getQuestons);
router.post("/qa/questions", QAController.createQuestion);
router.get(
  "/qa/questions/:question_id/answers",
  QAController.getAnswersOfQuestion
);
router.post("/qa/questions/:question_id/answers", QAController.createAnswer);
router.put(
  "/qa/questions/:question_id/helpful",
  QAController.updateQuestionHelpful
);
router.put(
  "/qa/questions/:question_id/report",
  QAController.updateQuestionReport
);
router.put("/qa/answers/:answer_id/helpful", QAController.updateAnswerHelpful);
router.put("/qa/answers/:answer_id/report", QAController.updateAnswerReport);

module.exports = router;

//reviews
