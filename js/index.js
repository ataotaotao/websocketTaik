		let [onoff,enter_click] = [false,false];
		let [$username,$persons,$contents,$enter,$users,$box,$btn,$input_content,$exit] = [$("#username"),$(".persons"),$(".contents .content"),$("#enter"),$("#users"),$(".contents"),$("#buttons"),$("#input-content"),$("#exit")];
		let ws = io("http://localhost:3000");
		//这里接收登录信息，如果有信息，就将内容显示在聊天室里面
		ws.on("login",users => {
			if(users.onlineUsers){
				/*返回回来的对象是一个用户对象，然后进行处理
				{
					onlineUsers:onlineUsers,
					onlineCount:onlineCount,
					user:obj
				}*/
				$persons.html( users.onlineCount);
				let p_personJoin = `<p class="join_in">${users.user.username}加入了聊天</p>`;
				//将之前的内容全部清空
				$contents.html(  $contents.html()+ p_personJoin );
				$contents.children("p:last")[0].scrollIntoView();
			}else{
				//处理的是确认是否有重复名
				//是否是第一人加入
				if($.isEmptyObject(users)){
					if($username.val()){
						$username.attr("disabled","disabled");
					}else{
						$username.removeAttr("disabled");
					}
					onoff = true;
				}else{
					let bool = false;//没重复
					for(let key in users){
						if($username.val() === users[key]){
							bool = true;//重复
						}
					}
					if(bool){
						$username[0].focus();
					}else{
						if($username.val()){
							$username.attr("disabled","disabled");
						}else{
							$username.removeAttr("disabled");
						}
						onoff = true;
					}
				}
			}
		});
		
		ws.on("num",num => {
			$persons.html(num);
		});

		ws.on("message",obj => {
			obj = JSON.parse(obj);
			let content;
			//判断信息是自己发的还是别人发的
			if($username.val() === obj.username){
				//自己发的
				content = `<p class="content-info clearfix">
					<span class="username">${obj.username}</span>
					<span class="talk">${obj.content}</span>
					<i></i>
				</p>`;
			}else{
				//别人发的
				content = `<p class="content-info on  clearfix">
					<span class="username">${obj.username}</span>
					<span class="talk">${obj.content}</span>
					<i></i>
				</p>`;
			}
			$contents.html( $contents.html() + content);
			$contents.children("p:last")[0].scrollIntoView();
		});

		ws.on("logout",obj =>{
			let content = `<p class="join_in">${obj.username}退出了聊天</p>`;
			$contents.html(  $contents.html()+ content );
			$persons.html(  obj.onlineCount );
			$contents.children("p:last")[0].scrollIntoView();
		});

		ws.on("disconnect",() => {
			//服务器断开之后，触发这个事件
			console.log("disconnect");
			$username.val("");
			$username.removeAttr("disabled");
			$box.removeClass("on");
			onoff = false;
			enter_click = false;
			$persons.html(0);
		});





		//点击开始聊天加入到聊天中
		let click_join= () => {
			let val_user = $username.val();
			if(!val_user) return;
			let obj = {
				username:val_user,
				userid:( new Date() ).getTime() + val_user
			};

			//第一个login
			ws.emit("login",obj );
		}
		
		//点击发送信息
		let click_message = () =>{
			let val = $input_content.val();
			let objs = {
				username:$username.val(),
				content:val
				//还可以带上一个唯一的标识符，判断是自己发送的还是别人发送的
			};
			ws.emit( "message",JSON.stringify(objs) );
			$input_content.val("")[0].focus();
		}

		let click_exit = () =>{
			//点击事件恢复
			$enter.click(enter_clicks);
			let obj = {
				username:$username.val()
			};
			ws.emit("out",obj);
			$username.val("");
			$username.removeAttr("disabled");
			$box.removeClass("on");
			onoff = false;
			enter_click = false;
		}
		let enter_clicks = () => {
			if(!onoff) return;
			if(!$username.val()) return;
			$box.addClass("on");
			click_join();
			//$enter.off("click");
			enter_click = true;
		}
		//点击进入聊天
		$enter.on("click",() => {
			//将前面的点击事件全部去掉，否则会导致打印多个
			enter_clicks();
		});

		//点击确认
		$users.click(() => {
			let val = $username.val();
			if(!val) return;
			let reg = /^[a-z_]\w{6,10}$/i;
			if(!reg.test(val)){
				$username.val("");
				return;
			}
			//判断用户输入是否重复了
			//第二个login
			ws.emit("login",222);
		} );

		$btn.click(() => {
			let vals = $input_content.val();
			if(!vals) return;
			click_message();
		});

		//点击退出
		$exit.click(() => {
			//enter_clik表示enter点击次数为偶数
			if(!enter_click) return;
			click_exit();
			enter_click = false;
		});