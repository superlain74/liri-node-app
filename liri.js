/* jshint esnext: true */
/*
var params = {screen_name: 'cltest', count: 20};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) throw error;
    console.log(tweets);
	console.log(response);
  });
  */

// Include the request npm package
var request = require("request");

// Include the twitter npm package, spotify npm package and keys.js
var Twitter = require('twitter');
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');

// Include fs and chalk package
var fs = require("fs");
const chalk = require('chalk');

// Use the inquirer package to take in user inputs
var inquirer = require("inquirer");

var consumerKey = keys.twitterKeys.consumer_key;
var consumerSecret = keys.twitterKeys.consumer_secret;
var accessTokenKey = keys.twitterKeys.access_token_key;
var accessTokenSecret = keys.twitterKeys.access_token_secret;
var id = keys.spotifyKeys.id;
var secret = keys.spotifyKeys.secret;

// Add twitter credentials for user authentication
var client = new Twitter({
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  access_token_key: accessTokenKey,
  access_token_secret: accessTokenSecret
});

// Add spotify credentials for user authentication
var spotify = new Spotify({
  id: id,
  secret: secret
});

inquirer.prompt([
      {
      	type: "list",
        name: "action",
        message: "What would you like LIRI to do?",
        choices:["movie-this", "my-tweets", "spotify-this-song", "do-what-it-says"]
      }]).then(function(answers) {
			switch(answers.action) {
				case "movie-this":
					inquirer.prompt([
					{
						type: "input",
						name: "movieName",
						message: "Enter the movie name"
					}]).then(function(result){
							if(result.movieName.length>0){
								movieDetails(result.movieName);
							}else{
								movieDetails("Mr.Nobody");
							}	
					});
					break;
				case "my-tweets":
					myTweets(client);
					break;
				case "spotify-this-song":
					inquirer.prompt([
					{
						type: "input",
						name: "songName",
						message: "Enter the song name"
					}]).then(function(results){
							if(results.songName.length>0){
								spotifyThis(spotify, results.songName);
							}else{
								spotifyThis(spotify, "The Sign");
							}	
					});
					break;	
				case "do-what-it-says":
					readData();
					break;
			}
		});

function movieDetails(name){
	// Run a request to the OMDB API with the movie specified
	var queryUrl = "http://www.omdbapi.com/?t=" + name + "&y=&plot=short&apikey=40e9cece";
	var logData = "";
	logData += "Last command executed\r\n";
	logData += "node liri.js movie-this " + name+"\r\n";
	// Create a request to the queryUrl
	request(queryUrl, function(error, response, body){
		if (!error && response.statusCode === 200) {
		    // Parse the body of the site and recover the movie details
		    console.log(chalk.red("\n==============================================\n"));
		    logData += "\r\n==============================================\r\n";
		    console.log(chalk.red.bold("Title of the movie: ") + chalk.green.bold(JSON.parse(body).Title));
		    logData += "Title of the movie: " + JSON.parse(body).Title+"\r\n";
		    console.log(chalk.red.bold("The movie was released in: ") + chalk.green.bold(JSON.parse(body).Year));
		    logData += "The movie was released in: " + JSON.parse(body).Year+"\r\n";
		    console.log(chalk.red.bold("IMDB Rating of the movie: ") + chalk.green.bold(JSON.parse(body).imdbRating));
		    logData += "IMDB Rating of the movie: " + JSON.parse(body).imdbRating+"\r\n";
		    JSON.parse(body).Ratings.forEach(function(item){
		    	if(item.Source === "Rotten Tomatoes"){
		    		console.log(chalk.red.bold("Rotten Tomatoes Rating of the movie: ") + chalk.green.bold(item.Value));
		    		logData += "Rotten Tomatoes Rating of the movie: " + item.Value+"\r\n";
		    	}
		    });
		    console.log(chalk.red.bold("Country where the movie was produced: ") +chalk.green.bold(JSON.parse(body).Country));
		    logData += "Country where the movie was produced: " +JSON.parse(body).Country+",";
		    console.log(chalk.red.bold("Language of the movie: ") + chalk.green.bold(JSON.parse(body).Language));
		    logData += "Language of the movie: " + JSON.parse(body).Language+"\r\n";
		    console.log(chalk.red.bold("Plot of the movie: ") +chalk.green.bold(JSON.parse(body).Plot));
		    logData += "Plot of the movie: " +JSON.parse(body).Plot+"\r\n";
		    console.log(chalk.red.bold("Actors in the movie: ") + chalk.green.bold(JSON.parse(body).Actors));
		    logData += "Actors in the movie: " + JSON.parse(body).Actors+"\r\n";
		    console.log(chalk.red("\n==============================================\n"));
		    logData += "\r\n==============================================\r\n";

		    fs.appendFile("log.txt", logData, function(err) {
				// If an error was experienced we say it.
				  if (err) {
				    console.log(err);
				  }
			  	console.log("Results logged in log file");
			});
		}
	});
}

function myTweets(client) {
	var params = {
		q: 'cltest',
		count: 20
	}
	var logData = "";
	logData += "Last command executed\r\n";
	logData += "node liri.js my-tweets\r\n";
	client.get('search/tweets', params,function(error, tweets, response){
	  if (!error) {
	  	console.log(chalk.red("\n=======================================================\n"));
	  	logData += "\r\n=======================================================\r\n";
	  	console.log(chalk.red.bold("My Tweets!\n"));
	    for(var i=0; i<tweets.statuses.length; i++){
	       	console.log(chalk.green.bold(tweets.statuses[i].text));
	       	logData += tweets.statuses[i].text + "\r\n";
	    	console.log(chalk.green.bold(tweets.statuses[i].created_at+ "\n"));
	    	logData += tweets.statuses[i].created_at+ "\r\n";
	    }
	    console.log(chalk.red("\n=======================================================\n"));
	    logData += "\r\n=======================================================\r\n";
	    fs.appendFile("log.txt", logData, function(err) {
				// If an error was experienced we say it.
				  if (err) {
				    console.log(err);
				  }
			  	console.log("Results logged in log file");
			});
	  }
	});  
}

function spotifyThis(spotify, songName) {
	if (songName.charAt(0) === '"' && songName.charAt(songName.length -1) === '"'){
		songName = songName.substr(1,songName.length -2);
	}
	var logData = "";
	logData += "Last command executed\r\n";
	logData += "node liri.js spotify-this-song "+ songName +"\r\n";
	spotify.search({ type: 'track', query: songName }, function(err, data) {
		if (err) {
	    	return console.log(chalk.red.bold('Error occurred: ' + err));
	  	}
 			console.log(chalk.red("\n=======================================================\n"));
 			logData += "\r\n=======================================================\r\n";
	 		 for(var i=0; i<data.tracks.items.length; i++){
	 		 	if(data.tracks.items[i].name.toUpperCase() === songName.toUpperCase()){
	 		 		console.log(chalk.red.bold("\nSong Name: ")+ chalk.green.bold(data.tracks.items[i].name));
	 		 		logData += "\r\nSong Name: "+ data.tracks.items[i].name;
	 				//console.log(chalk.red.bold("Album: ")+ chalk.green.bold(data.tracks.items[i].album.name));
	 				//logData += "\r\nAlbum: "+ data.tracks.items[i].album.name;
	 				if(data.tracks.items[i].album.name===null){
	 					console.log(chalk.red.bold("Album: ")+ chalk.green.bold("No album name returned"));
	 					logData += "\r\nAlbum: "+ "No album name returned";
	 				}else{
	 					console.log(chalk.red.bold("Album: ")+ chalk.green.bold(data.tracks.items[i].album.name));
	 					logData += "\r\nAlbum: "+ data.tracks.items[i].album.name;
	 				}
	 				if(data.tracks.items[i].preview_url===null){
	 					console.log(chalk.red.bold("Preview URL: ")+ chalk.green.bold("No preview link returned"));
	 					logData += "\r\nPreview URL: "+	"No preview link returned";
	 				}else{
	 					console.log(chalk.red.bold("Preview URL: ")+ chalk.green.bold(data.tracks.items[i].preview_url));
	 					logData += "\r\nPreview URL: "+ data.tracks.items[i].preview_url;
	 				}
	 				console.log(chalk.red.bold("Artists: "));
	 				logData += "\r\nArtists: ";
	 				for(var j=0; j<data.tracks.items[i].artists.length;j++){
	 					console.log(chalk.green.bold(data.tracks.items[i].artists[j].name));
	 					logData += "\r\n" + data.tracks.items[i].artists[j].name;
	 				}
	 		 	}
	 		 }
	 		console.log(chalk.red("\n=======================================================\n"));
	 		logData += "\r\n=======================================================\r\n";
	 		fs.appendFile("log.txt", logData, function(err) {
				// If an error was experienced we say it.
				  if (err) {
				    console.log(err);
				  }
			  	console.log("Results logged in log file");
			});
 	});
}

function readData() {
	fs.readFile("random.txt", "utf8", function(err,data){
		if(err){
			return console.log(err);
		}
		var logData = "";
		logData += "Last command executed\r\n";
		logData += "node liri.js do-what-it-says\r\n";
		var dataArr = data.split(",");
		var doThis = dataArr[0];
		var name = dataArr[1];
		if(doThis === "spotify-this-song"){
			logData += "node liri.js spotify-this-song "+ name +"\r\n";
			spotifyThis(spotify, name);
		}
	});
}