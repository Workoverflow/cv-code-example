jQuery.fn.extend({

    validator: null,

    initForm: function () {
        return this.each(function() {
            let form = $(this);

            form.validators();
            form.liveselect();

            if (form.find('.phone-mask').length) {
                form.find('.phone-mask').each(function (key, item) {
                    var phone_input = window.intlTelInput(
                        item,
                        {
                            initialCountry: "ru",
                            onlyCountries: ["ru"],
                            separateDialCode: true,
                            nationalMode: true
                        }
                    );

                    // store phone code and remove it from field
                    $(item).on('change keyup', function () {
                        var country = phone_input.getSelectedCountryData(),
                            value = $(item).val();

                        $(item).closest('.phone-mask-box').find('input[name=phone_code]').val(country.dialCode)
                        if (value.length >= 5 && value.indexOf('+') >= 0) {
                            $(item).val(value.replace('+' + country.dialCode, ''))
                        }
                    });
                });
            }

            let filed_code = $('input[name=code]');
            if (filed_code.length) {
                filed_code.on('keyup', function () {
                    if(filed_code.val().length >= 4) {
                        $('#kt_login_signin_submit').removeAttr('disabled');
                    }
                });
            }

            if (form.find('div.geo').length) {
                var geo = form.find('div.geo'),
                    country = geo.find('select[rel=country]'),
                    region  = geo.find('select[rel=region]'),
                    cities  = geo.find('select[rel=city]');

                country.on('change', function () {
                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        cache: false,
                        data:{country: country.val()},
                        url: "/ajax/getRegions",
                        beforeSend: function (xhr) {
                            // if (xhr && xhr.readyState != 4) {
                            //     xhr.abort();
                            //     return false;
                            // }
                        },
                        success: function(response){
                            $.each(response, function (key, item) {
                                region.append("<option value='"+item.id+"'>"+item['title_' + LANG]+"</option>");
                            });
                            region.closest('div.form-group').show();
                            region.removeAttr('disabled');
                            region.selectpicker('refresh');
                            form.validators();
                        }
                    });
                })

                region.on('change', function () {
                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        cache: false,
                        data:{country: country.val(), region: region.val()},
                        url: "/ajax/getCities",
                        beforeSend: function (xhr) {
                            // if (xhr && xhr.readyState != 4) {
                            //     xhr.abort();
                            //     return false;
                            // }
                        },
                        success: function(response) {
                            $.each(response, function (key, item) {
                                cities.append("<option data-subtext='"+item['area_' + LANG]+"' value='"+item.id+"'>"+item['title_' + LANG]+"</option>");
                            });
                            cities.closest('div.form-group').show();
                            cities.removeAttr('disabled');
                            cities.selectpicker('refresh');
                            form.validators();
                        }
                    });
                })
            }


            console.log("Form init")
        })
    },

    modals: function () {
        $('a[rel=modal]').on('click', function(e) {
            e.preventDefault();
            var href = $(this).attr('href'),
                title = $(this).text();

            $.confirm({
                theme: 'effex',
                offsetTop: 30,
                offsetBottom: 30,
                title: title,
                content: 'url: ' + window.location.origin + href,
                useBootstrap: true,
                buttons: {
                    cancel: {
                        text: $.ln.current.btn_cancel.text,
                        btnClass: $.ln.current.btn_cancel.btnClass,
                        action: function () {
                            this.close();
                        }
                    },
                    save: {
                        text: submit || $.ln.current.btn_save.text,
                        btnClass: $.ln.current.btn_save.btnClass,
                        action: function () {
                            let form = this.$content.find('form'),
                                p = form.parsley();
                            if (p.validate()) {
                                form.attr('action', href);
                                form.trigger('submit');
                                return true;
                            }
                            return false;
                        }
                    }
                },
                contentLoaded: function (data, status, xhr) {
                    if (status == 'error') {
                        this.close();
                        toastr.error($.ln.current.ajax.error);
                    }
                },
                onContentReady: function () {
                    this.$content.find('form').initForm();
                }
            });

        });
    },

    liveselect: function () {
        $('.selectpicker').selectpicker();

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            $('.selectpicker').selectpicker('mobile');
        }

        $('.selectpicker').on('changed.bs.select', function() {
            validator.element($(this)); // validate element
        });
    },

    validators: function () {
        validator = this.validate({
            ignore: ":hidden",

            invalidHandler: function(event, validator) {
                KTUtil.scrollTop();

                swal.fire({
                    "title": "",
                    "text": $.ln.current.alerts.error.text,
                    "type": "error",
                    "confirmButtonClass": "btn btn-secondary"
                });
            }
        })
        jQuery.extend(jQuery.validator.messages, $.ln.current.validators);
        return validator;
    },

    wizard: function () {
        var wizardEl = this.find('#wizard'),
            form = wizardEl.find('form'),
            copy = form.find('#tab-content-1').html(),
            tabControl = form.find('#tabControl'),
            tabContent = form.find('#tabContent'),
            stationCount = 1;

        if (wizardEl.length) {

            var wizard = new KTWizard('wizard', {startStep: 1});

            // Validation before going to next page
            wizard.on('beforeNext', function(wizardObj) {
                if (validator.form() !== true) {
                    wizardObj.stop();  // don't go to the next step
                }
            })

            wizard.on('change', function() {
                KTUtil.scrollTop();
            });

            var btn = form.find('[data-ktwizard-type="action-submit"]');

            btn.on('click', function(e) {
                e.preventDefault();

                if (validator.form()) {

                    swal.fire({
                        "title": "",
                        "text": $.ln.current.alerts.success.text,
                        "type": "success",
                        "confirmButtonClass": "btn btn-secondary"
                    }).then((result) => {
                        if (result.value) {
                            $(form).unbind('submit').submit()
                        }
                    })
                }
            });
        }
    },

    supertables: function () {
        if ($('.table-stations').length) {
            $('.table-customers').KTDatatable({
                data: {
                    type: 'remote',
                    source: {
                        read: {
                            url: '/ajax/getCustomers',
                            method: 'POST',
                            map: function(raw) {
                                // sample data mapping
                                var dataSet = raw;
                                if (typeof raw.data !== 'undefined') {
                                    dataSet = raw.data;
                                }
                                return dataSet;
                            }
                        }
                    },
                    pageSize: 20,
                    serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    saveState: {cookie: false}
                },

                // layout definition
                layout: {
                    scroll: false,
                    footer: false,
                    spinner: {
                        message: $.ln.current.datatable.spinner.message
                    }
                },

                translate: {
                    records: $.ln.current.datatable.records,
                    toolbar: $.ln.current.datatable.toolbar
                },

                // column sorting
                sortable: true,
                responsive: true,
                pagination: true,

                search: {
                    input: $('#customerSearch'),
                },

                // columns definition
                columns: [
                    {
                        field: 'id',
                        title: '',
                        sortable: false,
                        width: 40,
                        selector: true,
                        textAlign: 'center',
                    },
                    {
                        field: 'surname',
                        title: 'Фамилия',
                    },
                    {
                        field: 'name',
                        title: 'Имя',
                    },
                    {
                        field: 'patronymic',
                        title: 'Отчество',
                    },
                    {
                        field: 'phone',
                        title: 'Телефон',
                        template: function(row) {
                            return '+' + row.phone_code + row.phone;
                        }
                    },
                    {
                        field: 'email',
                        width: 150,
                        title: 'Email',
                    },
                    {
                        field: 'gender',
                        title: 'Пол',
                    },
                    {
                        field: 'birthday',
                        title: 'Дата рождения'
                    },
                    {
                        title: 'Действия',
                        field: 'actions',
                        sortable: false,
                        width: 130,
                        overflow: 'visible',
                        textAlign: 'center',
                        template: function(row, index, datatable) {
                            var dropup = (datatable.getPageSize() - index) <= 4 ? 'dropup' : '';
                            return '<div class="dropdown ' + dropup + '">\
                        <a href="#" class="btn btn-hover-brand btn-icon btn-pill" data-toggle="dropdown">\
                            <i class="la la-ellipsis-h"></i>\
                        </a>\
                        <div class="dropdown-menu dropdown-menu-right">\
                            <a class="dropdown-item" href="#"><i class="la la-edit"></i> Edit Details</a>\
                            <a class="dropdown-item" href="#"><i class="la la-leaf"></i> Update Status</a>\
                            <a class="dropdown-item" href="#"><i class="la la-print"></i> Generate Report</a>\
                        </div>\
                    </div>\
                    <a href="#" class="btn btn-hover-brand btn-icon btn-pill" title="Edit details">\
                        <i class="la la-edit"></i>\
                    </a>\
                    <a href="#" class="btn btn-hover-danger btn-icon btn-pill" title="Delete">\
                        <i class="la la-trash"></i>\
                    </a>';
                        },
                    }]
            });
        }


        if ($('.table-customers').length) {
            $('.table-customers').KTDatatable({
                data: {
                    type: 'remote',
                    source: {
                        read: {
                            url: '/ajax/getCustomers',
                            method: 'POST',
                            map: function(raw) {
                                // sample data mapping
                                var dataSet = raw;
                                if (typeof raw.data !== 'undefined') {
                                    dataSet = raw.data;
                                }
                                return dataSet;
                            }
                        }
                    },
                    pageSize: 20,
                    serverPaging: true,
                    serverFiltering: true,
                    serverSorting: true,
                    saveState: {cookie: false}
                },

                // layout definition
                layout: {
                    scroll: false,
                    footer: false,
                    spinner: {
                        message: $.ln.current.datatable.spinner.message
                    }
                },

                translate: {
                    records: $.ln.current.datatable.records,
                    toolbar: $.ln.current.datatable.toolbar
                },

                // column sorting
                sortable: true,
                responsive: true,
                pagination: true,

                search: {
                    input: $('#customerSearch'),
                },

                // columns definition
                columns: [
                    {
                        field: 'id',
                        title: '',
                        sortable: false,
                        width: 40,
                        selector: true,
                        textAlign: 'center',
                    },
                    {
                        field: 'surname',
                        title: 'Фамилия',
                    },
                    {
                        field: 'name',
                        title: 'Имя',
                    },
                    {
                        field: 'patronymic',
                        title: 'Отчество',
                    },
                    {
                        field: 'phone',
                        title: 'Телефон',
                        template: function(row) {
                            return '+' + row.phone_code + row.phone;
                        }
                    },
                    {
                        field: 'email',
                        width: 150,
                        title: 'Email',
                    },
                    {
                        field: 'gender',
                        title: 'Пол',
                    },
                    {
                        field: 'birthday',
                        title: 'Дата рождения'
                    },
                    {
                        title: 'Действия',
                        field: 'actions',
                        sortable: false,
                        width: 130,
                        overflow: 'visible',
                        textAlign: 'center',
                        template: function(row, index, datatable) {
                            var dropup = (datatable.getPageSize() - index) <= 4 ? 'dropup' : '';
                            return '<div class="dropdown ' + dropup + '">\
                        <a href="#" class="btn btn-hover-brand btn-icon btn-pill" data-toggle="dropdown">\
                            <i class="la la-ellipsis-h"></i>\
                        </a>\
                        <div class="dropdown-menu dropdown-menu-right">\
                            <a class="dropdown-item" href="#"><i class="la la-edit"></i> Edit Details</a>\
                            <a class="dropdown-item" href="#"><i class="la la-leaf"></i> Update Status</a>\
                            <a class="dropdown-item" href="#"><i class="la la-print"></i> Generate Report</a>\
                        </div>\
                    </div>\
                    <a href="#" class="btn btn-hover-brand btn-icon btn-pill" title="Edit details">\
                        <i class="la la-edit"></i>\
                    </a>\
                    <a href="#" class="btn btn-hover-danger btn-icon btn-pill" title="Delete">\
                        <i class="la la-trash"></i>\
                    </a>';
                        },
                    }]
            });
        }
    }

});