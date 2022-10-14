// 自调用函数
(function () {
    let upload = document.querySelector('#upload1'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_button_select = upload.querySelector('.upload_button.select'),
        upload_button_upload = upload.querySelector('.upload_button.upload'),
        upload_tip = upload.querySelector('.upload_tip'),
        upload_list = upload.querySelector('.upload_list');

    let _file = null;

    // 上传文件到服务器
    upload_button_upload.addEventListener('click', function () {
        if (!_file) {
            alert('请先上传文件~~~');
            return;
        }
        // 把文件传递给服务器： FormData / BAE64
        // 使用FormData格式传递服务器
        let fm = new FormData();
        fm.append('file', _file);
        fm.append('filename', _file.name);
        changeDisable(true);
        // 1.单文件上传处理「FORM-DATA」:由服务器自动生成文件的名字
        // url:/upload_single
        // method:POST
        // params:multipart/form-data
        // file:文件对象
        // filename:文件名字
        // return:application/json
        // code:0成功 1失败,
        //     codeText:状态描述,
        //     originalFilename:文件原始名称,
        //     servicePath:文件服务器地址
        // 上传服务器
        instance.post('/upload_single', fm).then(data => {
            if (+data.code === 0) {
                alert(`文件已经上传成功~~,您可以基于 ${data.servicePath} 访问这个资源~~`)
                clearHandle();
                changeDisable(false);
                return;
            }
            return Promise.reject(data.codeText);
        }).catch(reason => {
            alert('文件上传失败，请您稍后再试~~');
            clearHandle();
            changeDisable(false);
        });

    })

    // 点击选择文件按钮触发上传文件的input框
    upload_button_select.addEventListener('click', function () {
        if (upload_button_select.classList.contains('disable') ||
            upload_button_upload.classList.contains('loading')) {
            return;
        }
        upload_inp.click();
    });

    // 监听文件选择事件
    upload_inp.addEventListener("change", function () {
        console.log(upload_inp.files)
        // 获取用户选择的文件
        // + name: 文件名
        // + size: 文件大小
        // + type: 文件类型
        let file = upload_inp.files[0];
        if (!file) return;

        // 限制文件上传的格式
        if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
            alert('   PNG、JPG、JPEG 格式的~~');
            return;
        }

        // 限制文件上传大小
        if (file.size > 2 * 1024 * 1024) {
            alert('上传的文件不能超过2MB~~');
            return;
        }

        _file = file;

        // 显示上传的文件
        upload_tip.style.display = 'none';
        upload_list.style.display = 'block';
        upload_list.innerHTML = `<li>
                                    <span>文件：${file.name}</span>
                                    <span><em>移除</em></span>
                                 </li>`;
    });

    // 移除按钮的点击处理
    upload_list.addEventListener("click", function (ev) {
        let target = ev.target;
        if (target.tagName === "EM") {
            clearHandle();
        }
    });

    // 移除待上传文件
    const clearHandle = () => {
        // 点击的移除按钮
        upload_tip.style.display = 'block';
        upload_list.style.display = 'none';
        upload_list.innerHTML = '';
        _file = null;
    }

    // 改变禁用状态
    const changeDisable = flag => {
        if (flag) {
            upload_button_select.classList.add('disable');
            upload_button_upload.classList.add('loading');
            return;
        }
        upload_button_select.classList.remove('disable');
        upload_button_upload.classList.remove('loading');
    }
})();