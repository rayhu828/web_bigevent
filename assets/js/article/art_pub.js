$(function () {
    var layer = layui.layer;
    var form = layui.form;
    function initCate() {
        $.ajax({
            method: 'get',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('初始化文章分类失败！');
                }
                let htmlStr = template('tpl-cate', res);
                // $('[name=cate_id]').html(htmlStr);
                $('select[name="cate_id"]').html(htmlStr);
                form.render();
            }
        });
    }
    initCate();
    initEditor();
    var $image = $('#image');
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }
    $image.cropper(options);
    $('#btnChooseImage').on('click', function () {
        $('#coverFile').click();
        $('#coverFile').on('change', function (e) {
            let fileList = e.target.files;
            if (fileList.length === 0) {
                return
            }
            let file = fileList[0];
            let newImgURL = URL.createObjectURL(file);
            $image.cropper('destroy').attr('src', newImgURL).cropper(options);
        });
    });
    let art_state = '已发布';
    $('#btnSave2').on('click', function () {
        art_state = '草稿';
    });
    $('#form-pub').on('submit', function (e) {
        e.preventDefault();
        let fd = new FormData($(this)[0]);
        fd.append('state', art_state);
        // fd.forEach(function(v,i) {
        //     console.log(v,i);
        // });
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function (blob) {       // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                fd.append('cover_img', blob);
                $.ajax({
                    method: 'post',
                    url: '/my/article/add',
                    data: fd,
                    processData: false,
                    contentType: false,
                    success: function(res) {
                        if (res.status !== 0) {
                            return layer.msg('发布文章失败！');
                        }
                        layer.msg('发布文章成功！');
                        location.href = '/article/art_list.html';
                    }
                });
            });
    });
});