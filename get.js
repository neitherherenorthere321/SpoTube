const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true })
const search = require('youtube-search');
const ytdl = require('ytdl-core');
const $ = require("jquery");
const fs = require('fs-extra');
const info = require('./info.json');

var YTAPIopions = {
  maxResults: 1,
  key: 'AIzaSyDa1geAukHGpQiOz2RJbtZ_V1ldmmvwLbw'
};

/**
 * 
 * Some extra youtube API keys if you get stuck.
 */

//AIzaSyDOGmf4tOOBF0Ul7WgwA4edFWa_1OqKRnk
//AIzaSyDa1geAukHGpQiOz2RJbtZ_V1ldmmvwLbw

const nick = info.fbnick;
const pass = info.fbpass;
const spotifyLink = info.spotifyLink;
const wordsToSkip = info.wordsToSkip;

// const nick = process.argv[2];
// const pass = process.argv[3];
// const spotifyLink = process.argv[4];
//const spotifyLink = 'https://open.spotify.com/user/1163383364/playlist/0QbpiafjotJ9i3CDiddPvy';

var getVideoLinks = false;
var dlVideos = false;

var returnedArrayOfNames;
var YoutubeLinksContainer = [];
var YoutubeTitleContainer = [];

fs.mkdir("downloaded");
fs.mkdir("mp3");
fs.unlink("music.txt");
fs.createFile("music.txt");



if (nick == null || pass == null ){
  console.log(" email or password was not defined.");
  console.log(" FYI: node script.js youremail yourpass")
} else { nightmare
.goto(spotifyLink)
.click('#has-account')
.wait(3000)
.click('.btn-facebook')
.wait('#email')
.type('#email', nick)
.type('#pass', pass)
.click('#loginbutton')
.wait('.tracklist-name')
.inject('js', 'jquery-3.2.1.min.js')
.evaluate(function(){
    $('.dialog').remove();
})
// Repeating scroll few times
.evaluate(function(){
  $(document).scrollTop($(document).height());
})
.wait(1500)
.evaluate(function(){
  $(document).scrollTop($(document).height());
})
.wait(1500)
.evaluate(function(){
  $(document).scrollTop($(document).height());
})
.wait(1500)
.evaluate(function(){
  $(document).scrollTop($(document).height());
})
.wait(1500)
.evaluate(function(){
  $(document).scrollTop($(document).height());
})
.wait(1500)
.evaluate(function(namesArray){ 
  var namesArray = [];

    $( ".track-name-wrapper" ).each(function( i ) {
        namesArray.push( 
        $(this).children(".tracklist-name").text() + " - " 
        + $(this).children(".artists-album").text());
    });

  return namesArray 
}, returnedArrayOfNames).then(function(result){

  returnedArrayOfNames = result;
  getVideoLinks = true;
     
})
.then(function() {
  console.log(returnedArrayOfNames)
  var playlistCounter = 0;
    
  if (getVideoLinks == true){
    console.log("# Starting to use Youtube API")
    for (var i = 0; i < returnedArrayOfNames.length; i++){
      //using song names to get links
      search(returnedArrayOfNames[i], YTAPIopions, function(err, res) {

        if (typeof(res) === "undefined" || res[0].kind == "youtube#playlist"){
          console.log("# Found a bad link for one song. Just skipping...");
          return playlistCounter++
        } else {

          var link = res[0].link.toString('utf8');
          var name = res[0].title.toString('utf8');

          for(var badWordsCounter = 0; badWordsCounter < wordsToSkip.length; badWordsCounter++) {
            if (name.indexOf(wordsToSkip[badWordsCounter]) !== -1){
              //aka If index of bad word found
              console.log("Skipping ", res[0].title ,"Word - ", wordsToSkip[badWordsCounter]);
              return playlistCounter++
            }
          }

          YoutubeLinksContainer.push(link);
          YoutubeTitleContainer.push(name.replace(/\W/g,' '));

          //getting length of links array and fulfilling the upcoming if statement to download videos
          if (YoutubeLinksContainer.length == (i - playlistCounter)) {
            console.log("# Youtube links are stored into memory");
            console.log("# All songs with links can be found in music.txt file");

            for (var v = 0; v < YoutubeLinksContainer.length; v++){
              console.log("# Reading video link:", YoutubeLinksContainer[v]);
              console.log("# Reading video title:", YoutubeTitleContainer[v]);

              fs.appendFile('music.txt', YoutubeLinksContainer[v] + " - " + YoutubeTitleContainer[v] + "\r\n", function (err) {
                if (err) { console.log(err) } else {
                }
              });

              ytdl(YoutubeLinksContainer[v])
              .on('error', (err) => console.log("# Skipping one video which is not available in your country or has age restrictions."))
              .pipe(fs.createWriteStream("./downloaded/" + YoutubeTitleContainer[v] + ".mp4"));
            }
          }
      }});
    }
  }
  return (YoutubeLinksContainer.length == (i - playlistCounter))
}).then(function(){
  return nightmare.end(); 
  });
}


