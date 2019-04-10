var mongoose = require('mongoose');
var asyncz = require('async');
var Quizz = require('../models/QuizzSchema');
var Question = require('../models/QuestionSchema');
var Answer = require('../models/AnswerSchema');
var Profil = require('../models/ProfilSchema');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

exports.list_all_quizzs = function(req, res) {
		Quizz.find({}, function(err, quizz) {
			if (err) {
				res.send(err);
			}
			res.json(quizz);
		});
};

exports.create_quizz = function(req, res) {
	var quizz_name = req.body.name;
	var quizz_description = req.body.description;

	var quizz_obj = new Quizz({
		name: quizz_name,
		description: quizz_description
	});

	quizz_obj.save(function(err) {
		if (err) return handleError(err);
	});

	console.log(quizz_obj);

	for (var question in req.body.questions) {
		var question_current = req.body.questions[question];
		var question_obj = new Question({
			content: question_current.content,
			id_quizz: quizz_obj._id
		});

		console.log(question_obj);

		question_obj.save(function(err) {
			if (err) return err;
		});

		for (var answer in question_current.answers) {
			var answer_current = question_current.answers[answer];
			var answer_obj = new Answer({
				content: answer_current.content,
				coeff: answer_current.coeff,
				id_question: question_obj._id
			});
			console.log(answer_obj);
			answer_obj.save(function(err) {
				if (err) return err;
			});

		};
		res.json({response:'OK'});
	};
};

exports.get_quizz = function(req, res) {
	"use strict"
	let quizz = Quizz.findById(req.params.quizz_id, function(err, quizz) {
		if (err) {
			res.send(err);
		} else {
			var results = {};
			results.quizz = quizz;
			Question.find({id_quizz:req.params.quizz_id}, function(err, questions) {
				if (err) {
					res.send(err);
				} else {
					// console.dir(questions);
					var questionsTab = [];
					asyncz.each(questions, function(question, callback_q) {
						question = question.toObject();
						console.log(question.content);
						Answer.find({id_question:question._id}, function(err, answers) {
							if (err) {
								res.send(err);
							} else {
								var answersTab = [];
								if (answers.length > 0) {	
								console.log('ANSWERS EXIST');							
									asyncz.each(answers, function(answer, callback_a) {
										answer = answer.toObject();
										console.log('level2');
										// console.log(answer.content);
										answersTab.push(answer);
										callback_a();
									}, function() {								
										question.answers = answersTab;
										questionsTab.push(question);
										callback_q();				
									})
								}
								else {
									console.log('NO ANSWERS');
									let answer = {
										id: Math.random()
									};
									answersTab.push(answer);
									question.answers = answersTab;
									questionsTab.push(question);
									callback_q();
								}
								}
							})

					}, function() {
						results.questions = questionsTab;
						console.log(JSON.stringify(results));
						// console.dir(results.questions[0]._doc);
						res.json(results);
					})
				}
			})
		}
	})
};

exports.update_quizz = function(req, res) {
	"use strict"

	let quizzObj = {
		id: req.params.quizz_id,
		name: req.body.name,
		description: req.body.description	
	};

	Quizz.findByIdAndUpdate(quizzObj.id, quizzObj, {new:true}, function(err, updatedQuizz) {
		if (err) {
			res.send(err);
		}
		else {
			updatedQuizz = updatedQuizz.toObject();
			let questions_req = req.body.questions;
			let questionsResponseTab = [];
			asyncz.each(questions_req, function(question_req, callback_q) {
				let questionObj = {
					id: question_req.id,
					content: question_req.content
				};
				Question.findByIdAndUpdate(questionObj.id, questionObj, {new:true}, function(err, updatedQuestion) {
					if (err && !updatedQuestion) {
						console.log('new question');
						question_req.id_quizz = quizzObj.id;
						let new_question = new Question(question_req);
						new_question.save(function(err, new_question) {
							if (err) {res.send(err);}
							else {
								console.log('new question OK');
								console.log(new_question);
								let answers_req = question_req.answers;
								let answersResponseTab = [];
								asyncz.each(answers_req, function(answer_req, callback_a) {
									let answerObj = {
										id: answer_req.id,
										content: answer_req.content,
										coeff: answer_req.coeff
									};
									answer_req.id_question = new_question._id;
									let new_answer = new Answer(answer_req);
									new_answer.save(function(err, success) {
										if (err) {
											console.log(err);
										}
										else {
											console.log(success);
										}
									});
									callback_a();
								},
								function() {
									console.log('LOOP ANSWERS FINISHED');
									callback_q();
								}
								);
							}
						});
					}
					else {
						console.log('QUESTION FOUND');
						let answers_req = question_req.answers;
						let answersResponseTab = [];
						asyncz.each(answers_req, function(answer_req, callback_a) {
							let answerObj = {
								id: answer_req.id,
								content: answer_req.content,
								coeff: answer_req.coeff
							};
							console.log('ANSWER_REQ = ');
							console.dir(answer_req);
							Answer.findByIdAndUpdate(answerObj.id, answerObj, {new:true}, function(err, updatedAnswer) {
								if (err && !updatedAnswer) {
									answer_req.id_question = questionObj.id;
									let new_answer = new Answer(answer_req);
									new_answer.save(function(err, success) {
										if (err) {
											console.log(err);
										}
										else {
											console.log(success);
										}
									});
								}
								else {
									answersResponseTab.push(updatedAnswer.toObject());
									console.log('OK');
								}	
								callback_a();
							})
						}, function() {
							// Fin de la boucle sur les réponses
							console.log('FINISH');
							updatedQuestion = updatedQuestion.toObject();
							updatedQuestion.answers = answersResponseTab;
							questionsResponseTab.push(updatedQuestion);
							callback_q();
						})
					}
				})
			}, function() {
				// Fin de la boucle sur les questions
				console.log('FINISH2');
				updatedQuizz.test = 'test';
				updatedQuizz.questions = questionsResponseTab;
				res.json(updatedQuizz);				
			})
		}
	})
}




// exports.update_quizz = function(req, res) {
// 	"use strict"

// 	let quizzObj = {
// 		id: req.params.quizz_id,
// 		name: req.body.name,
// 		description: req.body.description	
// 	};

// 	Quizz.findByIdAndUpdate(quizzObj.id, quizzObj, {new:true}, function(err, updatedQuizz) {
// 		if (err) {
// 			res.send(err);
// 		}
// 		else {
// 			updatedQuizz = updatedQuizz.toObject();
// 			let questions_req = req.body.questions;
// 			let questionsResponseTab = [];
// 			let loopQuestions = asyncz.each(questions_req, async function(question_req) {
// 				return new Promise(function(resolve, reject) {

// 					let questionObj = {
// 						id: question_req.id,
// 						content: question_req.content
// 					};
// 					Question.findByIdAndUpdate(questionObj.id, questionObj, {new:true}, function(err, updatedQuestion) {
// 						if (err && !updatedQuestion) {
// 							console.log('new question');
// 							question_req.id_quizz = quizzObj.id;
// 							let new_question = new Question(question_req);
// 							new_question.save(function(err, new_question) {
// 								if (err) {res.send(err);}
// 								else {
// 									console.log('new question OK');
// 									console.log(new_question);
// 									let answers_req = question_req.answers;
// 									let answersResponseTab = [];
// 									let loopAnswers = asyncz.each(answers_req, async function(answer_req) {
// 										return new Promise(function(resolve, reject) {									
// 											let answerObj = {
// 												id: answer_req.id,
// 												content: answer_req.content,
// 												coeff: answer_req.coeff
// 											};
// 											answer_req.id_question = new_question._id;
// 											let new_answer = new Answer(answer_req);
// 											new_answer.save(function(err, success) {
// 												if (err) {
// 													console.log(err);
// 													reject(err);
// 												}
// 												else {
// 													console.log(success);
// 													resolve(success);
// 												}
// 											});
// 										})
// 									});
// 									resolve(loopAnswers);
// 								}
// 							});
// 						}
// 						else {
// 							console.log('QUESTION FOUND');
// 							let answers_req = question_req.answers;
// 							let answersResponseTab = [];
// 							let answersLoop = asyncz.each(answers_req, async function(answer_req) {
// 								return new Promise(function(resolve, reject) {								
// 									let answerObj = {
// 										id: answer_req.id,
// 										content: answer_req.content,
// 										coeff: answer_req.coeff
// 									};
// 									console.log('ANSWER_REQ = ');
// 									console.dir(answer_req);
// 									Answer.findByIdAndUpdate(answerObj.id, answerObj, {new:true}, function(err, updatedAnswer) {
// 										if (err && !updatedAnswer) {
// 											answer_req.id_question = questionObj.id;
// 											let new_answer = new Answer(answer_req);
// 											new_answer.save(function(err, success) {
// 												if (err) {
// 													console.log(err);
// 													reject(err);
// 												}
// 												else {
// 													console.log(success);
// 													resolve(success);
// 												}
// 											});
// 										}
// 										else {
// 											answersResponseTab.push(updatedAnswer.toObject());
// 											console.log('OK');
// 										}	
// 									})
// 								})
// 							});
// 							resolve(loopAnswers);
// 						}
// 					})
// 				});
// 			})
// 		}
// 	})
// }











exports.delete_quizz = function(req, res) {
	Quizz.findByIdAndRemove(req.params.quizz_id, function(err, result) {
		if (err) {
			res.status(500).send(err);
		}
		else {
			res.status(204).send('Quizz supprimé');
		}
	});
};

exports.delete_question = function(req, res) {
	Question.findByIdAndRemove(req.params.question_id, function(err, result) {
		if (err) {
			res.status(500).send(err);
		}
		else {
			res.status(204).send('Question supprimée');
		}
	});
};

exports.delete_answer = function(req, res) {
	console.log(req.params.answer_id);
	Answer.findByIdAndRemove(req.params.answer_id, function(err, result) {
		if (err) {
			res.status(500).send(err);
		}
		else {
			res.status(204).send('Réponse supprimée');
		}
	});
};

exports.create_question = function(req, res) {
	var new_question = new Question(req.body);
	new_question.save(function(err, question) {
		if (err) {
			res.send(err);
		}
		res.json(question);
	});
};

exports.create_answer = function(req, res) {
	var new_answer = new Answer(req.body);
	new_answer.save(function(err, answer) {
		if (err) {
			res.send(err);
		}
		res.json(answer);
	});
};

exports.create_profil = function(req, res) {
	var new_profil = new Profil(req.body);
	new_profil.save(function(err, profil) {
		if (err) {
			res.send(err);
		}
		res.json(profil);
	});
};
