$(function() {
    // 点击“去注册账号”的链接
    $('#link_reg').on('click', function() {
        $('.login-box').hide();
        $('.reg-box').show();
    });
    // 点击“去登录”的链接
    $('#link_login').on('click', function() {
        $('.reg-box').hide();
        $('.login-box').show();
    });
    let form = layui.form;
    let layer = layui.layer;
    form.verify({
        pwd: function(value, item) {
            let reg = /^[\S]{6,12}$/
            if(!reg.test(value)) {
                return '密码必须6到12位，且不能出现空格';
            }
        },
        repwd: function(value, item) {
            let pwd = $('.reg-box input[name="password"]').val();
            if(pwd !== value) {
                return '两次密码不一致！';
            }
        }
    });
    $('#form_reg').on('submit', function(e) {
        e.preventDefault();
        let uname = $('.reg-box input[name="username"]').val();
        let pwd = $('.reg-box input[name="password"]').val();
        let data = {username: uname, password: pwd};
        $.post('/api/reguser', data, function(res) {
            if(res.status !== 0) {
                return layer.msg(res.message);
            }
            layer.msg('注册成功，请登录！');
            $('#link_login').click();
        });
    });
    $('#form_login').on('submit', function(e) {
        e.preventDefault();
        let data = $(this).serialize();
        $.ajax({
            url: '/api/login',
            method: 'post',
            data: data,
            success: function(res) {
                if(res.status !== 0) {
                    return layer.msg(res.message);
                }
                layer.msg('登录成功！');
                localStorage.setItem('token', res.token);
                location.href = '/index.html';
            }
        });
    });
});