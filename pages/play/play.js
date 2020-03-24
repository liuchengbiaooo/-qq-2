// pages/play/play.js
const App = getApp();
// 引入https
import https from '../../utils/https';
// 引入im
import TIM from '../../utils/tim-wx.js'; // 微信小程序环境请取消本行注释，并注释掉 import TIM from 'tim-js-sdk';
// import COS from "../../utils/cos-wx-sdk-v5.js";
// 创建 SDK 实例，TIM.create() 方法对于同一个 SDKAppID 只会返回同一份实例
let options = {
	SDKAppID: 1400304954 // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
};
// 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
let tim = TIM.create(options); // SDK 实例通常用 tim 表示
// 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
tim.setLogLevel(4); // 普通级别，日志量较多，接入时建议使用
// tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用
// 注册 COS SDK 插件
// tim.registerPlugin({
//   'cos-wx-sdk': COS
// });
var timerTime = null, //全局时间定时器
	groupTip = null, //群提示定时器    
	liveTime = null, //直播的时间 
	tipTime = null, //置顶数据
	checkTime = null, //当前时间与服务器的差别
	audioTime = null, //音频定时器
	leaveTime = null, //关闭定时器
	hotTime = null, //当前时间与服务器的差别
	systemVote = true, //防止系统提示消息重复
	doommList = [], //弹幕文件
	i = 0; //记录弹幕id

// 弹幕参数
class Doomm {
	constructor(text, icon, top, time, color) { //内容，顶部距离，运行时间，颜色（参数可自定义增加）
		this.text = text;
		this.icon = icon;
		this.top = top;
		this.time = time;
		this.color = color;
		this.display = true;
		this.id = i++;
	}
}

// 弹幕字体颜色
function getRandomColor() {
	let rgb = []
	for (let i = 0; i < 3; ++i) {
		let color = Math.floor(Math.random() * 256).toString(16)
		color = color.length == 1 ? '0' + color : color
		rgb.push(color)
	}
	return '#' + rgb.join('')
}

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		item: null, //直播间参数
		renderDom: null, //当前被@的人的资料信息
		info: null, //用户信息
		navHeight: null, //导航栏高度
		setBottom: 20, //底部输入框位置
		content: null, //输入框内容
		scrollTop: 0, //滚动到底部
		atscrollTop: null, //有人@你的时候记录
		systemShow: false, //进入聊天室的消息
		huatiShow: true, //话题框打开隐藏
		lianmaiShow: false, //连麦
		zhuanfaShow: false, //转发
		diangeShow: false, //点歌
		toupiaoShow: false, //投票
		jingcaiShow: false, //竞猜
		dzShow: false, //点赞
		dgShow: false, //点歌按钮
		tpShow: false, //投票按钮
		jcShow: false, //竞猜按钮
		dgData: null, //点歌信息
		tpData: null, //投票信息
		jcData: null, //竞猜信息
		systemName: null, //进入直播间的人
		personalboxShow: null, //控制打开隐藏长按头像事件
		focus: false, //控制键盘事件
		atShow: false, //打开@的功能
		bgShow: false, //最外层背景
		contentArr: [{
			nick: "有一小助手",
			title: "小助手",
			text: '积极配合国家净网行动,为广大网友营造健康,正能量的网络环境.有一官方严厉禁止一切涉黑涉恶,低俗色情等内容,请广大用户遵守平台相关规则,和我们一起创造和谐文明的网络环境.',
			avatar: 'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/default-head/5.jpg',
			color: "#DABC55",
			isTitle: true,
			usId: '0'
		}],
		onlineNum:0, //在线人数
		followShow: false, //关注信息
		song_card: 0, //点歌卡
		end_time: null, //活动时间戳
		newTime: '00:00:00', //时间
		topic: '今日不限话题,大家敞开聊!', //话题
		SquareNum: null, //正方
		ConsideNum: null, //反方
		squareText: '支持蓝方',
		fanfangText: '支持红方',
		muted: false, //是否静音播放
		tipShow: false, //公告栏
		tipItem: null, //置顶栏
		sliderValue: 0, //控制进度条slider的值，
		updateState: false, //防止视频播放过程中导致的拖拽失效
		audiobarShow: false, //音频进度条
		anchorArr: [], //主持人信息
		onlineHot: 0, //在线人数
		leaveShow: false, //主持人离开
		leaveNewTime: '', //5分钟倒计时
		videoShow: true, //视频流
		endBoxShow: false, //关闭直播间的出现
		endboxbottomShow: true, //底下的关闭按钮
		actShow: true, //是否选中
		rankArr: [], //热度榜单
		homeBack: false, //返回首页
		liveShow: true, //关闭直播间
		switchShow: false, //开启发弹幕
		placeholderText: "说点什么吧~",
		doommData: [], //弹幕数据
		isTimeout:true,//是否要执行6秒提示
		liwuShow:false,//控制礼物盒子
		liwuTxtArr:[  //礼物文字
			{
				id:1,
				text:"普通"
			},
			{
				id:2,
				text:"专属"
			},
			{
				id:3,
				text:"活动"
			},
			{
				id:4,
				text:"道具卡"
			},
		],
		liwuIndex:0,//默认选项
		liwuArr:[
			{
				id:1,
				name:"火箭",
				jinbi:'10金币',
				url:"https://gfs-op.douyucdn.cn/dygift/2018/11/27/7f04ea16a4509fb8a2f10acb8fb7d000.gif?x-oss-process=image/format,webp/quality,q_70",
				type:'big'
			},
			{
				id:2,
				name:"超级火箭",
				jinbi:'10金币',
				url:"https://gfs-op.douyucdn.cn/dygift/2018/11/27/3adbb0c17d9886c1440d55c9711f4c79.gif?x-oss-process=image/format,webp/quality,q_70",
				type:'big'
			},
			{
				id:3,
				name:"飞机",
				jinbi:'10金币',
				url:"https://gfs-op.douyucdn.cn/dygift/2018/11/27/cbfa61d6ed66d35d80841223c717d373.gif?x-oss-process=image/format,webp/quality,q_70",
				type:'big'
			},
			{
				id:4,
				name:"魔法球",
				jinbi:'10金币',
				url:"https://gfs-op.douyucdn.cn/dygift/2019/11/05/eecc4e848ce940d9b497e2e4297ed268.gif?x-oss-process=image/format,webp/quality,q_70",
				type:'big'
			},
			{
				id:5,
				name:"MVP",
				jinbi:'10金币',
				url:"https://gfs-op.douyucdn.cn/dygift/2018/12/19/bed1e69a9866ce1efe41d1e6f9cf768b.gif?x-oss-process=image/format,webp/quality,q_70",
				type:'small'
			},
			{
				id:6,
				name:"口罩",
				jinbi:'10金币',
				url:"https://gfs-op.douyucdn.cn/dygift/2020/02/10/da08ff2af461ecbaa6fc60368d5d2010.gif?x-oss-process=image/format,webp/quality,q_70",
				type:'small'
			}
		],
		// 礼物类型
		liwuType:false,
		// 送给谁
		optionArr:[],
		//控制选择送给谁
		liwuIcon:-1,
		//礼物发送开关
		isLiwuSendout:false,
		numberOptionArr:[
			{
				number:9999,
				text:'长长久久'
			},
			{
				number:1314,
				text:'一生一世'
			},
			{
				number:66,
				text:'六六大顺'
			},
			{
				number:10,
				text:'十全十美'
			},
			{
				number:1,
				text:'一心一意'
			}
		],
		// 默认送礼个数
		numberOption:1,
		// 默认不打开选择送礼个数
		isNumberOption:false,
		// 礼物
		playliwuViewShow:false,
		// 礼物内容
		playliwuViewItem:null
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {		
		var that = this;
		var room_id = options.room_id;
		// wx.showLoading({
		// 	title:"连接电台中"
		// })
		// setTimeout(function(){
		// 	if(that.data.isTimeout){
		// 		wx.hideLoading()
		// 		that.systemJoinChat('此电台暂时不能收听哦');	
		// 	}else{
		// 		return
		// 	}
		// },6000)
		that.setData({
			navHeight: App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight
		})
		if (liveTime) { //当前有该定时器先关闭
			clearInterval(liveTime)
		}
		if (room_id) {
			let pages = getCurrentPages();
			let currPage = null;
			if (pages.length) {
				currPage = pages[pages.length - 2];
			}
			//获取当前页面的前一页面的路由
			if (currPage.route == 'pages/datapage/datapage' || currPage.route == 'pages/footprint/footprint' || currPage.route ==
				'pages/search/search') {
				console.log('是从datapage页面进入的')
				that.setData({
					homeBack: true
				})
			}
			// 获取栏目信息
			that.getColumn(room_id)
			// 音频进度条
			that.audiobtn()
			// 开始获取直播间当前的状态
			that.getRoom(room_id)
			// 用户信息
			if (wx.getStorageSync('info')) {
				that.setData({
					info: wx.getStorageSync('info')
				})
				// 添加历史记录
				that.history(room_id)
			}
			// 监听事件，如：
			tim.on(TIM.EVENT.SDK_READY, function(event) {
				// 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
				// event.name - TIM.EVENT.SDK_READY
				console.log('1', event)
				if (event.name = 'sdkStateReady') {
					// 判断性别
					let gender = null;
					if (wx.getStorageSync('info')) {
						if (wx.getStorageSync('info').gender == 1) {
							gender = TIM.TYPES.GENDER_MALE;
						} else if (wx.getStorageSync('info').gender == 2) {
							gender = TIM.TYPES.GENDER_FEMALE;
						} else {
							gender = TIM.TYPES.GENDER_UNKNOWN;
						}
						// 更新你的个人资料
						let promise = tim.updateMyProfile({
							nick: wx.getStorageSync('info').nickname, //昵称
							avatar: wx.getStorageSync('info').headurl, //头像
							gender: gender, //性别
							selfSignature: '', //个性签名
							allowType: TIM.TYPES.ALLOW_TYPE_ALLOW_ANY
						});
						promise.then(function(imResponse) {
							// console.log('更新个人信息成功', imResponse.data); //更新资料成功
						}).catch(function(imError) {
							console.warn('updateMyProfile error:', imError); //更新资料失败的相关信息
						});
					} else {
						let promise = tim.updateMyProfile({
							nick: '', //昵称
							avatar: 'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/default-head/' + Math.floor(
								Math.random() * 4 + 1) + '.jpg', //头像
							gender: TIM.TYPES.GENDER_UNKNOWN, //性别
							selfSignature: '', //个性签名
							allowType: TIM.TYPES.ALLOW_TYPE_ALLOW_ANY
						});
						promise.then(function(imResponse) {
							// console.log('更新个人信息成功', imResponse.data); // 更新资料成功
						}).catch(function(imError) {
							console.warn('updateMyProfile error:', imError); // 更新资料失败的相关信息
						});
					}
				}
			});

			tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event) {
				// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
				// event.name - TIM.EVENT.MESSAGE_RECEIVED
				// event.data - 存储 Message 对象的数组 - [Message]
				console.log('2', event)
				for (let i = 0; i < event.data.length; i++) {
					// 系统消息
					if (event.data[i].conversationType == "@TIM#SYSTEM") { //系统
						console.log('获取到的系统消息', event.data[i])
						// 解析群消息提示
						// that.decodeGroup(event.data[i].payload)
					} else if (event.data[i].conversationType == "GROUP") { //群发
						console.log('获取到的群消息', event.data[i].payload)
						// 解析群消息提示
						that.decodeGroup(event.data[i].payload)
						// 事件处理
						if (event.data[i].payload.text) { //解析文本
							// console.log('解析成功的文本数据', event.data[i].payload)
							if (event.data[i].from == 'administrator') {
								// console.log('超级管理员数据', JSON.parse(event.data[i].payload.text))
								var adminData = JSON.parse(event.data[i].payload.text);
								if (adminData.type == 'robot') { //处理机器人数据
									if (adminData.data == '') { //当数据为空的时候是入群消息
										that.addTip(adminData.nickname) //执行群提示
										that.setData({
											onlineNum: that.data.onlineNum * 1 + 1
										})
										return false;
									} else {
										event.data[i].nick = adminData.nickname //机器人的昵称
										event.data[i].avatar = adminData.headimg //机器人的头像
										var renderDom = that.decodeText(event.data[i].payload, true); //渲染机器的文本消息
									}
								} else if (adminData.type == "leave") { //直播间关闭
									if (leaveTime) {
										clearInterval(leaveTime); //有当前的定时器关闭
									}
									if (liveTime) { //有该定时器先关闭
										clearInterval(liveTime)
									}
									var time = 0,
										leaveNewTime = 300;
									leaveTime = setInterval(function() { //开启定时器
										time++
										if (time >= 300) {
											that.getRank() //获取榜单
											that.setData({
												leaveShow: false,
												endBoxShow: true
											})
											let promise = tim.logout();
											promise.then(function(imResponse) {
												console.log(imResponse.data); // 登出成功
											}).catch(function(imError) {
												console.warn('logout error:', imError);
											});
											clearInterval(leaveTime)
										} else {
											leaveNewTime--
											that.setData({
												liveShow: false, //直播间关闭
												leaveShow: true,
												videoShow: false, //视频流
												dgShow: false, //点歌按钮
												tpShow: false, //投票按钮
												jcShow: false, //竞猜按钮
												leaveNewTime: leaveNewTime //时间
											})
										}
									}, 1000)
									return false;
								}
							} else {
								var renderDom = that.decodeText(event.data[i].payload, false); //收到信息的文本消息
							}
							renderDom[0].name = 'text', //收到消息的类型
								renderDom[0].nick = event.data[i].nick ? event.data[i].nick : event.data[i].from; //收到信息的昵称 没有取id
							renderDom[0].avatar = event.data[i].avatar ? event.data[i].avatar :
								'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/default-head/' + Math.floor(Math.random() *
									4 + 1) + '.jpg'; //收到信息的头像 没有取默认
							renderDom[0].usId = event.data[i].from; //收到信息的id
							renderDom[0].color = '#C7C7C7'; //收到信息人的文本颜色
							for (var i = 0; i < that.data.item.anchor.list.length; i++) {
								if (that.data.item.anchor.list[i].id == event.data[i].from) { //判断收到信息的是不是主持人
									renderDom[0].title = '主持人'; //收到信息人的称号
									renderDom[0].isTitle = true; //是否显示收到信息人的称号 
								} else {
									renderDom[0].title = ''; //收到信息人的称号
									renderDom[0].isTitle = false; //是否显示收到信息人的称号 
								}
							}
							// console.log(renderDom)
							//执行消息上屏处理
							var contentArr = that.data.contentArr;
							contentArr.push(...renderDom);
							//创建节点选择器
							var query = wx.createSelectorQuery();
							//选择id
							query.select('#chat').boundingClientRect()
							query.exec(function(res) {
								// 清空输入框的信息再将聊天信息滚动到最下面
								if (res[0].height) {
									that.setData({
										contentArr: contentArr,
										scrollTop: res[0].height
									})
								}
							})
						} else if (event.data[i].payload.data == "sing") { //点歌
							console.log('收到点歌', event.data[i].payload);
							if (event.data[i].payload.description == 1) {
								that.systemJoinChat('点歌已开启,快去点歌吧'); //触发系统提示信息
							} else if (event.data[i].payload.description == 2) {
								that.setData({ //点歌
									dgShow: false,
								})
								that.systemJoinChat('点歌已关闭,开启后再点歌吧'); //触发系统提示信息
							}
							//重新获取直播间的状态
							that.getRoom(that.data.item.room_id)
						} else if (event.data[i].payload.data == "guess") { //竞猜
							console.log('收到竞猜', event.data[i].payload);
							if (event.data[i].payload.description == 1) {
								that.systemJoinChat('竞猜已开启,快去猜猜吧'); //触发系统提示信息
							} else if (event.data[i].payload.description == 2) {
								that.setData({ //竞猜
									jcShow: false,
								})
								that.systemJoinChat('竞猜已关闭,开启后再竞猜吧'); //触发系统提示信息
							}
							//重新获取直播间的状态
							that.getRoom(that.data.item.room_id);
						} else if (event.data[i].payload.data == "vote") { //投票
							console.log('收到投票', event.data[i].payload);
							if (event.data[i].payload.description == 1) {
								that.systemJoinChat('投票已开启,快去投票吧'); //触发系统提示信息
							} else if (event.data[i].payload.description == 2) {
								that.setData({ //投票
									tpShow: false,
								})
								that.systemJoinChat('投票已关闭,开启后再投票吧'); //触发系统提示信息
							}
							//重新获取直播间的状态
							that.getRoom(that.data.item.room_id);
						} else if (event.data[i].payload.data == "topic") { //话题
							console.log('收到话题', event.data[i].payload);
							that.systemJoinChat('话题已更新,快来聊聊吧');
							//重新获取直播间的状态
							that.getRoom(that.data.item.room_id);
						} else if (event.data[i].payload.data == "notice") { //置顶
							console.log('收到点歌置顶', event.data[i].payload);
							that.systemJoinChat('恭喜这位朋友,你的点歌已被置顶');
							if (tipTime) {
								clearInterval(tipTime); //有当前的定时器关闭
							}
							var time = 0;
							tipTime = setInterval(function() { //开启定时器
								time++
								if (time >= 15) {
									that.setData({
										tipShow: false
									})
									clearInterval(tipTime)
								} else {
									that.setData({
										tipShow: true,
										tipItem: JSON.parse(event.data[i].payload.description)
									})
								}
							}, 1000)
						} else if (event.data[i].payload.data == "barrage") { //弹幕
							console.log('收到弹幕信息', event.data[i].payload);
							let obj = JSON.parse(event.data[i].payload.description)
							doommList.push(obj);
							that.setData({
								doommData: doommList //弹幕数据
							})
						}
					} else if (event.data[i].conversationType == "C2C") { //私聊事件
						console.log('收到私聊信息', event.data[i])
						if (event.data[i].payload.data == "@") {
							that.setData({
								atShow: true,
								atscrollTop: that.data.scrollTop //记录当前的scrolltop
							})
						}
					}
				}
			});

			tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function(event) {
				// 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
				// event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
				// event.data - 存储 Conversation 对象的数组 - [Conversation]
				// console.log('3', event)
			});

			tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function(event) {
				// 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
				// event.name - TIM.EVENT.GROUP_LIST_UPDATED
				// event.data - 存储 Group 对象的数组 - [Group]
				// console.log('4', event)
			});

			tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, function(event) {
				// 收到新的群系统通知
				// event.name - TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED
				// event.data.type - 群系统通知的类型，详情请参见 GroupSystemNoticePayload 的 <a href="https://imsdk-1252463788.file.myqcloud.com/IM_DOC/Web/Message.html#.GroupSystemNoticePayload"> operationType 枚举值说明</a>
				// event.data.message - Message 对象，可将 event.data.message.content 渲染到到页面
				// console.log('5', event)
			});

			tim.on(TIM.EVENT.PROFILE_UPDATED, function(event) {
				// 收到自己或好友的资料变更通知
				// event.name - TIM.EVENT.PROFILE_UPDATED
				// event.data - 存储 Profile 对象的数组 - [Profile]
				// console.log('6', event)
			});

			tim.on(TIM.EVENT.BLACKLIST_UPDATED, function(event) {
				// 收到黑名单列表更新通知
				// event.name - TIM.EVENT.BLACKLIST_UPDATED
				// event.data - 存储 userID 的数组 - [userID]
				// console.log('7', event)
			});

			tim.on(TIM.EVENT.ERROR, function(event) {
				// 收到 SDK 发生错误通知，可以获取错误码和错误信息
				// event.name - TIM.EVENT.ERROR
				// event.data.code - 错误码
				// event.data.message - 错误信息
				// console.log('8', event)
			});

			tim.on(TIM.EVENT.SDK_NOT_READY, function(event) {
				// 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
				// event.name - TIM.EVENT.SDK_NOT_READY
				// console.log('9', event)
			});

			tim.on(TIM.EVENT.KICKED_OUT, function(event) {
				// 收到被踢下线通知
				// event.name - TIM.EVENT.KICKED_OUT
				// event.data.type - 被踢下线的原因，例如 TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多账号登录被踢
				// console.log('10', event)
			});
			// 登入im
			that.loginTim()
		} else {
			console.log('没有传入', room_id)
			return false;
		}
	},

	// 登入im
	loginTim: function() {
		let that = this,
			params = {
				uid: JSON.stringify(wx.getStorageSync('info').uid) ? JSON.stringify(wx.getStorageSync('info').uid) : that.randomNumber()
			}
		https.sign(params).then(res => {
			if (res.data.code == 200) {
				console.log("获取到的签名", res.data.result)
				let promise = tim.login({
					userID: params.uid,
					userSig: res.data.result.sign
				});
				promise.then(function(imResponse) {
					console.log("登录成功", imResponse.data); // 登录成功
					console.log(that.data.item)
					// 申请加入聊天室
					let promise = tim.joinGroup({
						groupID: that.data.item.roomID, //加入的群聊
						type: TIM.TYPES.GRP_AVCHATROOM
					});
					promise.then(function(imResponse) {
						console.log('获取到的加群信息', imResponse.data)
						switch (imResponse.data.status) {
							case TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
								break;
							case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
								break;
							case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
								break;
							default:
								break;
						}
					}).catch(function(imError) {
						console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
					});
				}).catch(function(imError) {
					console.warn('login error:', imError); // 登录失败的相关信息
				});
			}
		})
	},
	//退出群聊
	outTim: function() {
		let promise = tim.quitGroup(this.data.item.roomID);
		promise.then(function(imResponse) {
			console.log(imResponse.data.groupID); // 退出成功的群 ID
		}).catch(function(imError) {
			console.warn('quitGroup error:', imError); // 退出群组失败的相关信息
		});
	},
	// 解析群系统消息
	decodeGroup: function(payload) {
		let that = this;
		switch (payload.operationType) {
			case 1:
				that.groupprompt(payload.userIDList.join(','));
				return "群成员:" + payload.userIDList.join(',') + ",加入群组";
				break;
			case 2:
				return "群成员:" + payload.userIDList.join(',') + ",退出群组";
				break;
			case 3:
				return "群成员:" + payload.userIDList.join(',') + "被" + payload.operatorID + ",踢出群组";
				break;
			case 4:
				return "群成员:" + payload.userIDList.join(',') + ",，成为管理员";
				break;
			case 5:
				return "群成员:" + payload.userIDList.join(',') + ",被撤销管理员";
				break;
			default:
				return '[群提示消息]';
				break;
		}
	},
	// 获取文本消息
	decodeText: function(payload, isPayload) {
		let renderDom = [],
			temp = ''
		if (isPayload) {
			// 机器人消息
			temp = JSON.parse(payload.text).data
		} else {
			// 文本消息
			temp = payload.text
		}
		let left = -1
		let right = -1
		while (temp !== '') {
			left = temp.indexOf('[')
			right = temp.indexOf(']')
			switch (left) {
				case 0:
					if (right === -1) {
						renderDom.push({
							name: 'text',
							text: temp
						})
						temp = ''
					} else {
						let _emoji = temp.slice(0, right + 1)
						if (emojiMap[_emoji]) {
							renderDom.push({
								name: 'img',
								src: emojiUrl + emojiMap[_emoji]
							})
							temp = temp.substring(right + 1)
						} else {
							renderDom.push({
								name: 'text',
								text: '['
							})
							temp = temp.slice(1)
						}
					}
					break
				case -1:
					renderDom.push({
						name: 'text',
						text: temp
					})
					temp = ''
					break
				default:
					renderDom.push({
						name: 'text',
						text: temp.slice(0, left)
					})
					temp = temp.substring(left)
					break
			}
		}
		return renderDom
	},
	// 系统消息
	systemJoinChat: function(content) {
		let that = this;
		var obj = {
			type: "system",
			content: content
		}
		var contentArr = that.data.contentArr;
		contentArr.push(obj);
		//创建节点选择器
		var query = wx.createSelectorQuery();
		//选择id
		query.select('#chat').boundingClientRect()
		query.exec(function(res) {
			//res就是 所有标签为mjltest的元素的信息 的数组
			// 清空输入框的信息再将聊天信息滚动到最下面
			if (res[0].height) {
				that.setData({
					contentArr: contentArr, //将数据渲染到dom
					scrollTop: res[0].height
				})
			}
		})
	},
	getRank: function() {
		// 关注
		let self = this,
			params = {
				page: 1,
				order: 1,
				u_id: wx.getStorageSync('info').uid
			}
		https.rank(params).then(res => {
			if (res.data.code = 200) {
				console.log('热度列表', res.data.result)
				self.setData({
					rankArr: res.data.result.list
				})
			}
		})
	},
	// 直播结束的按钮
	onGoRoom: function(e) {
		console.log('进入下一个房间', e.detail);
		let that = this;
		for (let i = 0; i < that.data.rankArr.length; i++) {
			if (that.data.rankArr[i].room_id == e.detail) {
				if (that.data.rankArr[i].live_status == 1) {
					var obj = {
						room_id: that.data.rankArr[i].room_id
					}
					that.onLoad(obj); //重新加载进入直播间
					that.setData({
						endBoxShow: false,
						liveShow: true
					})
				} else {
					console.log('点击了预约直播', that.data.rankArr[i].room_id)
					if (that.data.rankArr[i].is_subscribe == 1) {
						wx.showModal({
							title: '温馨提示',
							content: '确定取消预约吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.subscribe(that.data.rankArr[i].room_id, i)
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					} else {
						that.subscribe(that.data.rankArr[i].room_id, i)
					}
				}
			}
		}
	},
	// 获取栏目详情
	getColumn: function(room_id) {
		// 关注
		let self = this,
			params = {
				c_id: room_id
			}
		https.getColumn(params).then(res => {
			if (res.data.code == 200) {
				console.log('获取栏目信息',res.data.result)
				// if (res.data.result.live_status == 1) {
					// 主持人信息
					self.setData({
						item: res.data.result
					})
					// 刷新热度数据
					self.getColumnHot() //每隔两秒刷新数据
				// } else {
				// 	self.setData({
				// 		item: res.data.result
				// 	})
				// 	wx.showModal({
				// 		title: '温馨提示',
				// 		content: '当前直播间已下架',
				// 		showCancel: false,
				// 		success(resmodel) {
				// 			if (resmodel.confirm) {
				// 				wx.navigateBack({
				// 					delta: 1
				// 				})
				// 			}
				// 		}
				// 	})
				// 	return false;
				// }
			}
		})
	},
	// 预约接口
	subscribe: function(room_id, index) {
		let self = this,
			params = {
				c_id: room_id
			},
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			}
		if (header.token) {
			https.subscribe(params, header).then(res => {
				if (res.data.code == 200) {
					if (res.data.result.msg == "预约成功") {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.rankArr[index].is_subscribe = 1;
						self.setData({
							rankArr: self.data.rankArr //手动修改预约状态
						})
					} else {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.rankArr[index].is_subscribe = 0;
						self.setData({
							rankArr: self.data.rankArr //手动修改预约状态
						})
					}
				}
			})
		} else {
			console.log('没有登入')
		}
	},
	// 是否选中
	actshowBtn: function() {
		this.setData({
			actShow: !this.data.actShow
		})
	},
	// 关闭按钮
	rightshowBtn: function() {
		console.log('是否选中状态', this.data.actShow)
		this.setData({
			endboxbottomShow: false
		})
		// 批量预约接口
		if (this.data.actShow) {
			// 关注
			let self = this,
				params = {},
				header = {
					'content-type': 'application/x-www-form-urlencoded',
					'token': wx.getStorageSync("info").token
				}
			if (wx.getStorageSync("info").token) {
				https.batch(params, header).then(res => {
					if (res.data.code = 200) {
						console.log('批量预约接口', res.data.result)
					}
				})
			} else {
				return
			}
		}
	},
	// 历史足迹
	history: function(room_id) {
		// 关注
		let self = this,
			params = {
				c_id: room_id,
				u_id: wx.getStorageSync('info').uid
			}
		https.history(params).then(res => {
			if (res.data.code = 200) {
				console.log(res.data.result.msg)
			}
		})
	},
	// 音频按钮
	audiobtn: function() {
		if (audioTime) {
			clearInterval(audioTime)
		}
		// 音频进度条
		let that = this,
			animate = wx.createAnimation({
				duration:2000,
				timingFunction:'ease',
			}),
			time = 0;
		audioTime = setInterval(function() { //开启定时器
			time++
			if (time >= 5) {
				animate.top(App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight).step();
				that.setData({
					animationRo:animate.export(),
				});
				clearInterval(audioTime)
			} else {
				animate.top(App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight + 130).step();
				that.setData({
					animationRo:animate.export(),
				});
			}
		}, 1000)
	},
	anchorBtn: function() {
		console.log("点击了栏目按钮", this.data.item.room_id, this.data.videoShow)
		// pageType(1栏目 2频率 3广播)
		// colid(栏目id)
		if (this.data.homeBack) {
			wx.navigateBack({
				delta: 1
			})
		} else {
			wx.navigateTo({
				url: '/pages/datapage/datapage?pageType=1&colid=' + this.data.item.room_id + '&isFm=' + this.data.videoShow
			})
		}
	},
	frequencyBtn: function() {
		console.log('点击了频道', this.data.item.channel_id, this.data.videoShow)
		if (this.data.homeBack) {
			wx.navigateBack({
				delta: 1
			})
		} else {
			wx.navigateTo({
				url: '/pages/datapage/datapage?pageType=2&channelid=' + this.data.item.channel_id + '&colid=' + this.data.item
					.room_id + '&isFm=' + this.data.videoShow
			})
		}
	},
	//关注
	followbtn: function() {
		if (wx.getStorageSync("info")) {
			// 关注
			let self = this,
				params = {
					ac_id: self.data.item.room_id,
					type: 2
				},
				header = {
					'content-type': 'application/x-www-form-urlencoded',
					'token': wx.getStorageSync("info").token
				}
			if (header.token) {
				https.follow(params, header).then(res => {
					if (res.data.code = 200) {
						console.log('关注信息', res.data.result)
						if (res.data.result.msg == "关注成功") {
							self.setData({
								followShow: true
							})
						} else {
							self.setData({
								followShow: false
							})
						}
					}
				})
			} else {
				wx.showToast({
					title: '你没有登入',
					icon: 'none',
					duration: 2000
				})
			}
		}
	},
	// 点击话题收进去按钮
	playerBack: function() {
		console.log('1111')
		var that = this;
		that.setData({
			huatiShow: false
		})
	},
	// 话题
	huaTiBtn: function() {
		console.log('点击了话题')
		var that = this;
		that.setData({
			huatiShow: true
		})
	},
	// 获取房间状态
	getRoom: function(room_id) {
		let self = this,
			params = {
				c_id: room_id,
				u_id: wx.getStorageSync("info").uid ? wx.getStorageSync("info").uid : null
			}
		//获取状态
		https.room(params).then(res => {
			if (res.data.code = 200) {
				console.log('获取状态', res.data.result)
				// 是否订阅
				if (res.data.result.is_follow == 1) {
					self.setData({
						followShow: true
					})
				} else {
					self.setData({
						followShow: false
					})
				}
				// 是否点赞
				if (res.data.result.is_zan == 1) {
					self.setData({
						dzShow: true
					})
				} else {
					self.setData({
						dzShow: false
					})
				}
				// 是不是要开启活动
				if (res.data.result.room.length > 0) {
					for (var i = 0; i < res.data.result.room.length; i++) {
						if (res.data.result.room[i].type == 1) {
							self.setData({ //点歌
								dgShow: true,
								dgData: res.data.result.room[i]
							})
						} else if (res.data.result.room[i].type == 2) {
							self.setData({ //竞猜
								jcShow: true,
								jcData: res.data.result.room[i]
							})
						} else if (res.data.result.room[i].type == 3) {
							let total = res.data.result.room[i].square + res.data.result.room[i].fanfang
							self.setData({ //投票
								tpShow: true,
								tpData: res.data.result.room[i],
								square: res.data.result.room[i].square, //蓝方
								fanfang: res.data.result.room[i].fanfang, //红方
								SquareNum: res.data.result.room[i].square / total * 100, //蓝方支持率
								ConsideNum: res.data.result.room[i].fanfang / total * 100, //红方支持率
							})
						}
					}
				}
				// 校验于服务器的时间
				checkTime = res.data.result.curr_time - Date.parse(new Date()) / 1000;
				liveTime = setInterval(function() { //开启定时器
					self.setData({
						jinduTime: Date.parse(new Date()) / 1000 + checkTime - res.data.result.live_time,
						newTime: self.formatSeconds(Date.parse(new Date()) / 1000 + checkTime - res.data.result.live_time)
					})
				}, 1000)
				// 点歌卡和话题
				self.setData({
					song_card: res.data.result.song_card,
					topic: res.data.result.topic, //话题
				})
			}
		})
	},
	// 热度与在线人数
	getColumnHot: function() {
		let self = this;
		if (self.data.item.roomID) {
			hotTime = setInterval(function() { //开启定时器
				// 获取列表
				let promise = tim.getGroupMemberList({
					groupID: self.data.item.roomID,
					count: 100,
					offset: 0
				}); // 从0开始拉取100个群成员
				promise.then(function(imResponse) {
					// console.log('群成员列表', imResponse.data.memberList); // 群成员列表
					var onlineArr = []; //在线
					for (var i = 0; i < imResponse.data.memberList.length; i++) {
						onlineArr.push(imResponse.data.memberList[i])
						// 当数据不同时才更新
					}
					if(onlineArr.length!=self.data.onlineNum){
						self.setData({
							onlineNum: onlineArr.length
						})	
					}
				}).catch(function(imError) {
					console.warn('getGroupMemberList error:', imError);
				});
				let params = {
					c_id: self.data.item.room_id,
					online_num: self.data.onlineNum
				}
				https.getColumnHot(params).then(res => {
					if (res.data.code = 200) {
						// console.log('当前热度', res.data.result)
						self.setData({
							onlineHot: res.data.result.hot > 10000 ? Math.ceil(res.data.result.hot / 10000) + "万" : res.data.result.hot
						})
					}
				})
			}, 1000)
		}
	},
	// 添加热度
	joinNum: function() {
		let params = {
			c_id: this.data.item.room_id,
		}
		https.joinNum(params).then(res => {
			if (res.data.code = 200) {
				console.log('参与人数接口已启用')
			}
		})
	},
	// 将敏感词换成*
	hasSensitiveWords: function(str) {
		if (str == '' || str == undefined) return false;
		var words = https.config.sensitive; // 常用敏感词，请自己添加
		var array = words.split(','),
			len = array.length;
		for (var i = 0; i < len; i++) {
			var item = array[i];
			if (str.indexOf(item) >= 0 && item != '') {
				return item;
			}
		}
		return false;
	},
	// 将敏感词换成*
	replaceAll: function(oldStr, reStr) {
		var len = reStr.length,
			starStr = '';
		for (var i = 0; i < len; i++) {
			starStr += '*';
		}
		return oldStr.replace(new RegExp(reStr, "gm"), starStr);
	},
	// 用户按钮
	userBtn: function(e) {
		console.log('点击了用户按钮', e.currentTarget.dataset.item)
		this.setData({
			bgShow: true,
			personalboxShow: true,
			personalboxData: e.currentTarget.dataset.item
		})
	},
	goranking: function() {
		wx.showToast({
			title: '敬请期待',
			icon: 'none',
			duration: 2000
		})
	},
	// 修改input的高度
	blur: function(e) {
		this.setData({
			setBottom: 20,
		})
	},
	// 修改input的高度
	focus: function(e) {
		this.setData({
			setBottom: e.detail.height
		})
	},
	// 查看是发弹幕还是聊天
	switchChange: function(e) {
		if (e.detail.value) {
			this.setData({
				placeholderText: '10个有一币发送弹幕~'
			})
		} else {
			this.setData({
				placeholderText: '说点什么吧~'
			})
		}
		this.setData({
			switchShow: e.detail.value
		})
	},
	// 发送
	sendCon: function(e) {
		var that = this;
		if (!e.detail.value) return false; //阻断发送
		// 执行屏蔽字
		var value = that.hasSensitiveWords(e.detail.value);
		if (value) {
			// console.log(that.replaceAll(e.detail.value, value))
			e.detail.value = that.replaceAll(e.detail.value, value)
		}
		if (that.data.switchShow) { //这个是弹幕
			console.log('这是在发送弹幕消息', e.detail.value)
			// if(!that.data.info){
			// 	wx.showToast({
			// 		title: '请充值有一币才可以发弹幕哦',
			// 		icon: 'none',
			// 		duration: 2000
			// 	})
			// 	that.setData({
			// 		content: null //还原数据
			// 	})
			// 	return false;
			// }
			// 文本 位置 时间 
			let obj = new Doomm(e.detail.value, that.data.info.headurl, Math.ceil(Math.random() * 100), Math.ceil(Math.random() *
				20), getRandomColor()) //创建数据
			doommList.push(obj);
			that.setData({
				doommData: doommList, //弹幕数据
				content: null //还原数据
			})
			let message = tim.createCustomMessage({ //发送弹幕的到群
				to: that.data.item.roomID,
				conversationType: TIM.TYPES.CONV_GROUP,
				payload: {
					data: 'barrage', //@事件
					description: JSON.stringify(obj),
				}
			});
			let promise = tim.sendMessage(message);
			promise.then(function(imResponse) {
				console.log(imResponse);
			}).catch(function(imError) {
				console.warn('sendMessage error:', imError);
			});
		} else {
			// console.log(that.data.renderDom)
			// @事件执行自己定义
			if (that.data.renderDom != null) {
				let message = tim.createCustomMessage({
					to: that.data.renderDom.usId ? that.data.renderDom.usId : 'anchor_' + that.data.item.a_id,
					conversationType: TIM.TYPES.CONV_C2C,
					payload: {
						data: '@', //@事件
						description: e.detail.value,
					}
				});
				let promise = tim.sendMessage(message);
				promise.then(function(imResponse) {
					console.log(imResponse);
				}).catch(function(imError) {
					console.warn('sendMessage error:', imError);
				});
			}
			// 发送正常的消息实例
			let message = tim.createTextMessage({
				to: that.data.item.roomID,
				conversationType: TIM.TYPES.CONV_GROUP,
				payload: {
					text: e.detail.value
				}
			});
			let promise = tim.sendMessage(message);
			promise.then(function(imResponse) {
				console.log('发送消息', imResponse);
				if (imResponse.code == 0) {
					// 创建文本消息
					var obj = {
						name: "text", //发送的类型
						title: '', //该发送信息人的称号
						avatar: wx.getStorageSync('info').headurl, //头像
						isTitle: false, //是否显示称号
						color: "#C7C7C7", //发送的文本颜色
						nick: wx.getStorageSync('info').nickname, //昵称
						text: e.detail.value, //发送的文本内容
						usId: wx.getStorageSync('info').uid //发送者的id
					}
					var contentArr = that.data.contentArr;
					contentArr.push(obj);
					//创建节点选择器
					var query = wx.createSelectorQuery();
					//选择id
					query.select('#chat').boundingClientRect()
					query.exec(function(res) {
						//res就是 所有标签为mjltest的元素的信息 的数组
						// 清空输入框的信息再将聊天信息滚动到最下面
						if (res[0].height) {
							that.setData({
								content: null,
								contentArr: contentArr,
								scrollTop: res[0].height
							})
						}
					})
					that.joinNum() //参与互动人数接口
				} else {
					console.log('发送消息参数', imResponse);
				}
			}).catch(function(imError) {
				console.log('sendMessage error:', imError);
				if (imError.code == 10017) {
					wx.showToast({
						title: '你被禁言了',
						icon: 'none',
						duration: 2000
					})
					that.setData({
						content: null
					})
				}
			});
		}
	},
	// 礼物开关
	liwuBtn:function(){
		var optionArr=[],
			obj={
				name:"直播间",
				image:this.data.item.icon,
				isOption:true
			},newObj={},
			that=this;
		optionArr.push(obj);
		for(var i=0;i<that.data.item.anchor.list.length;i++){
			newObj.name='主持人'
			newObj.image=that.data.item.anchor.list[i].headimg
			newObj.isOption=false
		}	
		optionArr.push(newObj)
		that.setData({
			liwuShow:true,
			bgShow:true,
			optionArr:optionArr
		})
	},
	// 点赞
	dianZanBtn: function() {
		if (wx.getStorageSync("info")) {
			// 关注
			let self = this,
				params = {
					c_id: self.data.item.room_id
				},
				header = {
					'content-type': 'application/x-www-form-urlencoded',
					'token': wx.getStorageSync("info").token
				}
			https.doZan(params, header).then(res => {
				if (res.data.code = 200) {
					console.log('关注信息', res.data.result)
					if (res.data.result.msg == "点赞成功") {
						self.setData({
							dzShow: true
						})
						self.joinNum() //参与互动人数接口
					} else {
						self.setData({
							dzShow: false
						})
					}
				}
			})
		}
	},
	// 关闭点击事件
	bgBtn: function() {
		this.setData({
			bgShow: false,
			personalboxShow: false,
			personalboxData: '',
			diangeShow: false, //点歌
			toupiaoShow: false, //投票
			jingcaiShow: false, //竞猜
			liwuShow:false,//礼物盒子
			noSongcard: false
			// huatiShow: false, //话题
		})
		// 关闭定时器
		if (timerTime) {
			clearInterval(timerTime);
		}
	},
	// 倒计时
	countdown: function(time) {
		let that = this;
		timerTime = setInterval(function() { //开启定时器
			that.setData({
				end_time: that.formatSeconds(time - Date.parse(new Date()) / 1000 + checkTime)
			})
		}, 1000)
	},
	// 将秒转成时分秒
	formatSeconds: function(value) {
		let result = parseInt(value)
		let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600)
		let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60))
		let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60))
		result = `${h}:${m}:${s}`
		return result
	},
	// 连麦
	lianMaiBtn: function() {
		console.log('点击了连麦')
		var that = this;
		if (wx.getStorageSync('info')) {
			that.setData({
				lianmaiShow: !that.data.lianmaiShow
			})
		} else {
			wx.showToast({
				title: '请先登入',
				icon: 'none',
				duration: 2000
			})
		}
	},
	// 竞猜
	jingCaiBtn: function() {
		// console.log('点击了竞猜')
		var that = this;
		if (that.data.jcShow) {
			if(that.data.jcData.end_time - Date.parse(new Date()) / 1000 + checkTime<=0){
				wx.showToast({
					title: '主播没有开启竞猜',
					icon: 'none',
					duration: 2000
				})
				that.getRoom(that.data.item.room_id) //刷新当前的房间的状态信息
				return false;
			}else{
				that.setData({
					bgShow: true,
					diangeShow: false, //点歌
					toupiaoShow: false, //投票
					jingcaiShow: true, //竞猜
				})
				that.countdown(that.data.jcData.end_time)
			}
		} else {
			wx.showToast({
				title: '主播没有开启竞猜',
				icon: 'none',
				duration: 2000
			})
		}
	},
	onJingcaiBtn: function(value) {
		console.log('获取到的竞猜内容', value.detail)
		if (!value.detail || !this.data.jcShow) {
			var title=''
			if(!value.detail){
				title='请输入内容'
			}else{
				this.bgBtn()
				title='活动已结束'
			}
			wx.showToast({
				title: title,
				icon: 'none',
				duration: 2000
			})
			return false;
		}
		// 竞猜
		let self = this,
			params = {
				u_id: wx.getStorageSync('info').uid,
				active_id: self.data.jcData.id,
				content: value.detail
			}
		// 执行请求数据
		https.doGuess(params).then(res => {
			if (res.data.code == 200) {
				console.log('竞猜', res.data)
				self.joinNum() //参与互动人数接口
				//关闭当前的页面
				self.bgBtn()
				wx.showToast({
					title: '竞猜成功',
					icon: 'none',
					duration: 2000
				})
				// 将消息通知主持人
				let message = tim.createCustomMessage({ //消息通知
					to: 'anchor_' + self.data.item.a_id, //单独发送给主播
					conversationType: TIM.TYPES.CONV_C2C,
					payload: {
						data: 'guess', //往主播发点歌事件
						description: value.detail,
					}
				});
				let promise = tim.sendMessage(message);
				promise.then(function(imResponse) {
					console.log(imResponse);
				}).catch(function(imError) {
					console.warn('sendMessage error:', imError);
				});
			}
		})
	},
	// 点歌
	dianGeBtn: function() {
		// console.log('点击了点歌')
		var that = this;
		if (that.data.dgShow) {
			if(that.data.dgData.end_time - Date.parse(new Date()) / 1000 + checkTime<=0){
				wx.showToast({
					title: '主播没有开启点歌',
					icon: 'none',
					duration: 2000
				})
				that.getRoom(that.data.item.room_id) //刷新当前的房间的状态信息
				return false;
			}else{
				that.setData({
					diangeShow: true, //点歌
					toupiaoShow: false, //投票
					jingcaiShow: false, //竞猜
					bgShow: true
				})
				that.countdown(that.data.dgData.end_time)
			}
		} else {
			wx.showToast({
				title: '主播没有开启点歌',
				icon: 'none',
				duration: 2000
			})
		}
	},
	// 点歌框中的按钮
	onDiangeBtn: function(value) {
		console.log('获取到的点歌内容', value.detail)
		if (!value.detail || !this.data.dgShow) {
			var title=''
			if(!value.detail){
				title='请输入内容'
			}else{
				this.bgBtn()
				title='活动已结束'
			}
			wx.showToast({
				title: title,
				icon: 'none',
				duration: 2000
			})
			return false;
		}
		// 点歌
		let self = this,
			params = {
				u_id: wx.getStorageSync('info').uid,
				active_id: self.data.dgData.id,
				content: value.detail
			}
		// 执行请求数据
		https.doSongCard(params).then(res => {
			if (res.data.code == 200) {
				console.log('点歌', res.data)
				self.joinNum() //参与互动人数接口
				//关闭当前的页面
				self.bgBtn()
				wx.showToast({
					title: '点歌成功',
					icon: 'none',
					duration: 2000
				})
				self.getRoom(self.data.item.room_id) //刷新当前的房间的状态信息
				// 将消息通知主持人
				let message = tim.createCustomMessage({ //消息通知
					to: 'anchor_' + self.data.item.a_id, //单独发送给主播
					conversationType: TIM.TYPES.CONV_C2C,
					payload: {
						data: 'sing', //往主播发点歌事件
						description: value.detail,
					}
				});
				let promise = tim.sendMessage(message);
				promise.then(function(imResponse) {
					console.log(imResponse);
				}).catch(function(imError) {
					console.warn('sendMessage error:', imError);
				});
			}
		})
	},
	// 投票
	touPiaoBtn: function() {
		// console.log('点击了投票')
		var that = this;
		if (that.data.tpShow) {
			if(that.data.tpData.end_time - Date.parse(new Date()) / 1000 + checkTime<=0){
				wx.showToast({
					title: '主播没有开启投票',
					icon: 'none',
					duration: 2000
				})
				that.getRoom(that.data.item.room_id) //刷新当前的房间的状态信息
				return false;
			}else{
				that.setData({
					diangeShow: false, //点歌
					toupiaoShow: true, //投票
					jinagcaiShow: false, //竞猜
					bgShow: true
				})
				that.countdown(that.data.tpData.end_time)
			}
		} else {
			wx.showToast({
				title: '主播没有开启投票',
				icon: 'none',
				duration: 2000
			})
		}
	},
	// 投票方法
	postdoVote: function(type, text) {
		if (!this.data.tpShow) {
			this.bgBtn()
			wx.showToast({
				title: '活动已结束',
				icon: 'none',
				duration: 2000
			})
			return false;
		}
		var self = this,
			params = {
				u_id: wx.getStorageSync('info').uid,
				active_id: self.data.tpData.id,
				vote_type: type
			}
		// 执行请求数据
		https.doVote(params).then(res => {
			if (res.data.code == 200) {
				if (res.data.result.msg == "投票成功") {
					// console.log('投票成功',res.data.result);
					self.getRoom(self.data.item.room_id) //更新投票信息
					self.joinNum() //参与互动人数接口
					if (params.vote_type == 1) {
						self.setData({
							squareText: '支持蓝方',
							fanfangText: ' ',
						})
						wx.showToast({
							title: '支持蓝方',
							icon: 'none',
							duration: 2000
						})
					} else {
						self.setData({
							squareText: '',
							fanfangText: '已支持红方',
						})
						wx.showToast({
							title: '支持红方',
							icon: 'none',
							duration: 2000
						})
					}
					// 将消息通知主持人
					let message = tim.createCustomMessage({ //消息通知
						to: 'anchor_' + self.data.item.a_id, //单独发送给主播
						conversationType: TIM.TYPES.CONV_C2C,
						payload: {
							data: 'vote', //往主播发点歌事件
							description: text == '反方' ? '我投了红方1票' : '我投了蓝方1票'
						}
					});
					let promise = tim.sendMessage(message);
					promise.then(function(imResponse) {
						console.log('投票成功', imResponse);
					}).catch(function(imError) {
						console.warn('sendMessage error:', imError);
					});
				} else if (res.data.result.msg == "已投票") {
					console.log('已投票', res.data.result);
					self.getRoom(self.data.item.room_id) //更新投票信息
					if (params.vote_type == 1) {
						self.setData({
							squareText: '已支持蓝方',
							fanfangText: '',
						})
						wx.showToast({
							title: '已支持蓝方',
							icon: 'none',
							duration: 2000
						})
					} else {
						self.setData({
							squareText: '',
							fanfangText: '已支持红方',
						})
						wx.showToast({
							title: '已支持红方',
							icon: 'none',
							duration: 2000
						})
					}
				}
			}
		})
	},
	// 蓝方
	onToupiao1Btn: function(value) {
		this.postdoVote(1, value.detail)
	},
	// 红方
	onToupiao2Btn: function(value) {
		this.postdoVote(2, value.detail)
	},
	// 关闭
	onGuangbiBtn: function() {
		this.bgBtn()
	},
	// 转发
	zhuanFaBtn: function() {
		console.log('点击了转发')
		var that = this;
		// that.setData({
		// 	zhuanfaShow: !that.data.zhuanfaShow
		// })
		that.joinNum()
	},
	// 点击头像事件
	onChatboxBtn: function(e) {
		console.log('资料卡已经隐藏', e.detail)
		// this.setData({
		// 	bgShow: true,
		// 	personalboxShow: true,
		// 	personalboxData: e.detail
		// })
	},
	// 去主页
	onGozhuyeBtn: function() {
		wx.navigateTo({
			url: '/pages/datapage/datapage',
		});
	},
	// 点击@按钮
	onAtBtn: function(e) {
		this.onLongchatboxBtn(e);
		this.bgBtn()
	},
	// 长按事件   TODO 拉不起键盘
	onLongchatboxBtn: function(e) {
		console.log('长按事件', e.detail)
		if (!this.data.info) {
			wx.showToast({
				title: '请先登入',
				icon: 'none',
				duration: 2000,
			})
			return false;
		}
		if (e.detail.usId == this.data.info.uid) {
			wx.showToast({
				title: '你不能@你自己',
				icon: 'none',
				duration: 2000,
			})
			return false;
		}
		if (e.detail.usId == '0') {
			wx.showToast({
				title: '@小助手功能暂没有开放',
				icon: 'none',
				duration: 2000,
			})
			return false;
		}
		this.setData({
			content: "@" + e.detail.nick + " ",
			renderDom: e.detail
		})
	},
	// 点击了@提示的信息
	atBtn: function() {
		this.setData({
			scrollTop: this.data.atscrollTop,
			atShow: false
		})
	},
	// 加群提示消息
	groupprompt: function(nike) {
		console.log('获取到的群提示', nike)
		let that = this;
		let promise = tim.getGroupMemberProfile({
			groupID: that.data.item.roomID,
			userIDList: [nike], // 请注意：即使只拉取一个群成员的资料，也需要用数组类型，例如：userIDList: ['user1']
			memberCustomFieldFilter: ['group_member_custom'], // 筛选群成员自定义字段：group_member_custom
		});
		promise.then(function(imResponse) {
			console.log('群消息', imResponse);
			// 查询加群的信息
			let systemName = imResponse.data.memberList[0].nick ? imResponse.data.memberList[0].nick : imResponse.data.memberList[
				0].userID;
			that.addTip(systemName)
		}).catch(function(imError) {
			console.warn('getGroupMemberProfile error:', imError);
		});
	},
	//加群提示
	addTip: function(systemName) {
		let that = this;
		if (groupTip) {
			clearInterval(groupTip); //有当前的定时器关闭
		}
		var time = 0;
		groupTip = setInterval(function() { //开启定时器
			time++
			if (time >= 10) {
				that.setData({
					systemShow: false
				})
				clearInterval(groupTip)
			} else {
				that.setData({
					systemShow: true,
					systemName: systemName //系统提示信息
				})
			}
		}, 1000)
	},
	// 获取游客id
	randomNumber: function() {
		var number = '游客',
			codeChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
				'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
				'w', 'x', 'y', 'z',
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
				'W', 'X', 'Y', 'Z'
			]
		for (var i = 0; i < 5; i++) {
			var charNum = Math.floor(Math.random() * 52);
			number += codeChars[charNum];
		}
		return number;
	},
	// 这是登入接口
	getUserInfo: function(e) {
		let self = this;
		//开始登入
		https.login().then(res => {
			if (res.data.code != 200) {
				console.log('出错了')
			} else {
				self.outTim() //退出群聊
				//退出游客身份
				let promise = tim.logout();
				// 清除所有缓存数据
				wx.clearStorage()
				promise.then(function(imResponse) {
					console.log(imResponse.data);
				}).catch(function(imError) {
					console.warn('logout error:', imError);
				});
				let onMessageReceived = function(event) {
					// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
					// event.name - TIM.EVENT.MESSAGE_RECEIVED
					// event.data - 存储 Message 对象的数组 - [Message]
					// console.log(event)
				};
				tim.off(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
				// console.log("登入成功", res.data.result);
				let failureTime = Date.parse(new Date()) / 1000 + 7000; //过期时间
				res.data.result.failureTime = failureTime;
				wx.setStorageSync('info', res.data.result); //个人信息
				wx.showToast({
					title: '登入成功',
					icon: 'none',
					duration: 2000,
				})
				// 用户信息
				self.setData({
					info: res.data.result
				})
				// 重新登入im
				self.loginTim()
				// 重新获取直播间的状态
				self.getRoom(self.data.item.room_id)
				// 重新添加历史记录
				that.history(self.data.item.room_id)
			}
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {
		this.videoContext = wx.createVideoContext('videoplayer');
		this.videoContext.play();
		this.setData({
			updateState: true
		})
	},
	// 静音按钮
	mutedBtn: function() {
		this.setData({
			muted: !this.data.muted
		})
	},
	// 正常播放
	videoPlay:function(e){
		console.log('正在播放', e)
	},
	//视频正在缓冲
	videoWaiting: function(e) {
		console.log('正在缓冲', e)
		wx.showLoading({
			title:"正在缓冲"
		})
		setTimeout(function(){
			wx.hideLoading()
		},2000)
	},
	//播放出错了 
	videoError: function(e) {
		console.log('出错了呢', e)
		this.systemJoinChat('此电台暂时不能收听哦');
	},
	//播放停止了 
	videoPause:function(e){
		console.log('停止了', e)
	},
	//播放条时间改表触发
	videoUpdate(e) {
		// console.log('播放进度发生变化',e.detail)
		if (this.data.updateState) { //判断拖拽完成后才触发更新，避免拖拽失效
			// wx.hideLoading()
			let sliderValue = e.detail.currentTime / e.detail.duration * 100;
			this.setData({
				isTimeout:false,
				sliderValue: sliderValue,
				duration: e.detail.duration
			})
		}
	},
	sliderChanging(e) {
		this.setData({
			updateState: false //拖拽过程中，不允许更新进度条
		})
	},
	//拖动进度条触发事件
	sliderChange(e) {
		if (this.data.duration) {
			this.videoContext.seek(e.detail.value / 100 * this.data.duration); //完成拖动后，计算对应时间并跳转到指定位置
			this.setData({
				sliderValue: e.detail.value,
				updateState: true //完成拖动后允许更新滚动条
			})
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {
		console.log('页面卸载')
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {
		//返回主页
		if (!this.data.homeBack) {
			this.outTim() //退出群聊
			this.setData({
				videoShow: false
			})
			// 清除所有缓存数据
			wx.clearStorage()
			if (this.data.info) { //重新存用户信息
				wx.setStorageSync('info', this.data.info);
			}
			// 关闭页面的时候关闭定时器
			if (hotTime) {
				clearInterval(hotTime);
			}
		}
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
		return {
			title: '电台直播-国内专业音频分享平台,随时随地,听我想听！',
			desc: '听你想听,尽在其中',
			imageUrl: 'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/1.jpeg', //这是图片
			path: 'pages/index/index' //这是一个路径
		}
		this.joinNum()
	},
	// 返回上一级
	handlerGobackClick: function() {
		wx.navigateBack({
			delta: 1
		})
	},
	// 主页
	handlerGohomeClick: function() {
		wx.switchTab({
			url: "/pages/index/index"
		})
	},
	//礼物选项按钮
	liwuTxtBtn:function(e){ 
		// console.log('礼物选项',e.currentTarget.dataset.index)
		this.setData({
			liwuIndex:e.currentTarget.dataset.index
		})
	},
	// 选择送给谁
	optionBtn:function(e){
		let optionArr=this.data.optionArr;
		optionArr[e.currentTarget.dataset.index].isOption=!e.currentTarget.dataset.item.isOption;//更新数据
		this.setData({
			optionArr:optionArr
		})
	},
	// 全选
	wholeBtn:function(){
		let optionArr=this.data.optionArr;
		for(var i=0;i<optionArr.length;i++){
			if(!optionArr[i].isOption){
				optionArr[i].isOption=true
			}
		}
		this.setData({
			optionArr:optionArr
		})
	},
	//图标按钮
	tubiaoBtn:function(e){
		// console.log('图标按钮',e)
		if(e.currentTarget.dataset.item.type=='small'){
			this.setData({
				liwuType:true
			})
		}else{
			this.setData({
				liwuType:false
			})
		}
		this.setData({
			liwuIcon:e.currentTarget.dataset.index,
			isLiwuSendout:true,
			numberOption:1,
			playliwuViewItem:e.currentTarget.dataset.item
		})
	},
	// 送礼物消息提示
	liwuJoinChat:function(content){
		let that = this;
		var obj = {
			type:"gift",
			content: content,
			avatar: wx.getStorageSync('info').headurl, //头像
			isTitle: false, //是否显示称号
			color: "#00FF00", //发送的文本颜色
			nick: wx.getStorageSync('info').nickname, //昵称
			usId: wx.getStorageSync('info').uid //发送者的id
		}
		var contentArr = that.data.contentArr;
		contentArr.push(obj);
		//创建节点选择器
		var query = wx.createSelectorQuery();
		//选择id
		query.select('#chat').boundingClientRect()
		query.exec(function(res) {
			//res就是 所有标签为mjltest的元素的信息 的数组
			// 清空输入框的信息再将聊天信息滚动到最下面
			if (res[0].height) {
				that.setData({
					contentArr: contentArr, //将数据渲染到dom
					scrollTop: res[0].height
				})
			}
		})
	},
	liwuSendout:function(e){
		let self=this;
		if(self.data.isLiwuSendout){
			if(self.data.playliwuViewItem.type=='big'){
				self.setData({
					playliwuViewShow:true
				})
				setTimeout(function(){
					self.setData({playliwuViewShow:false})
				},3000);
			}
			console.log(self.data.playliwuViewItem)
			this.liwuJoinChat(self.data.playliwuViewItem);
		}else{
			return;
		}
	},
	// 选择礼物的个数
	numberoptionBtn:function(e){
		console.log('送礼个数',e)
		this.setData({
			numberOption:e.currentTarget.dataset.item.number
		})
	},
	// 打开送礼个数选项
	numberOptionShowBtn:function(){
		console.log('11111')
		this.setData({
			isNumberOption:!this.data.isNumberOption
		})
	},
	//跳转充值界面
	gotoAccount:function(){
		wx.navigateTo({
			url: '/pages/account/account'
		});
	},
	customBtn:function(){
		console.log('自定义按钮')
		wx.showToast({
			title: '正在开发中',
			icon: 'none',
			duration: 2000,
		})
	}
})
