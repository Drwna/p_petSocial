const Account = require('./Account');
const Pet = require('./Pet');
const Post = require('./Post');
const Category = require('./Category');
const Comment = require('./Comment');
const PostLike = require('./PostLike');
const Follow = require('./Follow');
const VerificationCode = require('./VerificationCode');

// 建立模型关系
// Account 与 Pet 是一对一关系
Account.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasOne(Account, { foreignKey: 'petId', sourceKey: 'id', as: 'account' });

// Post 与 Pet 是多对一关系
Post.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasMany(Post, { foreignKey: 'petId', sourceKey: 'id', as: 'posts' });

// Post 与 Category 是多对一关系
Post.belongsTo(Category, { foreignKey: 'categoryId', targetKey: 'id', as: 'category' });
Category.hasMany(Post, { foreignKey: 'categoryId', sourceKey: 'id', as: 'posts' });

// Comment 与 Post 是多对一关系
Comment.belongsTo(Post, { foreignKey: 'postId', targetKey: 'id', as: 'post' });
Post.hasMany(Comment, { foreignKey: 'postId', sourceKey: 'id', as: 'comments' });

// Comment 与 Pet 是多对一关系
Comment.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasMany(Comment, { foreignKey: 'petId', sourceKey: 'id', as: 'comments' });

// PostLike 与 Post 是多对一关系
PostLike.belongsTo(Post, { foreignKey: 'postId', targetKey: 'id', as: 'post' });
Post.hasMany(PostLike, { foreignKey: 'postId', sourceKey: 'id', as: 'likes' });

// PostLike 与 Pet 是多对一关系
PostLike.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasMany(PostLike, { foreignKey: 'petId', sourceKey: 'id', as: 'likes' });

// Follow 与 Pet 是多对多关系
Follow.belongsTo(Pet, { as: 'follower', foreignKey: 'followerPetId', targetKey: 'id' });
Follow.belongsTo(Pet, { as: 'following', foreignKey: 'followingPetId', targetKey: 'id' });

module.exports = {
  Account,
  Pet,
  Post,
  Category,
  Comment,
  PostLike,
  Follow,
  VerificationCode
};