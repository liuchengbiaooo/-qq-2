// pages/components/foot-item/footitem.js
import https from "../../../utils/https";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemData:{
      type:Object
    },
    showheat:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  created() {

    wx.loadFontFace({
      family: 'SourceHanSansCN Medium',
      source: 'url("https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/SourceHanSansCN-Medium.ttf")',
      success(data) {
        // console.log(data)
      },
      fail(error){
        // console.log(error)
      },
      complete(res) {
        // console.log(res)
      }
    })

  },
  /**
   * 组件的方法列表
   */
  methods: {
    yuyueColumn(e){
      console.log(e)
      const that = this,
          header = {
            'content-type':'application/x-www-form-urlencoded',
            'token': wx.getStorageSync("info").token
          };
      // console.log(e)
      switch (Number(e.currentTarget.dataset.status)) {
        case 1:
          wx.navigateTo({
            url: '/pages/play/play?room_id=' +e.currentTarget.dataset.item
          });
          break;
        case 2:
          https.subscribe({c_id: e.currentTarget.dataset.id},header).then(res=>{
            // console.log(res)
            if(res.data.code == 200){
              wx.showToast({
                title: res.data.result.msg,
                success(res) {
                  that.triggerEvent('yuyueColumn', true)
                }
              })

            }
          }).catch(error=>{
            console.log(error);
          });
          break;
      }
    },
    goColumn(e){
      // console.log(e);
      const that = this;
      wx.navigateTo({
        url:'/pages/datapage/datapage?pageType=1&colid='+e.currentTarget.dataset.col
      })
    },
  }
})
