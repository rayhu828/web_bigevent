$(function() {
    var form = layui.form;
    var layer = layui.layer;
    form.verify({
        pwd: function(value) {
            let reg = /^[\S]{6,12}$/;
            if(!reg.test(value)) {
                return '密码必须6到12位，且不能出现空格';
            }
        },
        samePwd: function(value) {
            let oldPwd = $('input[name="oldPwd"]').val();
            if(value === oldPwd) {
                return '新旧密码不能相同！';
            }
        },
        rePwd: function(value) {
            let newPwd = $('input[name="newPwd"]').val();
            if(value !== newPwd) {
                return '两次密码不一致！';
            }
        }
    });
    $('.layui-form').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            method: 'post',
            url: '/my/updatepwd',
            data: $(this).serialize(),
            success: function(res) {
                if(res.status !== 0) {
                    return layer.msg('更新密码失败！');
                }
                layer.msg('更新密码成功！');
                $('.layui-form')[0].reset();
            }
        });
    })
});