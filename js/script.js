(function() {
    window.onload = function() {
        var self = null;
        var Jusers = function() {
            self = this;
            this.getedInfo = false;
            this.idUser = null;
            this.busy = false;
            this.totalCommentProfile = 0;
            this.pageProfile = 0;
            this.pagePicture = 0;
            this.pageNew = 0;
            this.checkInstall = function(callback) {
                var url = "php/functions.php?function=checkInstall";
                $.getJSON(url, function(data) {
                    if (callback) {
                        callback(data);
                    }
                });
            };
            this.getParameters = function() {
                //strObj = "usr=serdnah2&def=%7B%22hola%22%3A%22valor%22%7D";
                var str = document.URL.split("?").pop();
                var obj = {};
                str.replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
                    obj[decodeURIComponent(key)] = decodeURIComponent(value);
                });
                return obj;
            };
            this.parameters = this.getParameters();
            this.addInfoUser = function() {
                var url = "php/functions.php?function=getInfo&id=" + self.idUser;
                $.getJSON(url, function(data) {
                    self.getedInfo = true;
                    $('#user').val(data[0].username);
                    $('#email').val(data[0].email);
                    $('#city').val(data[0].city);
                    $('#description').val(data[0].description);
                });
            };
            this.listeners = function() {
                $("#ju-footer .pull-right").click(function() {
                    $('body').animate({scrollTop: 0}, 'slow');
                });
                $('#ju-more').click(function() {
                    self.getCommentsProfile();
                });
                $('#ju-more-picture button').click(function() {
                    self.getCommentsPicture();
                });
                $('#ju-more-news').click(function() {
                    self.getNews();
                });
                $("#ju-nav li").click(function() {
                    if (!$(this).hasClass('active')) {
                        var page = $(this).attr('data-ju-page');
                        $('#ju-nav li.active').removeClass('active');
                        $(this).addClass('active');
                        $('.ju-nav-item-active').removeClass('ju-nav-item-active');
                        $('#ju-nav-' + page).addClass('ju-nav-item-active');
                    }
                });
                $("#ju-upload-picture").submit(function(event) {
                    if ($('#ju-image-name').attr('data-ju-canupload') !== 'false') {
                        $('.ju-index').button('loading');
                        var form = new FormData($('#ju-upload-picture')[0]);
                        $.ajax({
                            url: 'php/upload.php?usr=' + self.idUser,
                            type: 'POST',
                            data: form,
                            cache: false,
                            contentType: false,
                            processData: false,
                            success: function(res) {
                                var data = JSON.parse(res);
                                for (var i in data) {
                                    $('#ju-container-new-picture').append('<div class="ju-new-img"><img class="img-thumbnail" src="' + encodeURIComponent(data[i].link) + '" alt="picture"/></div>');
                                }
                                $('.ju-index').button('reset');
                                setTimeout(function() {
                                    $('.ju-index').attr('disabled', 'disabled');
                                }, 50);
                                $('#ju-all-picture *').remove();
                                self.getImagesUser();
                                $('#ju-image-name').html('Seleecione una im&aacute;gen por favor').attr('data-ju-canupload', 'false');
                            }
                        });
                    }
                    event.preventDefault();
                });
                $("#image").change(function() {
                    $('#ju-image-name').html('');
                    var totalSelected = this.files.length;
                    var endMessage = '';
                    if (totalSelected <= 1) {
                        endMessage = 'im&aacute;gen';
                    } else {
                        endMessage = 'im&aacute;genes';
                    }
                    $('#ju-image-name').append('<div>Has seleccionado ' + totalSelected + ' ' + endMessage + '</div>');
                    for (var i = 0; i < this.files.length; i++) {
                        $('#ju-image-name').append('<div>' + this.files[i].name + '</div>');
                    }
                    if (totalSelected > 0) {
                        $('#ju-upload-picture button').removeAttr('disabled');
                        $('#ju-image-name').attr('data-ju-canupload', 'true');
                    } else {
                        $('#ju-upload-picture button').attr('disabled', 'disabled');
                        $('#ju-image-name').attr('data-ju-canupload', 'false');
                    }
                });
                $('#ju-add-pictures').click(function() {
                    $('#ju-all-picture, #ju-add-pictures').addClass('ju-display-none');
                    $('#ju-add-picture, #ju-cancel-add').removeClass('ju-display-none');
                });
                $('#ju-cancel-add').click(function() {
                    $('#ju-add-picture, #ju-cancel-add').addClass('ju-display-none');
                    $('#ju-all-picture, #ju-add-pictures').removeClass('ju-display-none');
                });
                $('#ju-all-picture').on('click', '.ju-img-item-data', function() {
                    var idPicture = $(this).attr('data-ju-id-picture');
                    if ($('[data-ju-add-description="' + idPicture + '"]').hasClass('ju-display-none')) {
                        $('[data-ju-add-description="' + idPicture + '"]').removeClass('ju-display-none');
                    } else {
                        $('[data-ju-add-description="' + idPicture + '"]').addClass('ju-display-none');
                    }
                });
                $('#ju-all-picture').on('click', '.ju-button-save-description', function() {
                    var idPicture = $(this).attr('data-ju-id-picture-add-description');
                    var description = $('[data-ju-add-description="' + idPicture + '"]').find('input').val();
                    if (description !== '') {
                        var url = "php/functions.php?function=addDescription&id=" + idPicture + "&description=" + description;
                        $.getJSON(url, function(data) {
                            $('[data-ju-id-picture="' + idPicture + '"]').trigger('click');
                            $('[data-ju-add-description="' + idPicture + '"]').find('input').val('');
                            $('[data-ju-container-description="' + idPicture + '"]').text(description);
                            $('[data-ju-alert="' + idPicture + '"]').removeClass('ju-display-none');
                            setTimeout(function() {
                                $('[data-ju-alert="' + idPicture + '"]').addClass('ju-display-none');
                            }, 5000);
                        });
                    } else {
                        console.log('pleae enter text');
                    }
                });
                $('#ju-all-picture').on('click', '.ju-img-item-remove', function() {
                    var idPicture = $(this).attr('data-ju-id-picture-remove');
                    var url = "php/functions.php?function=deleteImage&id=" + idPicture;
                    var cotainer = $(this).parent().parent();
                    $.getJSON(url, function(data) {
                        cotainer.remove();
                        $('#ju-all-picture').append('<div class="alert alert-danger">A&uacute;n no tienes fotos</div>');
                    });
                });
                $('#ju-change-description').submit(function(e) {
                    $('#ju-change-description button').button('loading');
                    var username = $('#user').val();
                    username = username.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var email = $('#email').val();
                    email = email.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var city = $('#city').val();
                    city = city.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var description = $('#description').val();
                    description = description.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var iduser = self.idUser;
                    if (username !== '' && email !== '' && city !== '' && description !== '') {
                        $.ajax({
                            url: 'php/functions.php?function=editDescription',
                            type: "POST",
                            data: {
                                username: username,
                                email: email,
                                city: city,
                                description: description,
                                iduser: iduser
                            },
                            success: function(response) {
                                if (!response.error) {
                                    $('#ju-success-edit').show();
                                    setTimeout(function() {
                                        $('#ju-success-edit').hide();
                                    }, 5000);
                                } else {
                                    $('#ju-error-edit').show();
                                    setTimeout(function() {
                                        $('#ju-error-edit').hide();
                                    }, 5000);
                                }

                                $('#ju-change-description button').button('reset');
                                setTimeout(function() {
                                    $('#ju-change-description button').attr('disabled', 'disabled');
                                }, 50);
                            }
                        });
                    }
                    e.preventDefault();
                });
                $('#ju-change-password input').keydown(function() {
                    var validate = true;
                    $('#ju-change-password input').each(function() {
                        if ($(this).val() === '') {
                            validate = false;
                            return false;
                        }
                    });

                    if (validate) {
                        if ($('#ju-change-password button').attr('disabled')) {
                            $('#ju-change-password button').removeAttr('disabled');
                        }
                    }
                });

                $('#ju-change-description').keydown(function() {
                    var validate = true;
                    $('#ju-change-description input').each(function() {
                        if ($(this).val() === '') {
                            validate = false;
                            return false;
                        }
                    });

                    if (validate) {
                        if ($('#ju-change-description button').attr('disabled')) {
                            $('#ju-change-description button').removeAttr('disabled');
                        }
                    }
                });
                $('#ju-change-password').submit(function(e) {
                    $('#ju-change-password button').button('loading');
                    var actualPassword = $('#actualpassword').val();
                    actualPassword = actualPassword.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var password = $('#password').val();
                    password = password.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var repeatpassword = $('#repeatpassword').val();
                    repeatpassword = repeatpassword.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var iduser = self.idUser;
                    if ((password === repeatpassword) && actualPassword !== '' && password !== '' && repeatpassword !== '') {
                        $.ajax({
                            url: 'php/functions.php?function=changePassword',
                            type: "POST",
                            data: {
                                actualPassword: actualPassword,
                                newPassword: password,
                                iduser: iduser
                            },
                            success: function(response) {
                                var resp = JSON.parse(response);
                                if (!resp.error) {
                                    $('#actualpassword').val('');
                                    $('#password').val('');
                                    $('#repeatpassword').val('');
                                    $('#ju-success-edit-password').show();
                                    setTimeout(function() {
                                        $('#ju-success-edit-password').hide();
                                    }, 5000);
                                } else {
                                    $('#ju-error-edit-password').show();
                                    setTimeout(function() {
                                        $('#ju-error-edit-password').hide();
                                    }, 5000);
                                }
                                $('#ju-change-password button').button('reset');
                                setTimeout(function() {
                                    $('#ju-change-password button').attr('disabled', 'disabled');
                                }, 50);
                            }
                        });
                    }
                    e.preventDefault();
                });
            };
            this.activeMenu = function() {
                if (this.parameters.view === 'editprofile') {
                    var isInputTypeFileImplemented = function() {
                        var elem = document.createElement("input");
                        elem.type = "file";
                        if (elem.disabled)
                            return false;
                        try {
                            elem.value = "Test";
                            return elem.value != "Test";
                        } catch (e) {
                            return elem.type == "file";
                        }
                    };

                    if (!isInputTypeFileImplemented()) {
                        $("#ju-upload-picture [for='image']").attr('disabled', 'disabled');
                    }
                    //$('#profile').addClass('active');
                    //$('#profile a').addClass('ju-edit-active');
                }
                if (this.parameters.view === 'profile' && this.parameters.iduser === this.idUser) {
                    $('#' + this.parameters.view).addClass('active');
                } else if (this.parameters.view !== 'profile') {
                    $('#' + this.parameters.view).addClass('active');
                }
            };
            this.updateTime = function() {
                setInterval(function() {
                    $(".ju-update").each(function(index) {
                        var currentDate = $(this).attr('ju-date-info');
                        var validate = moment(currentDate).fromNow();
                        if (validate.indexOf("días") !== -1) {
                            $(this).removeClass('ju-update');
                            $(this).text(moment(currentDate).format('LLL'));
                        } else {
                            $(this).text(moment(currentDate).fromNow());
                        }
                    });
                }, 60000);
            };
            this.getImagesUser = function() {
                var url = "php/functions.php?function=getImagesUser&user=" + self.idUser;
                $.getJSON(url, function(data) {
                    if (!data.error) {
                        for (var i in data) {
                            var description = '<address>Sin descripci&oacute;n</address>';
                            if (data[i].description !== 'NULL') {
                                description = data[i].description;
                            }
                            $.addItem = $('\
                                <div class="ju-img-item">\
                                    <div class="text-center">\
                                        <img src="' + encodeURIComponent(data[i].link) + '" class="img-responsive img-thumbnail"/>\
                                    </div>\
                                    <div>\
                                        <div class="ju-container-description" data-ju-container-description="' + data[i].idimages + '">' + description + '</div>\
                                        <button data-ju-id-picture="' + data[i].idimages + '" type="button" class="ju-container-description ju-img-item-data btn btn-info">\
                                            <span class="glyphicon glyphicon-pencil"></span>\
                                        </button>\
                                        <button data-ju-id-picture-remove="' + data[i].idimages + '" type="button" class="ju-container-description ju-img-item-remove btn btn-danger">\
                                            <span class="glyphicon glyphicon-remove"></span>\
                                        </button>\
                                        <div data-ju-add-description="' + data[i].idimages + '" class="ju-display-none">\
                                            <input type="text" class="form-control" id="ju-description-' + data[i].idimages + '" placeholder="descripci&oacute;n" name="user">\
                                            <a class="btn btn-default ju-button-save-description" data-ju-id-picture-add-description="' + data[i].idimages + '">Guardar</a>\
                                        </div>\
                                        <div class="alert alert-success ju-display-none" data-ju-alert="' + data[i].idimages + '">Descripci&oacute;n actualizada correctamente</div>\
                                    </div>\
                                </div><hr>\
                            ');
                            $('#ju-all-picture').append($.addItem);
                        }
                    } else {
                        $.addItem = $('\
                            <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                Aún no tienes fotos!\
                            </div>\
                        ');
                        $('#ju-all-picture').prepend($.addItem);
                    }
                });
            };
            this.getCommentsProfile = function() {
                $('.ju-index').button('loading');
                var urlComments = "php/functions.php?function=getCommentProfile&iduser=" + this.parameters.iduser + "&page=" + this.pageProfile;
                $.getJSON(urlComments, function(resp) {
                    if (!resp.error) {
                        self.totalCommentProfile += resp.length;
                        $('#ju-total-comments').text(' ' + self.totalCommentProfile);
                        self.pageProfile++;
                        for (var i in resp) {
                            var validate = moment(resp[i].time).fromNow();
                            var date = null;
                            var updateDate = "";
                            if (validate.indexOf("días") !== -1) {
                                date = moment(resp[i].time).format('LLL');
                            } else {
                                updateDate = "ju-update";
                                date = moment(resp[i].time).fromNow();
                            }

                            $.addItem = $('\
                                        <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                        <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp[i].userpicture + ');"></div>\
                                        <div class="col-xs-9 ju-nav-profile-item-comment-text">\
                                        <div><a href="?view=profile&iduser=' + resp[i].idusercommented + '"><b>' + resp[i].username + '</b></a></div>\
                                        <div>' + resp[i].comment + '</div>\
                                        </div>\
                                        <div class="ju-date-comment ' + updateDate + '" id="ju-date-item-' + i + '" ju-date-info="' + resp[i].time + '">' + date + '</div>\
                                        </div>\
                                        ');
                            $('#ju-nav-profile-user-comments').append($.addItem);
                        }
                        self.updateTime();
                        $('.ju-index').button('reset');
                        if (resp.length < 10) {
                            $('#ju-more').hide();
                        }
                    } else {
                        $('#ju-total-comments').text(' 0');
                        $('.ju-index').button('reset');
                        $('#ju-more').hide();

                        var message = null;
                        if (self.parameters.iduser === self.idUser) {
                            message = "Aún no tienes comentarios";
                        } else {
                            var username = $('#ju-nav-details-name').text();
                            message = username + " no tienes comentarios.";
                        }
                        $.addItem = $('\
                            <div class="ju-nav-profile-item-comment bs-callout bs-callout-info" id="ju-no-comments">\
                                ' + message + '\
                            </div>\
                            ');
                        $('#ju-nav-profile-user-comments').prepend($.addItem);
                    }
                });
            };
            this.getCommentsPicture = function() {
                $('.ju-index').button('loading');
                var urlComments = "php/functions.php?function=getComments&idpicture=" + this.parameters.idpicture + "&page=" + this.pagePicture;
                $.getJSON(urlComments, function(resp) {
                    if (!resp.error) {
                        if (resp.length > 0) {
                            $('#ju-more-picture').show();
                        }
                        self.pagePicture++;
                        for (var i in resp) {
                            var validate = moment(resp[i].time).fromNow();
                            var date = null;
                            var updateDate = "";
                            if (validate.indexOf("días") !== -1) {
                                date = moment(resp[i].time).format('LLL');
                            } else {
                                updateDate = "ju-update";
                                date = moment(resp[i].time).fromNow();
                            }
                            $.addItem = $('\
                            <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                            <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp[i].userpicture + ');"></div>\
                            <div class="col-xs-3 ju-nav-profile-item-comment-text">\
                            <div><a href="?view=profile&iduser=' + resp[i].idusercommented + '"><b>' + resp[i].username + '</b></a></div>\
                            <div>' + resp[i].comment + '</div>\
                            </div>\
                            <div class="ju-date-comment ' + updateDate + '" id="ju-date-item-' + i + '" ju-date-info="' + resp[i].time + '">' + date + '</div>\
                            </div>\
                            ');
                            $('#ju-nav-profile-user-comments').prepend($.addItem);
                        }
                        self.updateTime();
                        $('.ju-index').button('reset');
                        if (resp.length < 10) {
                            $('#ju-more-picture').hide();
                        }
                    } else {
                        $('.ju-index').button('reset');
                        $('#ju-more-picture').hide();
                    }
                });
            };
            this.getNews = function() {
                var urlComments = "php/functions.php?function=getNews&page=" + this.pageNew;
                $.getJSON(urlComments, function(resp) {
                    if (!resp.error) {
                        if (resp.length > 0) {
                            $('#ju-more-news').show();
                        }
                        self.pageNew++;
                        for (var i in resp) {
                            var validate = moment(resp[i].time).fromNow();
                            var date = null;
                            var updateDate = "";
                            if (validate.indexOf("días") !== -1) {
                                date = moment(resp[i].time).format('LLL');
                            } else {
                                updateDate = "ju-update";
                                date = moment(resp[i].time).fromNow();
                            }

                            if (resp[i].type === '1') {
                                console.log('comment');
                                if (resp[i].username.id === resp[i].usernameto.id) {
                                    $.addItem = $('\
                                        <div class="bs-callout bs-callout-info">\
                                            <div class="ju-date-comment ' + updateDate + '" id="ju-date-item-' + i + '" ju-date-info="' + resp[i].time + '">' + date + '</div>\
                                            <div class="ju-new-info">\
                                                <span><a href="?view=profile&iduser=' + resp[i].username.id + '" >' + resp[i].username.username + '</a></span>\
                                                <span>ha publicado un nuevo estado</span>\
                                            </div>\
                                            <div class="ju-nav-profile-item-comment">\
                                                <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp[i].username.userpicture + ');"></div>\
                                                <div class="col-xs-9 ju-nav-profile-item-comment-text">\
                                                <div><a href="?view=profile&iduser=' + resp[i].username.id + '"><b>' + resp[i].username.username + '</b></a></div>\
                                                <div>' + resp[i].comment + '</div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        ');
                                } else {
                                    $.addItem = $('\
                                        <div class="bs-callout bs-callout-info">\
                                            <div class="ju-date-comment ' + updateDate + '" id="ju-date-item-' + i + '" ju-date-info="' + resp[i].time + '">' + date + '</div>\
                                            <div class="ju-new-info">\
                                                <span><a href="?view=profile&iduser=' + resp[i].username.id + '" >' + resp[i].username.username + '</a></span>\
                                                <span>ha comentado en el perfil de</span>\
                                                <span><a href="?view=profile&iduser=' + resp[i].usernameto.id + '" >' + resp[i].usernameto.username + '</a></span>\
                                            </div>\
                                            <div class="ju-nav-profile-item-comment">\
                                                <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp[i].username.userpicture + ');"></div>\
                                                <div class="col-xs-9 ju-nav-profile-item-comment-text">\
                                                <div><a href="?view=profile&iduser=' + resp[i].username.id + '"><b>' + resp[i].username.username + '</b></a></div>\
                                                <div>' + resp[i].comment + '</div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        ');
                                }
                                $('#ju-all-news').append($.addItem);
                            }

                            if (resp[i].type === '2') {
                                //console.log('comment on picture');
                                $.addItem = $('\
                                        <div class="bs-callout bs-callout-info">\
                                            <div class="ju-date-comment ' + updateDate + '" id="ju-date-item-' + i + '" ju-date-info="' + resp[i].time + '">' + date + '</div>\
                                            <div class="ju-new-info">\
                                                <span><a href="?view=profile&iduser=' + resp[i].username.id + '" >' + resp[i].username.username + '</a></span>\
                                                <span>ha comentado la <a href="?view=picture&idpicture=' + resp[i].picture.idimages + '&iduser=' + resp[i].picture.iduser + '">foto</a> de</span>\
                                                <span><a href="?view=profile&iduser=' + resp[i].usernameto.id + '" >' + resp[i].usernameto.username + '</a></span>\
                                            </div>\
                                            <div>\
                                                <a href="?view=picture&idpicture=' + resp[i].picture.idimages + '&iduser=' + resp[i].picture.iduser + '"><img src="' + encodeURIComponent(resp[i].picture.link) + '" class="img-responsive center-img" /></a>\
                                            </div>\
                                            <div class="ju-nav-profile-item-comment">\
                                                <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp[i].username.userpicture + ');"></div>\
                                                <div class="col-xs-9 ju-nav-profile-item-comment-text">\
                                                <div><a href="?view=profile&iduser=' + resp[i].username.id + '"><b>' + resp[i].username.username + '</b></a></div>\
                                                <div>' + resp[i].comment + '</div>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        ');
                                $('#ju-all-news').append($.addItem);
                            }

                            if (resp[i].type === '3') {
                                console.log('upload picture');
                                $.addItem = $('\
                                        <div class="bs-callout bs-callout-info">\
                                            <div class="ju-date-comment ' + updateDate + '" id="ju-date-item-' + i + '" ju-date-info="' + resp[i].time + '">' + date + '</div>\
                                            <div class="ju-new-info">\
                                                <span><a href="?view=profile&iduser=' + resp[i].username.id + '" >' + resp[i].username.username + '</a></span>\
                                                <span>ha subido una <a href="?view=picture&idpicture=' + resp[i].picture.idimages + '&iduser=' + resp[i].picture.iduser + '">foto</a></span>\
                                            </div>\
                                            <div>\
                                                <a href="?view=picture&idpicture=' + resp[i].picture.idimages + '&iduser=' + resp[i].picture.iduser + '"><img src="' + encodeURIComponent(resp[i].picture.link) + '" class="img-responsive center-img"/></a>\
                                            </div>\
                                        </div>\
                                        ');
                                $('#ju-all-news').append($.addItem);
                            }
                        }
                        self.updateTime();
                        $('.ju-index').button('reset');
                        if (resp.length < 10) {
                            $('#ju-more-news').hide();
                        }
                    } else {
                        $('.ju-index').button('reset');
                        $('#ju-more-news').hide();

                        $.addItem = $('\
                            <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                No hay noticias por mostrar\
                            </div>\
                            ');
                        $('#ju-all-news').append($.addItem);
                    }
                });
            };
            this.validationPages = function() {
                if (this.parameters.view === 'editprofile') {
                    if (this.parameters.page) {
                        $('[data-ju-page=' + this.parameters.page + ']').click();
                    } else {
                        $('[data-ju-page=details]').click();
                    }
                    self.addInfoUser();
                }

                if (this.parameters.view === 'home') {
                    this.getNews();
                }
                if (this.parameters.view === 'profile') {
                    $("#ju-comment-profile-input").focus(function() {
                        if (!$(this).hasClass('focus')) {
                            $(this).addClass('focus');
                        }
                    });
                    $("#ju-comment-profile-input").blur(function() {
                        if ($("#ju-comment-profile-input").val().length === 0) {
                            $(this).removeClass('focus');
                        }
                    });
                    if (this.parameters.iduser === this.idUser) {
                        $('#ju-edit-button-profile').show();
                        $('#ju-comment-profile-input').attr('placeholder', 'Escribe un estado...');
                    }
                    $('#ju-see-pictures').attr('href', '?view=picture&iduser=' + this.parameters.iduser);
                    var url = "php/functions.php?function=getInfo&id=" + this.parameters.iduser;
                    $.getJSON(url, function(data) {
                        $('#ju-nav-details-name').text(data[0].username);
                        $('#ju-nav-details-email').text(data[0].email);
                        $('#ju-nav-details-city').text(data[0].city);
                        $('#ju-nav-details-description').text(data[0].description);
                        $('#ju-nav-profile-user-img-and-info-image').attr('style', "background-image:url(" + data[0].userpicture + ")");
                    });
                    $('#ju-for-new-comment-profile').submit(function(e) {
                        var comment = $('#ju-comment-profile-input').val();
                        comment = comment.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                        if (comment !== '') {
                            $('#ju-new-comment-submit').button('loading');
                            $.ajax({
                                url: 'php/functions.php?function=newCommentProfile&iduser=' + self.parameters.iduser + '&iduserposted=' + self.idUser,
                                type: "POST",
                                data: {comment: comment},
                                success: function(response) {
                                    if (!response.error) {
                                        if ($('#ju-no-comments').length > 0) {
                                            $('#ju-nav-profile-user-comments .bs-callout').remove();
                                        }
                                        var resp = JSON.parse(response);
                                        var date = moment().fromNow();
                                        var newDate = moment().format();
                                        self.totalCommentProfile++;
                                        $('#ju-total-comments').text(' ' + self.totalCommentProfile);
                                        $.addItem = $('\
                                        <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                        <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp.data.userpicture + ');"></div>\
                                        <div class="col-xs-9 ju-nav-profile-item-comment-text">\
                                        <div><a href="?view=profile&iduser=' + self.idUser + '"><b>' + resp.data.username + '</b></a></div>\
                                        <div>' + comment + '</div>\
                                        </div>\
                                        <div class="ju-date-comment ju-update" id="ju-date-item-new-' + (new Date()).getTime() + ' " ju-date-info="' + newDate + '">' + date + '</div>\
                                        </div>\
                                        ');
                                        $('#ju-nav-profile-user-comments').prepend($.addItem);
                                        $('#ju-comment-profile-input').val('');
                                        $('#ju-new-comment-submit').button('reset');
                                    }
                                }
                            });
                        }
                        e.preventDefault();
                    });
                    this.getCommentsProfile();
                }

                if (this.parameters.view === 'picture') {
                    function showInput() {
                        if ($('#ju-picture-add-description:visible').length > 0) {
                            $('#ju-picture-add-description').hide();
                        } else {
                            $('#ju-picture-add-description').show();
                        }
                    }

                    function saveDescription() {
                        var description = $('#ju-input-description').val();
                        if (description !== '') {
                            var url = "php/functions.php?function=addDescription&id=" + self.parameters.idpicture + "&description=" + description;
                            $.getJSON(url, function(data) {
                                if (!data.error) {
                                    $('#ju-picture-add-description').hide();
                                    $('#ju-input-description').val('');
                                    $('#ju-picture-description div').html('');
                                    $('#ju-picture-description div').html(description);
                                    $('#ju-picture-description div').append('&nbsp;<a><span class="glyphicon glyphicon-edit"></span></a>');
                                    $('#ju-picture-description div span').click(showInput);
                                }
                            });
                        }
                    }
                    if (this.parameters.idpicture && this.parameters.iduser) {
                        var edit = false;
                        if (this.parameters.iduser === this.idUser) {
                            $('#ju-options-picture').show();
                            edit = true;
                        }

                        $(document).keydown(function(e) {
                            if (e.keyCode == 37) {
                                window.location.href = '' + $('#ju-arrow-container-left').attr('href') + '';
                                return false;
                                e.preventDefault();
                            }
                            if (e.keyCode == 39) {
                                window.location.href = '' + $('#ju-arrow-container-right').attr('href') + '';
                                return false;
                                e.preventDefault();
                            }
                        });


                        var url = "php/functions.php?function=getInfo&id=" + this.idUser;
                        $.getJSON(url, function(data) {
                            $('#ju-container-new-comment .ju-nav-profile-item-comment-picture').attr('style', "background-image:url(" + data[0].userpicture + ")");
                        });
                        var url = "php/functions.php?function=slidePictures&idpicture=" + this.parameters.idpicture + "&iduser=" + this.parameters.iduser;
                        $.getJSON(url, function(resp) {
                            if (!resp.error) {
                                $('#ju-picture-container, #ju-container-new-comment').show();
                                if (resp.pagination.next !== null) {
                                    $('#ju-arrow-container-left, #ju-arrow-container-right').show();
                                    $('#ju-arrow-container-left').attr('href', '?view=picture&idpicture=' + resp.pagination.prev + '&iduser=' + self.parameters.iduser);
                                    $('#ju-arrow-container-right').attr('href', '?view=picture&idpicture=' + resp.pagination.next + '&iduser=' + self.parameters.iduser);
                                }
                                if (resp.data[0].description !== 'NULL') {
                                    $('#ju-picture-description').show();
                                    $('#ju-picture-description div').html(resp.data[0].description);
                                    if (edit) {
                                        $('#ju-picture-description div').append('&nbsp;<a><span class="glyphicon glyphicon-edit"></span></a>');
                                        $('#ju-picture-description div span').click(showInput);
                                    }
                                } else {
                                    if (edit) {
                                        $('#ju-picture-description').show();
                                        $('#ju-picture-description div').append('<a><span>Añadir una descripci&oacute;n</span></a>');
                                        $('#ju-picture-description div span').click(showInput);
                                    }
                                }
                                $('#ju-picture-container img').attr('src', encodeURIComponent(resp.data[0].link));
                                $('.ju-button-save-description').click(saveDescription);
                            } else {
                                var message = null;
                                if (self.parameters.iduser === self.idUser) {
                                    message = "Aún no tienes fotos!";
                                } else {
                                    message = "Este usuario no tiene fotos!";
                                }
                                $.addItem = $('\
                                    <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                        ' + resp.error + '\
                                    </div>\
                                ');
                                $('#ju-nav-profile-user-comments').prepend($.addItem);
                            }
                        });
                        self.getCommentsPicture();
                        $('#ju-new-comment').submit(function(e) {
                            var comment = $('#ju-comment-input').val();
                            comment = comment.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                            if (comment !== '') {
                                $.ajax({
                                    url: 'php/functions.php?function=newComment&idpicture=' + self.parameters.idpicture + '&iduser=' + self.idUser,
                                    type: "POST",
                                    data: {comment: comment},
                                    success: function(response) {
                                        if (!response.error) {
                                            var resp = JSON.parse(response);
                                            var date = moment().fromNow();
                                            var newDate = moment().format();
                                            $.addItem = $('\
                                                <div class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                                <div class="col-xs-3 ju-nav-profile-item-comment-picture" style="background-image:url(' + resp.data.userpicture + ');"></div>\
                                                <div class="col-xs-9 ju-nav-profile-item-comment-text">\
                                                <div><a href="?view=profile&iduser=' + self.idUser + '"><b>' + resp.data.username + '</b></a></div>\
                                                <div>' + comment + '</div>\
                                                </div>\
                                                <div class="ju-date-comment ju-update" id="ju-date-item-new-' + (new Date()).getTime() + ' " ju-date-info="' + newDate + '">' + date + '</div>\
                                                </div>\
                                                ');
                                            $('#ju-nav-profile-user-comments').append($.addItem);
                                            $('#ju-comment-input').val('');
                                        }
                                    }
                                });
                            }
                            e.preventDefault();
                        });
                        $('#ju-delete-picture').click(function() {
                            var url = "php/functions.php?function=deleteImage&id=" + self.parameters.idpicture;
                            $.getJSON(url, function(data) {
                                if (!data.error) {
                                    window.location.href = '?view=picture&iduser=' + self.parameters.iduser;
                                }
                                $('#ju-all-picture').append('<div class="alert alert-danger">A&uacute;n no tienes fotos</div>');
                            });
                        });
                        $('#ju-set-default-image').click(function() {
                            var url = "php/functions.php?function=setPictureProfile&idpicture=" + self.parameters.idpicture + "&id=" + self.idUser;
                            $.getJSON(url, function(data) {
                                if (!data.error) {
                                    window.location.href = '?view=picture&iduser=' + self.parameters.iduser + '&idpicture=' + self.parameters.idpicture;
                                }
                            });
                        });
                    } else {
                        if (this.parameters.iduser) {
                            $('#ju-all-picture-user').show();
                            var url = "php/functions.php?function=getImagesUser&user=" + this.parameters.iduser;
                            $.getJSON(url, function(data) {
                                if (!data.error) {
                                    for (var i in data) {
                                        $.addItem = $('\
                                        <div class="col-md-3 col-sm-4 col-xs-6 ju-container-item-image-user">\
                                            <a href="?view=picture&iduser=' + self.parameters.iduser + '&idpicture=' + data[i].idimages + '">\
                                                <div class="ju-picture-user" style="background-image:url(' + encodeURIComponent(data[i].link) + ')"></div>\
                                            </a>\
                                        </div>\
                                        ');
                                        $('#ju-all-picture-user').append($.addItem);
                                    }
                                    $('#ju-all-picture-user .fh').show();
                                } else {
                                    var message = null;
                                    if (self.parameters.iduser === self.idUser) {
                                        message = "Aún no tienes fotos!";
                                    } else {
                                        message = "Este usuario no tiene fotos!";
                                    }
                                    $.addItem = $('\
                                        <div id="ju-no-pictures" class="ju-nav-profile-item-comment bs-callout bs-callout-info">\
                                            ' + message + ' <a href="?view=editprofile&page=picture" class="btn btn-default pull-right"><span class="glyphicon glyphicon-plus"></span></a>\
                                        </div>\
                                    ');
                                    $('#ju-nav-profile-user-comments').prepend($.addItem);
                                }
                            });
                        }
                    }
                }
            };
            this.init = function() {
                moment.lang("es");
                if (this.parameters.view === undefined) {
                    this.parameters = {
                        view: 'home'
                    };
                }

                if (this.parameters.view === 'profile') {
                    if (!this.parameters.iduser) {
                        window.location.href = '?view=home';
                    }
                }
                this.checkCookie();
                this.activeMenu();
            };
            this.login = function(usernameregister, passwordregister) {
                $('.shake').removeClass('shake');
                $('.ju-index').button('loading');
                var username = null;
                var password = null;

                if (usernameregister && passwordregister) {
                    username = usernameregister;
                    password = passwordregister;
                } else {
                    username = $("#name").val();
                    password = $("#password").val();
                }

                if (username !== null && password !== null) {
                    var url = "php/functions.php?function=login&username=" + username + "&password=" + password;
                    $.getJSON(url, function(data) {
                        if (data.error) {
                            $('#form-signin').addClass('shake');
                        } else {
                            var logged = Array(username, data[0].id);
                            self.setCookie("logged", logged, 365);
                            window.location.href = "?view=home";
                        }
                        $('.ju-index').button('reset');
                    });
                }

            };
            this.getCookie = function(c_name) {
                var i, x, y, ARRcookies = document.cookie.split(";");
                for (i = 0; i < ARRcookies.length; i++) {
                    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                    y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                    x = x.replace(/^\s+|\s+$/g, "");
                    if (x == c_name) {
                        return unescape(y);
                    }
                }
            };
            this.setCookie = function(c_name, value, exdays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + exdays);
                var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
                document.cookie = c_name + "=" + c_value;
            };
            this.checkCookie = function() {
                var logged = this.getCookie('logged');
                if (!logged) {
                    if (this.parameters.view === 'register') {
                        this.loadPage(this.parameters.view, function() {
                            $('#form-register').submit(function(event) {
                                $('.ju-index').button('loading');
                                var username = $('#user').val();
                                username = username.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                                var email = $('#email').val();
                                email = email.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                                var city = $('#city').val();
                                city = city.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                                var description = $('#description').val();
                                description = description.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                                var password = $('#password').val();
                                password = password.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                                var repeatpassword = $('#repeatpassword').val();
                                repeatpassword = repeatpassword.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');

                                if ((password === repeatpassword) && username !== '' && email !== '' && city !== '' && description !== '') {
                                    $.ajax({
                                        url: 'php/functions.php?function=createUser',
                                        type: "POST",
                                        data: {
                                            username: username,
                                            email: email,
                                            city: city,
                                            description: description,
                                            password: password
                                        },
                                        success: function(response) {
                                            var resp = JSON.parse(response);
                                            if (!resp.error) {
                                                self.login(username, password);
                                            } else {
                                                $('.modal-body').html(resp.error);
                                                $('#myModal').modal();
                                                $('.ju-index').button('reset');
                                            }
                                        }
                                    });
                                } else {
                                    $('.ju-index').button('reset');
                                    var message = '';
                                    if ((password !== repeatpassword)) {
                                        message = 'Las contrase&ntilde;as no coinciden';
                                    } else if (username !== '' && email !== '' && city !== '' && description !== '') {
                                        message = 'Por favor llena todos los datos';
                                    }
                                    $('.modal-body').html(message);
                                    $('#myModal').modal();
                                }
                                event.preventDefault();
                            });
                        });
                    } else if (this.parameters.view !== 'login') {
                        window.location.href = "?view=login";
                    } else {
                        this.loadPage(this.parameters.view, function() {
                            $('#form-signin').submit(function(event) {
                                self.login();
                                event.preventDefault();
                            });
                        });
                    }
                    console.log('offline');
                } else if (this.parameters.view === 'login' || this.parameters.view === 'register') {
                    window.location.href = "?view=home";
                } else if (this.parameters.view === 'close') {
                    this.clearCookie();
                    window.location.href = "?view=login";
                } else {
                    this.idUser = this.getIdUser();
                    $('#profile a').attr('href', '?view=profile&iduser=' + this.idUser);
                    this.loadPage(this.parameters.view, function() {
                        self.listeners();
                        self.validationPages();
                        $("#ju-menu, #ju-container, #ju-footer").show();
                    });
                    console.log('online');
                }
            };
            this.clearCookie = function() {
                this.setCookie('logged', '', -1);
            };
            this.getIdUser = function() {
                if (this.parameters.view !== 'login') {
                    var idUser = this.getCookie('logged').split(",");
                    return idUser[1];
                }
            };
            this.loadPage = function(page, callback) {
                $('#ju-container').load('pages/' + page + '.html', function() {
                    if (callback) {
                        callback();
                    }
                    $('.ju-tooltip').tooltip();
                });
            };
        };
        var users = new Jusers();
        users.checkInstall(function(resp) {
            if (resp.connected) {
                if (self.parameters.view === 'error') {
                    window.location.href = '?view=home';
                } else {
                    users.init();
                }
            } else {
                self.clearCookie();
                if (self.parameters.view !== 'error') {
                    window.location.href = '?view=error';
                } else {
                    self.loadPage(self.parameters.view, function() {
                        $("#ju-container").show();
                    });
                }
            }
        });
    };
})();
//encodeURIComponent('link');