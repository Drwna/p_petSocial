<script>
export default {
	onLaunch: function() {
		console.log('App Launch')
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
/*每个页面公共css */
page {
	background-color: #f5f5f5;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.container {
	padding: 20rpx;
}

/* 常用按钮样式 */
.btn-primary {
	background-color: #71C5DA;
	color: white;
	border-radius: 40rpx;
}

.btn-primary:active {
	opacity: 0.8;
}

/* 常用文本颜色 */
.text-primary {
	color: #71C5DA;
}
.text-gray {
	color: #999;
}
</style>
