'use strict';

module.exports = function(app) {
	var controller = require('../controllers/controller');

	app.route('/quizzs')
		.get(controller.list_all_quizzs)
		.post(controller.create_quizz)

	app.route('/quizz/:quizz_id')
		.get(controller.get_quizz)
		.patch(controller.update_quizz)
		.delete(controller.delete_quizz)

	app.route('/quizz/question/:question_id')
		.delete(controller.delete_question)	

	app.route('/quizz/question/answer/:answer_id')
		.delete(controller.delete_answer)	
};