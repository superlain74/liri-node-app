const Twitter = require('twitter');
const keys = require('./keys');

var client = new Twitter(keys);
 
var params = {screen_name: 'cltest'};
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets);
  }
});