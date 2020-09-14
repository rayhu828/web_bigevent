$(function() {
    // 1.1 获取裁剪区域的 DOM 元素
    var $image = $('#image');
    // 1.2 配置选项
    const options = {
        // 纵横比
        aspectRatio: 1/1,
        // 指定预览区域
        preview: '.img-preview'
    }
    // 1.3 创建裁剪区域
    $image.cropper(options);
    var layer = layui.layer;
    $('#btnChooseImage').on('click', function() {
        $('#file').click();
        $('#file').on('change', function(e) {
            let fileList = e.target.files;
            console.log(fileList);
            if(fileList.length === 0) {
                return layer.msg('请选择图片！');
            }
            let file = fileList[0];
            let newImgURL = URL.createObjectURL(file);
            $image.cropper('destroy').attr('src', newImgURL).cropper(options);
        });
    });
    $('#btnUpload').on('click', function() {
        let dataURL = $image.cropper('getCroppedCanvas', {
           width: 100,
           height: 100
        }).toDataURL('image/png');
        $.ajax({
            method: 'post',
            url: '/my/update/avatar',
            data: {
                avatar: dataURL
            },
            success: function(res) {
                if(res.status !== 0) {
                    return layer.msg('更换头像失败！');
                }
                layer.msg('更换头像成功！');
                window.parent.getUserInfo();
            }
        })
    })
});