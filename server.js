// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

let commentSchema = mongoose.Schema({
  date: Number,
  name: String,
  message: String
})

let postSchema = mongoose.Schema({
    date: Number,
    name: String,
    title: String,
    message: String,
    comments: [commentSchema]
})

let Posts = mongoose.model("posts", postSchema, "posts")

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/posts", function(req, res) {
  Posts.find({}, function(err, docs) {
    if (err) {
      res.json({error: err})
    } else {
      res.json({results: docs})
    }
  })
});

app.post('/api/newpost', function(req, res) {
  let date = Date.now();
  let userName = req.body.name;
  let postTitle = req.body.title;
  let postMessage = req.body.message;
  
  let newPost = new Posts({
    date: date,
    name: userName,
    title: postTitle,
    message: postMessage
  })
  
  newPost.save(function(err) {
    if (err) {
      return err;
    }
  });
  res.redirect('/');
})

app.post('/api/newcomment', function(req, res) {
  let date = Date.now();
  let userName = req.body.name;
  let commentBody = req.body.comment;
  let parentId = req.body.postId;
  let newComment = {date: parseInt(date), name: userName, message: commentBody};
  
  Posts.find({_id: parentId}, function(err, docs) {
    docs[0].comments.push(newComment);
    docs[0].save();
    res.redirect('/');
  })
})

app.post("/api/search", function(req, res) {
  let term = req.body.search;
  //Posts.find({ $or: [{ message: { $regex: '.*' + term + '.*' }, title: { $regex: '.*' + term + '.*' } }] }, function(err, docs) {
  Posts.find({ $or:[ {'message': { $regex: '.*' + term + '.*' } }, {'title': { $regex: '.*' + term + '.*' } }]}, function(err, docs) {
    res.json({ results: docs })
  })
  //res.json({search: term})
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
