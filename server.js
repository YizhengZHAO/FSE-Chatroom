var express = require("express"); 
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/chatroom");

var db = mongoose.connection;
db.on = ("error", console.error.bind(console, "connection error:"));
db.once =("open", function() {
	//connected;	
});

var msgSchema = new mongoose.Schema({
	user: String,
	message: String,
	time: String
});

var msglog = mongoose.model("msglog", msgSchema);
var users = mongoose.model("users", msgSchema);

/*
app.get("/", function(req, res){
	res.sendFile(__dirname + '/');
});
*/
app.use("/", express.static(__dirname + "/web"));

io.on("connection", function(socket) {

	console.log("a user connected");

	socket.emit("refresh");

	msglog.find({}, function(err, ms) {
		for (i = 0; i < ms.length; i++) {
			socket.emit("chat message", ms[i].time, ms[i].user, ms[i].message);	
		}	
	});

	socket.on("refresh1", function() {
		socket.emit("removeuser");

		users.find({}, function(err, ms) {
			var len = ms.length;
			for (i = 0; i < len; i++) {
					socket.emit("usrr", ms[i].user);	
				}
			socket.emit("usernum", len);
			});	
	});

	socket.on("login1", function(usr) {
		users.findOne({user: usr}, function(err, user) {
			if (user) {
				socket.emit("usernameExisted");
			} else {
				thisuser = new users({user: usr});
				thisuser.save();
				socket.username = usr;
				console.log(usr + " joined");	
				socket.emit("login success", usr);	
				io.emit("refresh");
			};
		});
	});

	socket.on("disconnect", function(){
		if (socket.username != null) {
			time = Date();
			io.emit("chat message", time, socket.username, socket.username + " leave the room.");
			
			message = new msglog({
				user: socket.username,
				message: socket.username + " leave the room.",
				time: time
			});	
			message.save();

			users.remove({user: socket.username}, function(err, user) {
				console.log(user + " disconnect");	
			});
			io.emit("refresh");
		}
	});

	socket.on("logoutnow", function(thisuser){
		console.log(thisuser);
		time = Date();
		io.emit("chat message", time, thisuser, thisuser + " leave the room.");

		message = new msglog({
			user: thisuser,
			message: thisuser + " leave the room.",
			time: time
		});	
		message.save();

		users.remove({user: thisuser}, function(err, user) {
			console.log(user + " disconnect");	
		});
		io.emit("refresh");
	});


	socket.on("chat message", function(msg){
		console.log("message is: " + msg);
		time = Date();
		io.emit("chat message", time, socket.username, msg);
		message = new msglog({
			user: socket.username,
			message: msg,
			time: time
		});	
		message.save();
	});

});

http.listen(3000, function(){
	console.log("Listening on *: 3000")
});
