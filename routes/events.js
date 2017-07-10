var express = require('express');
var router = express.Router();

var EventDB = require('../models/EventDB');

var email 	= require('emailjs/email');

//Events - POST
//pagination
router.post('/', function (req, res, next) {
	console.log("events post");
	var limit = 10;
    var currentPage = 1;
    if(req.params.currentPage){
    	console.log("events post currentPage is not null");
    	currentPage = req.params.currentPage;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    console.log("events post currentPage is "+currentPage);
	var collection = db.collection('events');
	var type = req.body.type;
	var keywords = req.body.keywords.split(',');
	var country = req.body.country;
	var state = req.body.state;
	var startDate = req.body.startDate;
	var endDate = req.body.endDate;

	//delete out-of-date events
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	today =  yyyy + '-' + mm + '-' + dd;
	console.log(today);
	collection.remove({'startDate': {$lt:today}})

	if(!type){
		var typeStr = {};
	}
	else{
		var typeStr = {'type' : type};
	}
	if(keywords.length == 1 && !keywords[0]){
		var keywordsStr = {};
	}
	else{
		//var keywordsStr = {'keywords': {$in:keywords}};//or
		var keywordsStr = {'keywords': {$all:keywords}};//and
		console.log("keywords is "+keywords);
	}
	if(!country){
		var countryStr = {};
	}
	else{
		var countryStr = {'country' : country};
	}
	if(!state){
		var stateStr = {};
	}
	else{
		var stateStr = {'state' : state};
	}
	if(!startDate){
		var startDateStr = {};
	}
	else{
		var startDateStr = {'startDate': {$gte:startDate}};
	}
	if(!endDate){
		var endDateStr = {};
	}
	else{
		var endDateStr = {'endDate' : {$lte:endDate}};
	}

    collection.find({$and: [typeStr, keywordsStr, countryStr, stateStr, startDateStr, endDateStr]}).toArray(function(err, rs){
    	if (err) {
            res.send(err);
        } else{
        	var totallength = rs.length;
        	var totalPage = Math.floor(totallength / limit);
            if (totallength % limit != 0) {
                totalPage += 1;
            }

            if (totalPage != 0 && currentPage > totalPage) {
                currentPage = totalPage;
            }
            
            var query = collection.find({$and: [typeStr, keywordsStr, countryStr, stateStr, startDateStr, endDateStr]}).skip((currentPage - 1) * limit).limit(limit).toArray(function(err, results){
            	res.render('events', {title:'Search Results', results:results, 
            		totallength:totallength,
            		type:type, keywords:keywords, 
            		country:country, state:state, 
            		startDate:startDate, endDate:endDate, 
            		totalPage:totalPage, currentPage:currentPage, 
            		user: req.user});
            });
        } 
	});
});

//Events - GET
//pagination
router.get( "/" , function ( req , res , err ) {
	console.log("events get");
    var limit = 10;
    var currentPage = 1;
    console.log("events get currentPage is "+req.query.currentPage);
    if(req.query.currentPage){
    	currentPage = req.query.currentPage;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    console.log("events get currentPage is "+req.query.currentPage);
	var collection = db.collection('events');
	//use trim() to delete space
	var type = req.query.type.trim();
	var keywords = req.query.keywords.trim().split(',');
	var country = req.query.country.trim();
	var state = req.query.state.trim();
	var startDate = req.query.startDate.trim();
	var endDate = req.query.endDate.trim();
	console.log("type"+type);
	console.log("keywords"+keywords);
	console.log("country"+country);
	console.log("state"+state);
	console.log("startDate"+startDate);
	console.log("endDate"+endDate);
	//delete out-of-date events
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd = '0'+dd
	} 

	if(mm<10) {
	    mm = '0'+mm
	} 

	today =  yyyy + '-' + mm + '-' + dd;
	console.log(today);
	collection.remove({'startDate': {$lt:today}})

	if(!type){
		console.log("type is null");
		var typeStr = {};
	}
	else{
		console.log("type is " + type);
		var typeStr = {'type' : type};
	}
	if(!keywords || (keywords.length == 1 && !keywords[0])){
		console.log("keywords is null");
		var keywordsStr = {};
	}
	else{
		console.log("keywords is "+keywords);
		//var keywordsStr = {'keywords': {$in:keywords}};//or
		var keywordsStr = {'keywords': {$all:keywords}};//and
	}
	if(!country){
		console.log("country is null");
		var countryStr = {};
	}
	else{
		console.log("country is "+country);
		var countryStr = {'country' : country};
	}
	if(!state){
		console.log("state is null");
		var stateStr = {};
	}
	else{
		console.log("state is "+state);
		var stateStr = {'state' : state};
	}
	if(!startDate){
		console.log("startDate is null");
		var startDateStr = {};
	}
	else{
		console.log("startDate is "+startDate);
		var startDateStr = {'startDate': {$gte:startDate}};
	}
	if(!endDate){
		console.log("endDate is null");
		var endDateStr = {};
	}
	else{
		console.log("endDate is "+endDate);
		var endDateStr = {'endDate' : {$lte:endDate}};
	}
    collection.find({$and: [typeStr, keywordsStr, countryStr, stateStr, startDateStr, endDateStr]}).toArray(function(err, rs){
    	if (err) {
            res.send(err);
        } else{
        	console.log("rs.length is "+rs.length);
        	var totallength = rs.length;
        	var totalPage = Math.floor(totallength / limit);
        	
            if (totallength % limit != 0) {
                totalPage += 1;
            }
            console.log("totalPage is "+totalPage);
            if (totalPage != 0 && currentPage > totalPage) {
                currentPage = totalPage;
            }
            var query = collection.find({$and: [typeStr, keywordsStr, countryStr, stateStr, startDateStr, endDateStr]});
            query.skip((currentPage - 1) * limit);
            query.limit(limit);
            query.toArray(function(err, results){
            	res.render('events', {title:'Search Results', 
            		type:type, keywords:keywords, 
            		country:country, state:state, 
            		startDate:startDate, endDate:endDate, 
            		totalPage:totalPage, currentPage:currentPage, 
            		results:results, totallength:totallength, user: req.user});
            });
        } 
	});
});



module.exports = router;
