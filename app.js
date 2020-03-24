// 引入https
import https from './utils/https';
App({
  globalData: {
  },
  onLaunch: function () { 
	let _this=this;
	// 初始化字体
    wx.loadFontFace({
      family: 'SourceHanSansCN Medium',
      source: 'url("https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/SourceHanSansCN-Medium.ttf")',
      success(data) {
        console.log(data)
      },
      fail(error) {
        console.log(error)
      }
    })
	// 当前token失效处理
	let currentTime=Date.parse(new Date()) / 1000;
	if (currentTime>wx.getStorageSync("info").failureTime) {
		//开始登入
		https.login().then(res => {
			if (res.data.code != 200) {
				console.log('出错了')
			} else {
				console.log('token已失效,更新当前token')
				let failureTime=Date.parse(new Date()) / 1000 + 7000;             //过期时间
				res.data.result.failureTime=failureTime;
				wx.setStorageSync('info', res.data.result);  					  //个人信息
			}
		})
	} 
  }
})