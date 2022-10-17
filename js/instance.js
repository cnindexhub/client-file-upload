/* 把axios发送请求的公共信息进行提取 */
let instance = axios.create();
instance.defaults.baseURL = 'http://127.0.0.1:8888'
instance.defaults.headers['Content-Type'] = 'multipart/form-data';
instance.defaults.transformRequest = (data, headers) => {
    const contentType = headers['Content-Type'];
    if (contentType === "application/x-www-form-urlencoded") return Qs.stringify(data);
    return data;
}
instance.interceptors.request.use(request => {
    let date = new Date();
    let url = request.url;
    url = url.indexOf('&') != -1 ? url + `&no_cache=${date.getTime()}` : url + `?no_cache=${date.getTime()}`;
    request.url = url;
    return request;
}, reason => {
    // 统一异常处理
    // ...
    return Promise.reject(reason);
})
instance.interceptors.response.use(response => {
    return response.data;
}, reason => {
    // 统一异常处理
    // ...
    return Promise.reject(reason);
})

