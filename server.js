const app = require("express")(),
	http = require("http").Server(app),
	io = require("socket.io")(http);


//在线用户
let onlineUsers = {};

//在线人数
let onlineCount = 0;

io.on("connection",ws => {
	console.log("a user connected");
	io.emit("num",onlineCount);
	//监听用户加入
	ws.on("login",obj =>{
		if(typeof obj === "number"){
			io.emit("login",onlineUsers);
		}else{
			//将userid作为唯一标识符号
			ws.name = obj.userid;

			//判断列表中是否在列表中，如果不在就加入进来
			if( !onlineUsers.hasOwnProperty(obj.userid)){
				onlineUsers[obj.userid] = obj.username;
				onlineCount ++ ;
			}
			
			let json = {
				onlineUsers:onlineUsers,
				onlineCount:onlineCount,
				user:obj
			};
			//告诉所有的用户该用户加入进来了
			io.emit("login",json);
			console.log(obj.username + "加入了聊天室");
		}
		
	});
	
	//如何辨识是哪个页面刷新
	//服务端主动向客户端发起的事件
	ws.on("disconnect",() => {
		console.log("disconnect");
		onlineUsers = {};
		onlineCount = 0;
	});
	
	ws.on("out",json =>{
		for(let key in onlineUsers){
			if(onlineUsers[key] === json.username){
				let obj = {
					userid:key,
					username:json.username
				};
				delete onlineUsers[key];
				onlineCount --;
				//同时广播退出
				io.emit("logout",{
					onlineCount:onlineCount,
					username:obj.username
				});
				console.log( obj.username + "退出了聊天室");
			}
		}
	});
	//监听用户发布聊天内容
	ws.on("message",obj => {
		io.emit("message", obj);
		obj = JSON.parse( obj );
		console.log(obj.username + "说:"+obj.content );
	});
});


http.listen(3000,() => {
	console.log("listenint on 3000");
});

