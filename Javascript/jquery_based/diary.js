/**
 *
* comment_limit: количество комментариев на странице
* browse_next_limit: количество загружаемых записей при прокрутке страницы
* html_source: текущее состояние страницы
* article_per_page: количество записей на странице
* browse_per_page: количество записей на странце всех статей
 *
 *
* browse_next_article: метод загружает дополнительные записи и отображает их настранице
* next_user_articles: метод загружает дополнительные записи конкретного пользователя
* like: метод увеличивает количество оценок для записи
* comment_send: метод отправляет комментарий на сервер с помощью AJAX
* comment_state: метод предназначен для управления состоянием комментария (удалить/восстановить)
* comment_prev: метод загружает предыдущие комментарии с помощью AJAX и отображает их на странице
* link_external: метод парсит ссылки прикрепленных файлов и закрывает их от неавторизованных пользователей
* link_add: метод прикрепляет ссылку на документ к записи
* link_remove: метод удаляет ссылку на документ
* show_geo: метод отображает autocomplete поля для выбора страны и города на основе VK API
* link_parse: парсит ссылки прикрепленных документов и оборачивает их в html
* track_selected_date: метод отслеживает выбранную пользователем дату
 */

Diary = {

	comment_limit: 0,
	browse_next_limit: 0,
	html_source:[],

	//Settings
	article_per_page: 4,
	browse_per_page: 5,

	browse_next_article: function(search){
		this.browse_next_limit++;
		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {offset:this.browse_next_limit, search:search},
			url: "/hd/diary/browse_next_article",
			success: function(response) {
					if (response != false) {

					if(response.length < Diary.browse_per_page){
						$('#next_browse').hide();
					}

					for(var i in response){
						title = "";
						status = "";
						if(lang.id == "russian"){title = response[i]['ru_title'];}else{title = response[i]['en_title'];}

						if(response[i]['status'] == 0){
							status = "<span class='diary-status-active'>Активный</span>";
						}else{
                            status = "<span class='diary-status-closed'>Завершенный</span>";
						}

						$("#browse_box").append("<li class='collection-item offset-top-10 profile-diary'><div class='row'><div class='col s12 m6 l6 left-align profile-diary-header'><a href='/hd/diary/view/"+response[i].id+"'><b>"+title+"</b></a></div></div><div class='divider diary-divider'></div><br><div><b>Автор записи:</b> <a class='blue-text' href='/hd/"+response[i]['login']+"' title='Открыть страницу пользователя'>"+response[i]['login']+"</a></div><div><b>Полных лет на момент заболевания: </b>"+response[i]['user_age']+"</div><div><b>Начало лечения:</b>"+response[i]['start']+"</div><div><b>Заболевание присутствует:</b>"+response[i]['disease_present']+"</div><div class='justify'><b>Результаты обследования:</b> "+response[i]['survey']+"</div><div class='justify'><b>Симптомы:</b> "+response[i]['symptom']+"</div><div><b>Состояние дневника:</b>"+status+"</div><br><div class='divider diary-divider'></div><div class='row' style='margin-bottom:-2px'><div class='col s12 m6 l6 offset-top-10 left-align hide-on-small-only'><b><i class='fa fa-thumbs-o-up red-text'></i></b> "+response[i]['rating']+" | <b><i class='fa fa-comment-o light-blue-text text-darken-2'></i></b> "+response[i]['comment_count']+"</div><div class='col s12 m6 l6 hide-on-med-and-up center-align'><b><i class='fa fa-thumbs-o-up red-text'></i></b> "+response[i]['rating']+" | <b><i class='fa fa-comment-o light-blue-text text-darken-2'></i></b></a> "+response[i]['comment_count']+"</div><div class='col s12 m6 l6 offset-top-10 right-align hide-on-small-only'><i class='fa fa-eye'></i> <a href='/hd/diary/view/"+response[i]['id']+"' title='"+title+"' class='diary-param-count'>Просмотр записи</a></div></div></li>");

					}
				} else {
					$('#next_browse').hide();
				}
			}
		});
	},

	next_user_articles: function(user_id){
		this.browse_next_limit++;

		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {offset:this.browse_next_limit, user_id:user_id},
			url: "/hd/diary/next_user_articles",
			success: function(response) {
					if (response != false) {

					if(response.length < Diary.article_per_page){
						$('#next_user_articles').hide();
					}




					for(var i in response){
						title = "";
						status = "";
						if(lang.id == "russian"){title = response[i]['ru_title'];}else{title = response[i]['en_title'];}

						if(response[i]['status'] == 0){
							status = "<span class='diary-status-active'>Активный</span>";
						}else if(response[i]['status'] == 1){
							status = "<span class='diary-status-complete'>Заполненный</span>";
						}else{
							status = "<span class='diary-status-closed'>Завершенный</span>";
						}

						$("#user_artciles").append("<li class='collection-item offset-top-10 profile-diary'><div class='row'><div class='col s12 m6 l6 left-align profile-diary-header'><b>"+title+"</b></div></div><div class='divider diary-divider'></div><br><div><b>Мой возраст:</b>"+response[i]['user_age']+"</div><div><b>Начало лечения:</b>"+response[i]['start']+"</div><div><b>Заболевание присутствует:</b>"+response[i]['disease_present']+"</div><div class='justify'><b>Результаты обследования:</b> "+response[i]['survey']+"</div><div class='justify'><b>Симптомы:</b> "+response[i]['symptom']+"</div><div><b>Состояние дневника:</b>"+status+"</div><br><div class='divider diary-divider'></div><div class='row' style='margin-bottom:-2px'><div class='col s12 m6 l6 offset-top-10 left-align hide-on-small-only'><b><i class='fa fa-thumbs-o-up red-text'></i></b> "+response[i]['rating']+" | <b><i class='fa fa-comment-o light-blue-text text-darken-2'></i></b> "+response[i]['comment_count']+"</div><div class='col s12 m6 l6 hide-on-med-and-up center-align'><b><i class='fa fa-thumbs-o-up red-text'></i></b> "+response[i]['rating']+" | <b><i class='fa fa-comment-o light-blue-text text-darken-2'></i></b></a> "+response[i]['comment_count']+"</div><div class='col s12 m6 l6 offset-top-10 right-align hide-on-small-only'><i class='fa fa-eye'></i> <a href='/hd/diary/view/"+response[i]['id']+"' title='"+title+"' class='diary-param-count'>Просмотр записи</a></div></div></li>");

					}
				} else {
					$('#next_user_articles').hide();
				}
			}
		});
	},

	like: function(art_id, owner_id){
		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {article_id: art_id, owner_id:owner_id},
			url: "/hd/diary/like",
			success: function(response) {
				if (response == true) {
						count = $('.like_count').html();
						$('.like_count').html(++count);
				} else {
					Materialize.toast(lang.like_exist, 2500, 'rounded red');
				}
			}
		})
	},
	comment_send: function(art_id, ownerid){
		comment = $('#article_comment').val();
		console.log(ownerid);
		if(comment.length > 5){
			$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {article_id: art_id, comment:comment, ownerid:ownerid},
			url: "/hd/diary/comment",
			success: function(response) {
				if (response == true) {
					photo = $('#sender_photo').val();
					sender_login = $('#sender').val();

					date = new Date();
					minute = date.getMinutes();
					hourse = date.getHours();
					$('#comment-list').prepend("<div class='row'><div class='col s3 m2 l2 offset-top-5'><img src='"+photo+"' alt='' class='responsive-img circle'></div><div class='col s9 m10 l10'><div class='row justify'><a href='/hd/"+sender_login+"' title='"+sender_login+"'>"+sender_login+"</a><span class='hide-on-small-only'> | <i>"+lang.ui_sended+" "+lang.ui_sended_in+" "+("0" + hourse).slice(-2)+":"+("0" + minute).slice(-2)+"</i></span><br><span class='justify'>"+comment+"</span><br><span class='hide-on-med-and-up offset-top-10'><i>"+lang.ui_sended+" "+lang.ui_sended_in+" "+("0" + hourse).slice(-2)+":"+("0" + minute).slice(-2)+"</i></span></div></div></div>");
					comment_count = $('.comment_count').html();
					$('.comment_count').html(++comment_count);
					$('#article_comment').val("");

				} else {
					Materialize.toast(lang.ui_comment_empty, 2500, 'rounded red');
				}
			}
		});
		}else{
			Materialize.toast(lang.ui_comment_empty, 2500, 'rounded red');
		}
	},
	comment_state: function(comment_id, art_id, action){

		if(action == 1){
			Diary.html_source[comment_id] = $('.comment-'+comment_id).html();
			html_deleted = "<div class='row'><p class='center-align'>"+lang.ui_comment_deleted+" <a style='cursor:pointer' onclick='Diary.comment_state("+comment_id+", "+art_id+", 0)'>"+lang.ui_comment_restore+"</a></p></div>";
			$('.comment-'+comment_id).html(html_deleted);
		}

		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {article_id:art_id,comment_id:comment_id, action: action},
			url: "/hd/diary/delete_comment",
			success: function(response) {
				if (action == 0) {
					$('.comment-'+comment_id).html(Diary.html_source[comment_id]);
				}
			}
		});
	},
	comment_prev: function(art_id){
		this.comment_limit++;
		$.ajax({
			type: 'POST',
			dataType: 'json',
			cache: false,
			data: {article_id:art_id,offset_limit:this.comment_limit},
			url: "/hd/diary/prev_comments",
			success: function(response) {
				if (response != false) {
					for(var i in response){
						photo = "";
						if(response[i]['photo'] == "" || response[i]['photo'] == null || response[i]['photo'] == "undefined"){
							photo = "http://"+location.host+"/hd/public/production/img/nophoto.png";
						}else{
							photo = "http://"+location.host+"/hd/public/user_uploads/"+response[i]['uid']+"/"+response[i]['photo'];
						}
						$('#comment-list').append("<div class='row'><div class='col s3 m2 l2 offset-top-5'><img src='"+photo+"' alt='' class='responsive-img circle'></div><div class='col s9 m10 l10'><div class='row justify'><a href='/hd/"+response[i]['login']+"' title='"+response[i]['login']+"'>"+response[i]['login']+"</a><span class='hide-on-small-only'> | <i>"+lang.ui_sended+" "+response[i]['date_sended']+"</i></span><br><span class='justify'>"+response[i]['text']+"</span><br><span class='hide-on-med-and-up offset-top-10'><i>"+lang.ui_sended+" "+response[i]['date_sended']+"</i></span></div></div></div>");
					}
				} else {
					$('#prev_comment').fadeOut('fast');
				}
			}
		});
	},
	link_external: function(link){
		ext = link.split('.').pop();
		if(ext == 'jpg' || ext == 'png' || ext == 'gif' || ext == 'jpeg'){
			return true;
		}else{
			if(link.split("/")[0] == "http:" || link.split("/")[0] == "https:" && link.split("/")[2] != "hron-prostatit.ru"){
				return true;
			}else{
				return false;
			}
		}
	},

	link_add: function(){
		link = $('#link').val();
		if(link != ""){
			if(Diary.link_external(link)){
				links = $('#links').val();
				if(links == ""){links = link;}else{links += ","+link;}
				$('#links').val(links);
				$('.link_chips').append("<div class='chip offset-top-5' style='height:auto'>"+link+"</div>");
				$('#link').val("");
			}else{
				Materialize.toast(lang.ui_diary_bad_doc, 2500, 'rounded red');
			}
		}else{
			Materialize.toast(lang.ui_diary_empty_doc, 2500, 'rounded red');
		}
	},

	link_remove: function(){
		$('#links').val("");
		$('.link_chips').html("");
	},

	show_geo: function(){
		$('#change_country').slideDown('slow');
		$('#hospital_block').slideDown('slow');
		$('#doctor_block').slideDown('slow');
		$('#source_block').slideDown('slow');
		$('#change_geodata').hide();
	},



	link_parse: (function($){
		$(function(){
			$('.current_comment').mouseenter(function(){
				$('.delete-comment-'+$(this).attr('data-cid')).removeClass("btn-delete-comment");
			}).mouseleave(function(){
				$('.delete-comment-'+$(this).attr('data-cid')).addClass("btn-delete-comment");
			});

			links_string = $('#links_string').text();
			links = links_string.split(',');
			for(var i in links){
				$('.link_chips').append("<div class='chip offset-top-5' style='height:auto'>"+links[i]+"</div>");
			}

		});
	})(jQuery),


    track_selected_date: function(date){
        var now = new Date(),
			today = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
			selected_date = new Date(date);

		//если прошло 30 дней и более
        if( (today.valueOf() - selected_date.valueOf()) > 2592000000){
            $('#confirm-update').openModal('open');
            $('#update-fields').slideDown('fast');

            $('#update_symptom').attr('required', 'required');
            $('#preparat').attr('required', 'required');

        }else{
            $('#update-fields').slideUp('fast');
            $('#update_symptom').removeAttr('required');
            $('#preparat').removeAttr('required');
		}

	}

}
