var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
	content: {
		type: String,
		required: 'Entrez votre question'
	},

	id_quizz: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'quizz'
	}
});

module.exports = mongoose.model('Question', QuestionSchema);
