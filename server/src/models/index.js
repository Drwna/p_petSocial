const Account = require('./Account');
const Pet = require('./Pet');
const Post = require('./Post');
const Category = require('./Category');
const Comment = require('./Comment');
const PostLike = require('./PostLike');
const Follow = require('./Follow');
const VerificationCode = require('./VerificationCode');
const Topic = require('./Topic');
const PostTopic = require('./PostTopic');
const Bookmark = require('./Bookmark');
const BlockPet = require('./BlockPet');
const PostDislike = require('./PostDislike');
const PointLog = require('./PointLog');

// 建立模型关系
// Account 与 Pet 是一对一关系
Account.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasOne(Account, { foreignKey: 'petId', sourceKey: 'id', as: 'account' });

// Account 与 PointLog 是一对多关系
Account.hasMany(PointLog, { foreignKey: 'accountId', as: 'pointLogs' });
PointLog.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// Post 与 Pet 是多对一关系
Post.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasMany(Post, { foreignKey: 'petId', sourceKey: 'id', as: 'posts' });

// Post 与 Category 是多对一关系
Post.belongsTo(Category, { foreignKey: 'categoryId', targetKey: 'id', as: 'category' });
Category.hasMany(Post, { foreignKey: 'categoryId', sourceKey: 'id', as: 'posts' });

// Post 与 Topic 是多对多关系
Post.belongsToMany(Topic, { through: PostTopic, foreignKey: 'postId', otherKey: 'topicId', as: 'topics' });
Topic.belongsToMany(Post, { through: PostTopic, foreignKey: 'topicId', otherKey: 'postId', as: 'posts' });
PostTopic.belongsTo(Topic, { foreignKey: 'topicId' });
PostTopic.belongsTo(Post, { foreignKey: 'postId' });

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

// Bookmark 与 Pet 和 Post 的关系
Bookmark.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasMany(Bookmark, { foreignKey: 'petId', sourceKey: 'id', as: 'bookmarks' });

Bookmark.belongsTo(Post, { foreignKey: 'postId', targetKey: 'id', as: 'post' });
Post.hasMany(Bookmark, { foreignKey: 'postId', sourceKey: 'id', as: 'bookmarks' });

// BlockPet 与 Pet 的关系
BlockPet.belongsTo(Pet, { as: 'blocker', foreignKey: 'blockerPetId', targetKey: 'id' });
BlockPet.belongsTo(Pet, { as: 'blocked', foreignKey: 'blockedPetId', targetKey: 'id' });

// PostDislike 与 Pet 和 Post 的关系
PostDislike.belongsTo(Pet, { foreignKey: 'petId', targetKey: 'id', as: 'pet' });
Pet.hasMany(PostDislike, { foreignKey: 'petId', sourceKey: 'id', as: 'dislikes' });

PostDislike.belongsTo(Post, { foreignKey: 'postId', targetKey: 'id', as: 'post' });
Post.hasMany(PostDislike, { foreignKey: 'postId', sourceKey: 'id', as: 'dislikes' });

module.exports = {
  Account,
  Pet,
  Post,
  Category,
  Comment,
  PostLike,
  Follow,
  VerificationCode,
  Topic,
  PostTopic,
  Bookmark,
  BlockPet,
  PostDislike,
  PointLog
};