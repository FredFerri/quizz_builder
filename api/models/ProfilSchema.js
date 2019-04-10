var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProfilSchema = new Schema({
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

module.exports = mongoose.model('Profil', ProfilSchema);
