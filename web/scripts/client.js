var socket = io();
var thisuser;

$("#ms").submit(function(){
	socket.emit("chat message", $("#m").val());
	$("#m").val("");
	return false;
});

socket.on("chat message", function(time, usr, msg) {
//	$("#messages").append($("<li>").text(time + " " + usr + ": " + msg));
	$("#messages").append($("<li>").append($("<table>").append("<tr><td id='info'>" + usr + "</td><td id='time'>" + time + "</td></tr></table>")));
	$("#messages").append($("<li>").text(msg));
	down = document.getElementById("board");
	down.scrollTop = down.scorllHeight - down.clientHeight;
	document.getElementById("board").scrollTop=document.getElementById("board").scrollHeight
});	

$("#user").submit(function(){
	socket.emit("login1", $("#usernameInput").val());
	$("#usernameInput").val("");
	return false;
});			

socket.on("usernameExisted", function() {
	document.getElementById("logintext").innerHTML = "This user name has exited, please try another one";	
	document.getElementById("logintext").style.color = "red"	
});

socket.on("login success", function(usr) {
	thisuser = usr;
	document.getElementById("login").style.display="none";
/*
				$("#messages").append($("<li>").text(usr + " joined the room"));
*/
	socket.emit("chat message", usr + " join the room.");
});

$("#logout").submit(function(){
	socket.emit("logoutnow", thisuser);
	document.getElementById("logintext").innerHTML = "Please enter your user name";	
	document.getElementById("logintext").style.color = "black";	
	document.getElementById("login").style.display="block";
	return false;
});

socket.on("removeuser", function() {
	$("#olusr").empty();
});
socket.on("usrr", function(usr) {
	if (usr != null) {
		$("#olusr").append($("<li>").text(usr));
		document.getElementById("onlineusers").scrollTop=document.getElementById("onlineusers").scrollHeight
	}
});	
socket.on("usernum", function(len) {
	$("#onlineusers").replaceWith("<div id='onlineusers'><p>Online Users: " + len + "</p></div>");		
});

socket.on("refresh", function() {
	socket.emit("refresh1");	
});

