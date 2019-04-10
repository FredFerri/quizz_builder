var express = require('express'),
   app = express(),
   port = process.env.PORT || 3000,
   mongoose = require('mongoose'),
   Quizz = require('./api/models/QuizzSchema'),
   bodyParser = require('body-parser');

// mongoose instance connection url connection
mongoose.connect('mongodb://127.0.0.1:27017/test');    
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Connected...");
});

express.static('/views/assets/');

app.use(express.static(__dirname + '/views/assets'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.listen(port);

var routes = require('./api/routes/urls.js');

app.get("/", function(req, res) {
	res.render("index.ejs")
});

app.get("/quizzs_list", function(res, res) {
	res.render("quizzs.ejs")
});

routes(app);   

console.log("L'application est lancée sur le port "+port);
