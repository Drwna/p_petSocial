import request from '@/utils/request';

// const BASE_URL = 'http://localhost:3001';
// const BASE_URL = 'http://192.168.1.3:3001';
// const BASE_URL = 'http://120.26.217.88';
const BASE_URL = 'https://cwsj.funnyup.top';

// 账号相关
export const sendCaptcha = (data) => {
  return request({
    url: '/api/account/send-code',
    method: 'POST',
    data
  });
};

export const register = (data) => {
  return request({
    url: '/api/account/register',
    method: 'POST',
    data
  });
};

export const login = (data) => {
  return request({
    url: '/api/account/login-code',
    method: 'POST',
    data
  });
};

export const getCurrentUser = () => {
  return request({
    url: '/api/account/current',
    method: 'GET'
  });
};

export const updatePetInfo = (data) => {
  return request({
    url: '/api/pet/update',
    method: 'POST',
    data
  });
};

// 宠物主页
export const getPetProfile = (petId) => {
  return request({
    url: '/api/pet/profile',
    method: 'GET',
    data: { petId }
  });
};

export const getPetProfileById = (petId) => {
  return request({
    url: `/api/pet/profile/${petId}`,
    method: 'GET'
  });
};

export const getPetPosts = (data) => {
  return request({
    url: '/api/pet/posts',
    method: 'GET',
    data
  });
};

export const getPetPostsById = (petId, data = {}) => {
  return request({
    url: `/api/pet/${petId}/posts`,
    method: 'GET',
    data
  });
};

// 帖子相关
export const createPost = (data) => {
  return request({
    url: '/api/post/create',
    method: 'POST',
    data
  });
};

export const deletePost = (postId) => {
  return request({
    url: '/api/post/delete',
    method: 'POST',
    data: { postId }
  });
};

export const getPostList = (data) => {
  return request({
    url: '/api/post/list',
    method: 'GET',
    data
  });
};

export const getPostDetail = (postId) => {
  return request({
    url: `/api/post/${postId}`,
    method: 'GET'
  });
};

// 分类
export const getCategories = () => {
  return request({
    url: '/api/category/list',
    method: 'GET'
  });
};

// 互动
export const likePost = (postId) => {
  return request({
    url: '/api/post/like',
    method: 'POST',
    data: { postId }
  });
};

export const createComment = (data) => {
  return request({
    url: '/api/comment/create',
    method: 'POST',
    data
  });
};

export const deleteComment = (commentId) => {
  return request({
    url: '/api/comment/delete',
    method: 'POST',
    data: { commentId }
  });
};

export const getCommentList = (data) => {
  if (typeof data !== 'object') {
    data = { postId: data };
  }
  return request({
    url: '/api/comment/list',
    method: 'GET',
    data
  });
};

// 关注
export const followPet = (petId) => {
  return request({
    url: '/api/follow/add',
    method: 'POST',
    data: { petId }
  });
};

export const unfollowPet = (petId) => {
  return request({
    url: '/api/follow/remove',
    method: 'POST',
    data: { petId }
  });
};

export const getFollowingList = (data) => {
  return request({
    url: '/api/follow/following',
    method: 'GET',
    data
  });
};

export const getFansList = (data) => {
  return request({
    url: '/api/follow/fans',
    method: 'GET',
    data
  });
};

export const getFollowStatus = (petId) => {
  return request({
    url: '/api/follow/status',
    method: 'GET',
    data: { petId }
  });
};

// 上传图片 (方案一：独立上传接口)
export const uploadImages = (filePaths) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');

    // 使用 Promise.all 并发上传每一张图片
    const uploadTasks = filePaths.map(filePath => {
      return new Promise((res, rej) => {
        uni.uploadFile({
          url: BASE_URL + '/api/upload/single',
          filePath: filePath,
          name: 'image', // 后端接收的字段名
          header: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          success: (uploadFileRes) => {
            if (uploadFileRes.statusCode === 200) {
              try {
                const data = JSON.parse(uploadFileRes.data);
                console.log('fuck --->上传成功', data);
                // 确保返回结构符合预期 { code: 0, data: { urls: [...] } }
                if (data.code === 0 && data.data && data.data.url) {
                  res(data.data.url);
                } else {
                  rej(data.msg || '上传失败');
                }
              } catch (e) {
                rej('解析失败');
              }
            } else {
              rej('上传网络错误');
            }
          },
          fail: (err) => {
            rej('上传请求失败');
          }
        });
      });
    });

    Promise.all(uploadTasks)
      .then(urls => resolve(urls))
      .catch(err => reject(err));
  });
};
