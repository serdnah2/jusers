(function() {
    window.onload = function() {
        var self = null;
        var Install = function() {
            self = this;
            this.setCookie = function(c_name, value, exdays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + exdays);
                var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
                document.cookie = c_name + "=" + c_value;
            };
            this.clearCookie = function() {
                this.setCookie('logged', '', -1);
            };
            this.checkInstall = function(callback) {
                var url = "../php/functions.php?function=checkInstall";
                $.getJSON(url, function(data) {
                    if (callback) {
                        callback(data);
                    }
                });
            };
            this.listeners = function() {
                $('#form-install').submit(function(e) {
                    $('.ju-index').button('loading');
                    var host = $('#host').val();
                    host = host.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var user = $('#user').val();
                    user = user.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var pass = $('#pass').val();
                    pass = pass.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    var base = $('#base').val();
                    base = base.replace(/<[^>]*>/g, '').replace(/<\/>/g, '');
                    if (base !== '' && user !== '' && base !== '') {
                        $.ajax({
                            url: '../php/data.php',
                            type: "POST",
                            data: {
                                host: host,
                                user: user,
                                pass: pass,
                                base: base
                            },
                            success: function(response) {
                                var resp = JSON.parse(response);
                                if (!resp.error) {
                                    $('#myModalLabel').html('Instalado correctamente');
                                    $('.modal-body').html(resp.success);
                                    $('#myModal').modal();
                                    $('#ju-install-container').hide();
                                    $('#ju-installed').show();
                                } else {
                                    $('.modal-body').html(resp.description);
                                    //$('#form-install').addClass('shake');
                                    $('#myModal').modal();
                                    if (resp.code == '4') {
                                        $('#ju-install-container input, #ju-install-container button').attr('disabled', 'disabled');
                                    }
                                }
                                $('.ju-index').button('reset');
                            }
                        });
                    }
                    e.preventDefault();
                });
            };
            this.init = function() {
                this.checkInstall(function(resp) {
                    $('.container').show();
                    if (resp.connected) {
                        $('#ju-installed').show();
                    } else {
                        self.clearCookie();
                        $('#ju-install-container').show();
                        self.listeners();
                        if (resp.code == '4' || resp.code == '5') {
                            $('#ju-install-container input, #ju-install-container button').attr('disabled', 'disabled');
                        }
                        if (resp.code == '2' || resp.code == '3' || resp.code == '4' || resp.code == '5' || resp.code == '6') {
                            $('.modal-body').html(resp.description);
                            $('#myModal').modal();
                        }
                    }
                });
            };
        };
        var install = new Install();
        install.init();
    };
})();