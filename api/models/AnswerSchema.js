var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
	content: {
		type: String,
		required: 'Entre la réponse'
	},

	coeff: {
		type: Number,
	},

	id_question: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'question'
	}
});

module.exports = mongoose.model('Answer', AnswerSchema);
