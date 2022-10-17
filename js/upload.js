/* 基于FROM-DATA的文件上传 */
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

/* 基于Base64的文件上传 */
(function () {
    let upload = document.querySelector('#upload2'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_button_select = upload.querySelector('.upload_button.select');

    // 把选择的文件读取成为BASE64
    const changeBASE64 = file => {
       return new Promise(resolve => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = ev => {
                resolve(ev.target.result);
            }
        })
    }

    // 验证是否处于可操作状态
    const checkDisable = element => {
        let classList = element.classList;
        return classList.contains('loading') || classList.contains('disable');
    }

    // 点击选择文件按钮触发上传文件的input框
    upload_button_select.addEventListener('click', function () {
        if (checkDisable(this)) {
            return;
        }
        upload_inp.value = '';
        upload_inp.click();
    });

    // 监听文件选择事件
    upload_inp.addEventListener("change", async function () {
        let BASE64 = null;
        let data = null;
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

        // 3.单文件上传处理「BASE64」
        //   url:/upload_single_base64
        //         method:POST
        //         params:application/x-www-form-urlencoded
        //         file:BASE64
        //         filename:文件名字
        //         return:application/json
        //         code:0成功 1失败,
        //             codeText:状态描述,
        //             originalFilename:文件原始名称,
        //             servicePath:文件服务器地址
        upload_button_select.classList.add('loading');
        BASE64 = await changeBASE64(file);
        try {
            data = await instance.post('/upload_single_base64', {
                file: encodeURIComponent(BASE64), filename: file.name
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            if (+data.code === 0) {
                alert(`恭喜你，文件上传成功，您可以基于 ${data.servicePath} 查看~~`);
                return;
            }
            throw data.codeText;
        } catch (err) {
            alert('很遗憾文件上传失败!，请稍后再试~~');
        } finally {
            upload_button_select.classList.remove('loading');
        }
    });

})();

/* 文件缩略图 & 自动生成名字 */
(function () {
    let upload = document.querySelector('#upload3'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_button_select = upload.querySelector('.upload_button.select'),
        upload_button_upload = upload.querySelector('.upload_button.upload'),
        upload_abbre = upload.querySelector('.upload_abbre'),
        upload_abbre_img = upload_abbre.querySelector('img'),
        _file;


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

    // 根据文件内容生成HASH、filename、fileBuffer、fileSuffix
    const changeBuffer = file => {
        return new Promise(resolve =>  {
            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = ev => {
                let buffer = ev.target.result,
                    speak = new SparkMD5.ArrayBuffer(),
                    HASH,
                    suffix;
                speak.append(buffer);
                HASH = speak.end();
                suffix = /\.([a-zA-z0-9]+)$/.exec(file.name)[1];
                resolve({
                    buffer,
                    HASH,
                    suffix,
                    filename:`${HASH}.${suffix}`
                });
            }
        });
    }

    // 上传文件到服务器
    upload_button_upload.addEventListener('click', async function () {
        if (checkDisable(this)) return;
        if (!_file) {
            alert('请先上传文件~~~');
            return;
        }

        let {
            filename
        } = await changeBuffer(_file);
        // 使用FormData格式传递服务器
        let fm = new FormData();
        fm.append('file', _file);
        fm.append('filename', filename);
        changeDisable(true);
        // 2.单文件上传处理「FORM-DATA」:由客户端生成文件的名字，传递给服务器处理
        //         url:/upload_single_name
        //         method:POST
        //         params:multipart/form-data
        //         file:文件对象
        //         filename:文件名字「自己需要处理成为HASH名字」
        //   return:application/json
        //         code:0成功 1失败,
        //             codeText:状态描述,
        //             originalFilename:文件原始名称,
        //             servicePath:文件服务器地址
        // 上传服务器
        instance.post('/upload_single_name', fm).then(data => {
            if (+data.code === 0) {
                alert(`文件已经上传成功~~,您可以基于 ${data.servicePath} 访问这个资源~~`)
                return;
            }
            return Promise.reject(data.codeText);
        }).catch(reason => {
            console.log(reason)
            alert('文件上传失败，请您稍后再试~~');
        }).finally(()=> {
            changeDisable(false);
            upload_abbre.style.display = 'none';
            upload_abbre_img.src = '';
        });

    })

    // 把选择的文件读取成为BASE64
    const changeBASE64 = file => {
        return new Promise(resolve => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = ev => {
                resolve(ev.target.result);
            }
        })
    }

    // 验证是否处于可操作状态
    const checkDisable = element => {
        let classList = element.classList;
        return classList.contains('loading') || classList.contains('disable');
    }

    // 点击选择文件按钮触发上传文件的input框
    upload_button_select.addEventListener('click', function () {
        if (checkDisable(this)) {
            return;
        }
        upload_inp.value = '';
        upload_inp.click();
    });

    // 监听文件选择事件
    upload_inp.addEventListener("change", async function () {
        let BASE64 = null;
        // 获取用户选择的文件
        let file = upload_inp.files[0];
        if (!file) return;
        upload_button_select.classList.add('disable');
        BASE64 = await changeBASE64(file);
        upload_abbre.style.display = 'block';
        upload_abbre_img.src = BASE64;
        _file = file;
        upload_button_select.classList.remove('disable');
    });

})();

// 延迟函数
const delay = function delay (interval) {
    typeof interval !== "number" ? interval = 1000 : null;
    return new Promise (resolve => {
        setTimeout(() => {
            resolve();
        },interval);
    });
};

/* 进度管控 */
(function () {
    let upload = document.querySelector('#upload4'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_button_select = upload.querySelector('.upload_button.select'),
        upload_progress = upload.querySelector('.upload_progress'),
        upload_progress_value = upload_progress.querySelector('.value');

    // 验证是否处于可操作状态
    const checkDisable = element => {
        let classList = element.classList;
        return classList.contains('loading') || classList.contains('disable');
    }

    // 点击选择文件按钮触发上传文件的input框
    upload_button_select.addEventListener('click', function () {
        if (checkDisable(this)) {
            return;
        }
        upload_inp.value = '';
        upload_inp.click();
    });

    // 监听文件选择事件
    upload_inp.addEventListener("change", async function () {
        // 获取用户选择的文件
        let file = upload_inp.files[0],data;
        if (!file) return;
        upload_button_select.classList.add('loading');

        try {
            let formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name);
            data = await instance.post('/upload_single', formData, {
                // 文件上传的回调函数，xhr.upload.onprogress
                onUploadProgress(ev) {
                    let {
                        loaded,
                        total
                    } = ev;
                    upload_progress.style.display = 'block';
                    upload_progress_value.style.width = `${loaded / total * 100}%`;
                }
            });
            if (+data.code === 0) {
                upload_progress_value.style.width = '100%';
                await delay(300);
                alert(`恭喜您,文件上传成功，您可以基于 ${data.servicePath} 访问该文件~~`);
                return;
            }
            throw data.codeText;
        } catch (err) {
            console.log(err)
            alert('很抱歉，文件上传失败,请稍后再试~~');
        } finally {
            upload_button_select.classList.remove('loading');
        }
    });

})();

/* 多文件上传 */
(function () {
    let upload = document.querySelector('#upload5'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_button_select = upload.querySelector('.upload_button.select'),
        upload_button_upload = upload.querySelector('.upload_button.upload'),
        upload_list = upload.querySelector('.upload_list');

    let _files = [];


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

    upload_list.addEventListener('click', function (ev) {
        let target = ev.target,
        curLi = null,
        key;
        if (target.tagName === 'EM') {
            curLi = target.parentNode.parentNode;
            if (!curLi) return;
            upload_list.removeChild(curLi);
            key = curLi.getAttribute('key');
            _files = _files.filter(item => item.key != key);
            console.log(_files);
            if (_files.length === 0) {
                upload_list.style.display = 'none';
            }
        }
    })

    // 上传文件到服务器
    upload_button_upload.addEventListener('click', async function () {
        if (checkDisable(this)) return;
        if (_files.length === 0) {
            alert('请先选择需要上传的文件~~');
            return;
        }
        changeDisable(true);
        let upload_list_arr = Array.from(upload_list.querySelectorAll('li'));
        _files = _files.map(item => {
            let formData = new FormData(),
            curLi = upload_list_arr.find(li => li.getAttribute('key') === item.key),
            curSpan = curLi ? curLi.querySelector('span:nth-last-child(1)') : null;
            formData.append('file', item.file);
            formData.append('filename', item.filename);
            return instance.post('/upload_single', formData, {
                onUploadProgress: (ev) => {
                    if (curSpan) {
                        let {
                            loaded,
                            total
                        } = ev;
                        curSpan.innerHTML = `${(loaded / total * 100).toFixed(2)}%`;
                    }
                }
            }).then(data => {
                if (+data.code === 0) {
                    if (curSpan) {
                        curSpan.innerHTML = '100%';
                    }
                    return;
                }
                return Promise.reject();
            });
        });

        // 判断所有
        Promise.all(_files).then(() => {
            alert('恭喜您，所有文件上传成功~~');
        }).catch(() => {
            alert('很遗憾上传失败，请稍后再试~~');
        }).finally(() => {
            changeDisable(false);
            _files = [];
            upload_list.innerHTML = '';
            upload_list.style.display = 'none';
        })
    })

    // 验证是否处于可操作状态
    const checkDisable = element => {
        let classList = element.classList;
        return classList.contains('loading') || classList.contains('disable');
    }

    // 点击选择文件按钮触发上传文件的input框
    upload_button_select.addEventListener('click', function () {
        if (checkDisable(this)) {
            return;
        }
        upload_inp.value = '';
        upload_inp.click();
    });

    // 创建一个随机数加时间戳的16进制字符串
    const crateRandom = () => {
        let ran = Math.random() * new Date();
        return ran.toString(16).replace('.', '');
    }

    // 监听文件选择事件
    upload_inp.addEventListener("change", async function () {
        // 获取用户选择的文件
        _files = Array.from(upload_inp.files);
        if (_files.length === 0) return;
        // 我们重构集合的数据结构，[给每一项设置一个位置值，作为自定义属性存储到元素上，后期点击刷新按钮的时候，我们基于这个自定义属性获取唯一值，再到集合中
        // 根据这个唯一值，删除集合中的这一项

        _files = _files.map(item => {
            return {
                file: item,
                filename: item.name,
                key: crateRandom()
            };
        });

        let str = ``;
        _files.forEach((item, index) => {
            str += `<li key="${item.key}">
                        <span>文件${index + 1}：${item.filename}</span>
                        <span><em>移除</em></span>
                    </li>`;
        });
        upload_list.innerHTML = str;
        upload_list.style.display = 'block';
    });

})();

/* 拖拽上传 */
(function () {
    let upload = document.querySelector('#upload6'),
        upload_inp = upload.querySelector('.upload_inp'),
        upload_submit = upload.querySelector('.upload_submit'),
        upload_mark = upload.querySelector('.upload_mark'),
        upload_mark_span = upload_mark.querySelector('span');

    // 是否正在上传中
    let isRun = false;

    // 实现文件上传
    const uploadFile = async file => {
        if (isRun) return;
        isRun = true;
        upload_mark.style.display = 'block';
        try {
            let formData = new FormData(),
                data;
            formData.append('file', file);
            formData.append('filename', file.name);
            data = await instance.post('/upload_single', formData, {
                onUploadProgress: ev => {
                    let {
                        loaded,
                        total
                    } = ev;
                   upload_mark_span.innerHTML = ((loaded / total * 100).toFixed()) + "%"
                }
            });
            if (+data.code === 0) {
                upload_mark_span.innerHTML = '100%';
                await delay(300);
                alert(`恭喜你，文件上传成功，您可以基于 ${data.servicePath} 访问该文件~~`);
                return;
            }
            throw data.codeText;
        } catch (err) {
            alert('很遗憾，文件上传失败，请您稍后再试~~');
        } finally {
            upload_mark.style.display = 'none';
            upload_mark_span.innerHTML = '';
            isRun = false;
        }
    }

    // 拖拽获取 dragenter dragleave dragover drop

    upload.addEventListener('dragenter', function () {
        console.log('进入');
    })
    upload.addEventListener('dragleave', function () {
        console.log('离开');
    })
    upload.addEventListener('dragover', function (ev) {
        ev.preventDefault();
        console.log('区域内移动');
    })
    upload.addEventListener('drop', function (ev) {
        ev.preventDefault();
        let file = ev.dataTransfer.files[0];
        if (!file) return;
        uploadFile(file);
        console.log('放置到容器中');
    })



    upload_inp.addEventListener('change', function () {
        let file = upload_inp.files[0];
        if (!file) return;
        uploadFile(file)
    })

    upload_submit.addEventListener('click', function () {
        upload_inp.click();
    });

})();