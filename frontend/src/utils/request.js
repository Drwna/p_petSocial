const BASE_URL = 'http://localhost:3001';

const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token');
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        // 根据文档，code=0 为成功
        if (res.data.code === 0) {
          resolve(res.data);
        } else {
          // 处理错误
          uni.showToast({
            title: res.data.msg || '请求失败',
            icon: 'none'
          });
          // 如果是认证失效，可能需要跳转登录
          if (res.data.code === 401) {
             uni.reLaunch({
                 url: '/pages/login/login'
             });
          }
          reject(res.data);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

export default request;
