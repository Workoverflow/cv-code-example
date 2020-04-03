/**
 * [Класс App реализует функционал, общий для различных модулей]
 *  
 */

App = {
    user_search_offset: 0,
    rid: 0,
    cid: 0,
    user_list: '',
    user_list_content: '',

    /**
     * [user_search_next (oncick) - реализует загрузку дополнительных записей на странице поиска пользователей]
     * @return {[html]} [Фрагмент html кода]
     */
    user_search_next: function(){
        this.user_search_offset++;
        $.ajax({
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: {
                offset: this.user_search_offset,
            },
            url: "/hd/search/get_ajax_search_next",
            success: function(response) {
                if (response !== false) {
                    for(var i in response){
                        if(response[i]['photo'] != ''){
                            photo = location.origin+"/hd/public/user_uploads/"+response[i]['id']+"/"+response[i]['photo'];
                        }else{
                            photo = location.origin+"/hd/public/production/img/nophoto.png";
                        }

                        $('#search_box').append("<li class='collection-item avatar'><a href='"+location.origin+"/hd/"+response[i]['login']+"'><img src='"+photo+"' alt='' style='width:50px;height:auto' class='responsive-img circle'></a><span class='title'><a href='"+location.origin+"/hd/"+response[i]['login']+"'>"+response[i]['login']+"</a></span><p><small>последняя активность "+response[i]['action']+"</small></p></li>");
                    }
                }else{
                    $('#next_search_user').hide();
                }
            }
        });
    },

    /**
     * [search_cancel (onclick) - реализует очистку формы поиска на странице поиска пользователей]
     */
    search_cancel: function(){
        $('#search_p').fadeIn('fast');
        $('#next_search_user').show();
        $('#not-found-message').hide();
        $('#full_search').val("");
        this.user_list.html(user_list_content);
    },

    /**
     * [signup_submit (onclick) - реализует проверку и отправку формы регистрации на сервер]
     * @return {[bool]} [description]
     */
    signup_submit: function(){
        user_email = $('#user_email').val();
        user_login = $('#user_login').val();
        user_password = $('#user_password').val();
        user_repassword = $('#repeat_password').val();
        csrf_token = $('#csrf').attr('value');

        if (user_email != "" && user_login != "" && user_password != ""){
            //Проверяем валидность email адрес
            if (App.verify_email(user_email) === true) {
                // Проверяем доступность указанного email
                if (App.check_email(user_email) === false) {
                    $('#user_email').addClass('valid');
                    $('.signup-email-error').fadeOut('fast');
                    // Проверяем доступность указанного логина
                    if(App.check_login(user_login) === false){
                        $('#user_login').addClass('valid');
                        $('.signup-login-error').fadeOut('fast');
                        // Проверяем корректность пароля
                        if(App.verify_password(user_password, user_repassword)){
                            $('#repeat_password').addClass('valid');
                            $('.signup-password-error').fadeOut('fast');
                            // Если все проверки пройдены, отправляем данные на сервер
                            $.ajax({
                                type: 'POST',
                                dataType: 'json',
                                cache: false,
                                data: {
                                    user_login: user_login,
                                    user_email: user_email,
                                    user_password: user_password,
                                    sec_token: csrf_token
                                },
                                url: "/hd/auth/create_account",
                                success: function(response) {
                                    if (response == true) {
                                        window.location.href = "/hd/signup/complete";
                                    } else {
                                        window.location.href = "/hd/signup";
                                    }
                                }
                            });
                        }else{
                            $('#user_password').addClass('invalid');
                            $('#repeat_password').addClass('invalid');
                            $('.signup-password-error').fadeIn('slow');
                        }
                }else{
                    $('#user_login').addClass('invalid');
                    $('.signup-login-error').fadeIn('slow');
                }
                } else {
                    $('#user_email').addClass('invalid');
                    $('.signup-email-error').fadeIn('slow');
                }
            } else {
                Materialize.toast(lang.ui_bad_email, 2500, 'rounded red');
            }

        } else {
            Materialize.toast(lang.ui_empty_form, 2500, 'rounded red');
        }
    },

    /**
     * [verify_email (system) - реализует проверку корректности введенного email адреса]
     * @param  {[string]} email [email адрес]
     * @return {[boolean]}       [true, если email адрес валидный. false, если не валидный]
     */
    verify_email: function(email){
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    },

    /**
     * [verify_password (system, onkeyup, onchange) - реализует проерку равенства пары паролей]
     * @param  {[string]} password   [Пароль пользователя]
     * @param  {[string]} repassword [Повтор пароля]
     * @return {[boolean]}
     */
    verify_password: function(password, repassword){
        if(password == repassword){
            return true;
        }else{
            return false;
        }
    },

    /**
     * [verify_new_password (system, onkeyup, onchange) - реализует проверку пары новых паролей]
     * @param  {[string]} new_password    [Новый пароль]
     * @param  {[string]} repeat_password [Повтор нового пароля]
     * @return {[type]}
     */
    verify_new_password: function(new_password, repeat_password){
        if(new_password == repeat_password){
            $('#new_password').removeClass('invalid');
            $('#new_password').addClass('valid');

            $('#repeat_password').removeClass('invalid');
            $('#repeat_password').addClass('valid');

            $('.signup-password-error').fadeOut('slow');
        }else{
            $('#new_password').addClass('invalid');
            $('#repeat_password').addClass('invalid');
            $('.signup-password-error').fadeIn('slow');
        }
    },

    /**
     * [verify_old_password (system, onkeyup, onchange) - реализует проверку длины и подлинности]
     * @param  {[string]} password [пароль подлежащий проверке]
     * @return {[html]}          [обновляет содержимое страниц, выводя уведомления для указанных полей]
     */
    verify_old_password: function(password){
        if(App.check_user_password(password)){
            $('#old_password').removeClass('invalid');
            $('#old_password').addClass('valid');
            $('.signup-old-password-error').fadeOut('slow');
        }else{
            $('#old_password').addClass('invalid');
            $('.signup-old-password-error').fadeIn('slow');
        }
    },

    /**
     * [check_email (system, onclick, onchange)- реализует проверку доступности email адреса]
     * @return {[boolean]} [Возвращает TRUE/FALSE в зависимости от занятости email-адреса другим пользователем]
     */
     check_email: function(user_email){
        var result = $.ajax({
            type: 'POST',
            dataType: 'json',
            cache: false,
            async: false,
            data: {
                user_email: user_email
            },
            url: "/hd/auth/check_email",
            success: function(response) {
                return response;
            }
        });
        return result.responseJSON;
    },

    /**
     * [check_login (system, onclick, onchange) - реализует проверку доступности логина]
     * @return {[boolean]} [Возвращает TRUE/FALSE в зависимости от занятости логина другим пользователем]
     */
    check_login: function(user_login){
        var result;
        $.ajax({
            type: 'POST',
            dataType: 'json',
            cache: false,
            async: false,
            data: {
                user_login: user_login
            },
            url: "/hd/auth/check_login",
            success: function(response) {
                result = response;
            }
        });
        return result;
    },

    /**
     * [check_user_password (system, onclick, onchange) - реализует проверку минимальной длины и корректности пароля]
     * @param  {[string]} password [строка, содержащая пароль подлежищий проверке]
     * @return {[boolean]}          [Возвращает TRUE/FALSE в зависимости от корректности пароля]
     */
    check_user_password: function(password){
        var password_status = false;

        if(password.length > 6){
            $.ajax({
                type: 'POST',
                dataType: 'json',
                cache: false,
                async: false,
                url: "/hd/auth/check_old_password",
                data: {
                    password: password
                },
                success: function(response) {
                    if(response === true){
                        password_status = true;
                    }else{
                        password_status = false;
                    }
                }
            });
        }

        return password_status;
    },

    /**
     * [random (system) - реализует генерацию случайного числа]
     * @param  {[int]} min [минимальная граница случайного числа]
     * @param  {[int]} max [максимальная граница случайного числа]
     * @return {[int]}     [случайное число]
     */
    random: function(min, max){
        return Math.round(min - 0.5 + Math.random() * (max - min + 1));
    },

    /**
     * [Инциализация плагинов и значений по умолчанию]
     * @param  (int) screen_height [Высота экрана для текущего пользователя]
     */
    init: (function(){

        var screen_height = document.documentElement.clientHeight - 64;
        $('.header-wrapper').css({'height': screen_height});

        $(function() {
            $('.button-collapse').sideNav();

        });

        $(document).ready(function(){
            $('.scrollspy').scrollSpy();
        });

        $('.modal-trigger').leanModal();
        $('select').material_select();
        $('.carousel').carousel();

        /* Автозаполенние выпадающих списков */
        $('#country').selectivity({
            allowClear: true,
            multiple: false,
        });

        $('#select_city').selectivity({
            allowClear: true,
            multiple: false,
            placeholder: "Выберите ваш город"
        });

        $('#select_city').on("selectivity-selected", function(value, callback) {
            $('#city_name').val(value.item.text);
            $('#city').val(value.item.id);
        });


        $('#country').on('change', function() {
            var country_id = $(this).val();
            $('#country_name').val($('#country option:selected').text());
            $('select').material_select();


            $('#select_city').selectivity({
                allowClear: true,
                multiple: false,
                placeholder: "Выберите ваш город",
                ajax: {
                    url: "/hd/main/get_ajax_citys",
                    dataType: 'json',
                    type: 'POST',
                    cache: false,
                    minimumInputLength: 3,
                    quietMillis: 250,
                    params: function(term, offset) {
                        return {
                            cid: country_id,
                            query: term
                        };
                    },
                    processItem: function(item) {
                        return {
                            id: item.cid,
                            text: item.title
                        };
                    }
                }
            });
        });


        $('#change_user_geodata').on('click', function() {
            $('#change_country').slideDown('slow');
        });

        $('#main_disease').on('change', function(){
            var selected_main_disease = $(this).val();
            $('#select_sub_disease option[value='+selected_main_disease+']').remove();
            $('#select_sub_disease').material_select();
        });

        $('#select_sub_disease').on('change', function(){
            $('#sub_disease').val($('#select_sub_disease').val().toString());
        });


        $('#full_search').on('focusin', function() {
            App.user_list = $('#search_box');
            App.user_list_content = App.user_list.html();
        });


        $('#full_search').on('keyup', function() {
            search_text = $(this).val();

            if (search_text != "" && search_text.length > 0) {
                if (search_text.length > 4) {
                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        cache: false,
                        data: {
                            search_text: search_text
                        },
                        url: "/hd/search/get_ajax_users_full_search",
                        success: function(response) {
                            if (response != false) {
                                App.user_list.html("");
                                $('#search_p').fadeOut('fast')
                                for (var i in response) {
                                    if (response[i]['photo'] != '') {
                                        App.user_list.append("<li class='collection-item avatar'> <a href='/hd/" + response[i]['login'] + "'><img src='/hd/public/user_uploads/" + response[i]['id'] + "/" + response[i]['photo'] + "' alt='' style='width:50px;height:auto' class='responsive-img circle'></a><span class='title'><a href='/hd/" + response[i]['login'] + "'>" + response[i]['login'] + "</a></span><p><small>последняя активность " + response[i]['action'] + "</small></p></li>");
                                    } else {
                                        App.user_list.append("<li class='collection-item avatar'> <a href='/hd/" + response[i]['login'] + "'><img src='/hd/public/production/img/nophoto.png' alt='' style='width:50px;height:auto' class='responsive-img circle'></a><span class='title'><a href='/hd/" + response[i]['login'] + "'>" + response[i]['login'] + "</a></span><p><small>последняя активность " + response[i]['action'] + "</small></p></li>");
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                $('#search_p').fadeIn('fast');
                App.user_list.html(App.user_list_content);
            }
        });

        //Поиск пользователей по гео данным
        $('#search_users').on('click', function() {
            country_id = $('#country').val();
            city_id = $('#city').val();

            App.user_list = $('#search_box');
            App.user_list_content = App.user_list.html();

            $.ajax({
                type: 'POST',
                dataType: 'json',
                cache: false,
                data: {
                    country_id: country_id,
                    city_id: city_id
                },
                url: "/hd/search/get_ajax_users_bygeo",
                success: function(response) {
                    App.user_list.html("");
                    $('#search_p').fadeOut('fast');
                    if (response != false) {
                        $('#next_search_user').hide();
                        for (var i in response) {

                            if (response[i]['photo'] != '') {
                                App.user_list.append("<li class='collection-item avatar'> <a href='/hd/" + response[i]['login'] + "'><img src='/hd/public/user_uploads/" + response[i]['id'] + "/" + response[i]['photo'] + "' alt='' style='width:50px;height:auto' class='responsive-img circle'></a><span class='title'><a href='/hd/" + response[i]['login'] + "'>" + response[i]['login'] + "</a></span><p><small>последняя активность " + response[i]['action'] + "</small></p></li>");
                            } else {
                                App.user_list.append("<li class='collection-item avatar'> <a href='/hd/" + response[i]['login'] + "'><img src='/hd/public/production/img/nophoto.png' alt='' style='width:50px;height:auto' class='responsive-img circle'></a><span class='title'><a href='/hd/" + response[i]['login'] + "'>" + response[i]['login'] + "</a></span><p><small>последняя активность " + response[i]['action'] + "</small></p></li>");
                            }
                        }
                    }
                }
            });
        });

        //init inputmask

        $('#user_email').inputmask("email");
        $("#user_login, #login").inputmask({'mask': '*','repeat':30, "greedy": false});
    })()
}