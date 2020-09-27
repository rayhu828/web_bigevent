$(function () {
    let q = {
        pagenum: 1,
        pagesize: 2,
        cate_id: '',
        state: ''
    };
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date);
        let y = dt.getFullYear();
        let m = padZero(dt.getMonth() + 1);
        let d = padZero(dt.getDate());
        let hh = padZero(dt.getHours());
        let mm = padZero(dt.getMinutes());
        let ss = padZero(dt.getSeconds());
        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
    }
    function padZero(n) {
        return n >= 10 ? n : '0' + n;
    }
    function initTable() {
        $.ajax({
            method: 'get',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！');
                }
                let htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);
                renderPage(res.total);
            }
        });
    }
    initTable();
    function initCate() {
        $.ajax({
            method: 'get',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！');
                }
                let htmlStr = template('tpl-cate', res);
                // $('select[name="cate_id"]').html(htmlStr);
                $('[name=cate_id]').html(htmlStr);
                form.render();
            }
        });
    }
    initCate();
    $('#form-search').on('submit', function (e) {
        e.preventDefault();
        let cate_id = $('[name=cate_id]').val();
        let state = $('[name=state]').val();
        q.cate_id = cate_id;
        q.state = state;
        initTable();
    });
    function renderPage(total) {
        laypage.render({
            elem: 'pageBox',
            count: total,
            limit: q.pagesize,
            curr: q.pagenum,
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            //触发jump回调的三种方式：
            //1. 点击页码的时候，会触发jump回调，first值是undefine
            //2. 切换条目的时候，会触发jump回调，first值是undefine
            //3. 只要调用了laypage.render方法，就会触发jump回调，first值为true
            jump: function (obj, first) {
                //obj.curr是最新的页码值
                q.pagenum = obj.curr;
                //obj.limit是最新的条目数
                q.pagesize = obj.limit;
                if (!first) {
                    initTable();
                }
            }
        });
    }
    $('tbody').on('click', '.btn-delete', function () {
        let id = $(this).attr('data-id');
        //获取当前页面，未完成删除操作时，删除按钮的个数
        let len = $('.btn-delete').length;
        console.log(len);
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                mehod: 'get',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！');
                    }
                    layer.msg('删除文章成功！');
                    //当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
                    //如果没有数据了，需要将页码减1，再调用initTable方法
                    if (len === 1) {
                        //len等于1，证明删除完成以后，页码上就没有数据了
                        // q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
                        if (q.pagenum > 1) {
                            q.pagenum--;
                        }
                    }
                    initTable();
                }
            });
            layer.close(index);
        });
    });
    var indexEdit = null;
    $('tbody').on('click', '.btn-edit', function () {
        indexEdit = layer.open({
            type: 1,
            area: ['100%', '100%'],
            title: '修改文章',
            content: $('#article-edit').html()
        });
        let id = $(this).attr('data-id');
        function initCate1(id) {
            $.ajax({
                method: 'get',
                url: '/my/article/cates',
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('初始化文章分类失败！');
                    }
                    let htmlStr = template('article-cate', res);
                    // $('[name=cate_id]').html(htmlStr);
                    $('select[name="cate_id"]').html(htmlStr);
                    $('select[name="cate_id"]').val(id)
                    form.render();
                }
            });
        }
        $.ajax({
            method: 'get',
            url: '/my/article/' + id,
            success: function (res) {
                if (res.status !== 0) {
                    return
                }
                form.val('article-edit', {
                    title: res.data.title,
                    content: res.data.content
                });
                initEditor();
                initCate1(res.data.cate_id);
                var $image = $('#image');
                $image.attr('src', 'http://ajax.frontend.itheima.net' + res.data.cover_img);
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
                    fd.append('Id', id);
                    fd.append('state', art_state);
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
                                url: '/my/article/edit',
                                data: fd,
                                processData: false,
                                contentType: false,
                                success: function(res) {
                                    if (res.status !== 0) {
                                        return layer.msg('修改文章失败！');
                                    }
                                    layer.msg('修改文章成功！');
                                    layer.close(indexEdit);
                                    initTable();
                                }
                            });
                        });
                });
            }
        });
    });
});