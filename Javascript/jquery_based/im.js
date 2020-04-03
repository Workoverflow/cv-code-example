IM = {

    history_offset: 0,

	//Автоматическое обновление диалога
    update: function(to_uid){
		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data:{to_userid:to_uid},
			async:true,
			url: "/hd/im/update",
			success:function(response){
				if(response !== false){
					for(var i in response){
						photo = "";
						if(response[i]['photo'] === ""){
							photo = "http://"+location.host+"/hd/public/production/img/nophoto.png";
						}else{
							photo = "http://"+location.host+"/hd/public/user_uploads/"+response[i]['id']+"/"+response[i]['photo'];
						}
						$('#msg_list').append("<li class='collection-item avatar'><img src='"+photo+"' class='circle'><span class='title'><small>"+response[i]['name']+" "+response[i]['sname']+" "+response[i]['send_date']+"</small></span><p class='justify'>"+response[i]['msg_text']+"</p></li>");
						$('#content-msg').mCustomScrollbar("scrollTo", "bottom", {scrollInertia:1});
					}
				}
			}
		});
	},

    // Загрузка предыдущих сообщений
    getHistory: function(to_uid){
        this.history_offset = this.history_offset + 15;
		$.ajax({
        type: 'POST',
        dataType: 'json',
        cache: false,
        data:{offset:this.history_offset, to_userid:to_uid},
        async:false,
        url: "/hd/im/prev",
        success:function(response){
            if(response !== false){
            	if(response.length < 15){$('#preload').hide();}

					for(var i in response){
						photo = "";
						if(response[i]['photo'] == ""){
							photo = "http://"+location.host+"/hd/public/production/img/nophoto.png";
						}else{
							photo = "http://"+location.host+"/hd/public/user_uploads/"+response[i]['id']+"/"+response[i]['photo'];
						}
						$('#msg_list').prepend("<li class='collection-item avatar'><img src='"+photo+"' class='circle'><span class='title'><small>"+response[i]['login']+" "+response[i]['send_date']+"</small></span><p class='justify'>"+response[i]['msg_text']+"</p></li>");
						$('#content-msg').mCustomScrollbar("scrollTo", $('.mCSB_container').height()/4, {scrollInertia:1});
					}
            }else{
				$('#preload').hide();
			}
        }
    });
    },

	/*
		send: функция отправки сообщений со страницы диалога.
		to_uid - ID получателя сообщения
		msg - текст сообщения
		sender - ФИО отправителя
		sender_photo - фото профиля отправителя
	*/
    send: function(to_uid, msg, sender, sender_photo){
        if(to_userid !== 0 && msg !== ""){
			if(sender != "" && sender_photo != ""){
				$('#msg_list').append("<li class='collection-item avatar' id='temp_im'><img src='"+sender_photo+"' class='circle'><span class='title'><small>"+sender+"</small></span><p class='justify' id='not_send_text'>"+msg.split("\n").join('<br />')+"</p></li>");
				$('#content-msg').mCustomScrollbar("scrollTo", "bottom", {scrollInertia:1});
				$('#new_msg_text').val("");
			}
			$.ajax({
                type: 'POST',
                dataType: 'json',
                cache: false,
                data:{to_userid:to_uid, msg_text:msg},
                url: "/hd/im/write",
                success: function(response){
                    if(response === false){
						Materialize.toast(lang.ui_send_message_fail, 2500, 'rounded red');
                    }
                    if(response == "im_disable"){
                    	Materialize.toast(lang.ui_user_disable_im, 2500, 'rounded red');
                    	$("#temp_im").addClass('msg_not_send');
                    	$("#not_send_text").html(lang.ui_msg_not_send);
                    }
                    if(response == "not_follower"){
                    	Materialize.toast(lang.ui_user_follower_im, 2500, 'rounded red');
                    	$("#temp_im").addClass('msg_not_send');
                    	$("#not_send_text").html(lang.ui_msg_not_send);
                    }
                }
            });
		}else{
			Materialize.toast(lang.ui_send_message_fail, 2500, 'rounded red');
		}
    },

	// Открыть модальное окно для подтверждения удаления диалога
    confirmRemove: function(dialog_id, to_uid){
		$('#delete_dialog').attr('href', '/hd/im/delete_dialog/'+dialog_id+'/'+to_uid);
		$('#remove').openModal();
    },

	random: function(min, max){
		 return Math.round(min - 0.5 + Math.random() * (max - min + 1));
	},
};

//Обработчики событий

$(document).ready(function(){
	$("#content-msg").mCustomScrollbar({
		 axis:"y",
		 autoHideScrollbar:true,
		 theme:"minimal-dark",
		 setHeight: 450,
		 contentTouchScroll:25,
		 callbacks:{
		    onInit: function(){
		  		$('#content-msg').mCustomScrollbar("scrollTo", "bottom", {scrollInertia:1});
		 }}
	});

	$('.collection-item').mouseenter(function(){
		$('.trash-'+$(this).attr('id')).fadeIn('fast');
		$(this).css({'backgroundColor':'#eeeeee'});
	}).mouseleave(function(){
		$('.trash-'+$(this).attr('id')).fadeOut('fast');
		$(this).css({'backgroundColor':'#fff'});
	});

	$('#send_im').on('click', function(){
		to_uid = $('#to_userid').val();
		msg = $('#new_msg_text').val().trim();
		sender = $('#sender').val();
		sender_photo = $('#sender_photo').val();
        IM.send(to_uid, msg, sender, sender_photo);
	});

	$('#new_msg_text').keypress(function (event) {
		if(event.which == 10){
			$('#send_im').click();
		}
	});
});

(function() {
	to_uid = $('#to_userid').val();
	if(to_uid != null && to_uid != ""){
		IM.update(to_uid)
		setTimeout(arguments.callee, IM.random(2000, 10000));
	}
})();

(function() {
	$.ajax({
		type: 'POST',
		dataType: 'json',
		cache: false,
		async: true,
		url: "/hd/im/count_unread_dialog",
		success: function(response) {
			if (response !== false && response !== "0") {
				$('.new_msg_count').html(response);
				$('.new_msg_box').fadeIn('slow');
			} else {
				$('.new_msg_count').html("");
				$('.new_msg_box').fadeOut('slow');
			}
		}
	});
	setTimeout(arguments.callee, IM.random(4500, 10000));
})();
