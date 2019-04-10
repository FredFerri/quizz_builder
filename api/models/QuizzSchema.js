var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuizzSchema = new Schema({
	name: {
		type: String,
		required: 'Entrez un nom'
	},

	description: {
		type: String
	},

	picture: {
		type: String
	}
});

var Question = new Schema({
	content: {
		type: String,
		required: 'Entrez votre question'
	},

	id_quizz: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'quizz'
	}
});

var Profil = new Schema({
	name: {
		type: String,
		required: 'Entrez un nom de profil'
	},

	description: {
		type: String,
	},
	color: {
		type: String
	}
});

var Answer = new Schema({
	content: {
		type: String,
		required: 'Entrez la réponse'
	},

	coeff: {
		type: Number,
	},

	id_question: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'question'
	},

	id_quizz: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'quizz'		
	}
});

module.exports = mongoose.model('Quizz', QuizzSchema);
