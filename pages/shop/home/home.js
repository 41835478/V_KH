const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService'),
    Amap = require('../../../utils/amap');
// 默认数据
const SHOP_PAGES = {
    shopList: [
        {
            img: '/images/shop/eat.png',
            name: '堂食',
            url: '/pages/shop/order/order',
            orderType: 0,
            disabled: false
        },
        {
            img: '/images/shop/takeaway.png',
            name: '外卖',
            url: '/pages/shop/order/order',
            orderType: 1,
            disabled: false
        }
    ],
    topImages: [],
    topInfoList: [
        '暂无公告'
    ]
};
const appPage = {
    data: {
        text: "Page home",
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        options: {},
        isShareCurrentPage: 2,//是否分享首页
        isTableCode: false,//是否带桌台号
        imageServer: config.imageUrl,//图片服务器地址
        userInfo: null,//微信获取的用户信息
        qrcodeInfo: {},
        topImages: [],//banner图片列表
        shopInfo: {
            lat: 0,
            lng: 0,
            resId: '',
            resLogo: '',
            resName: '',
            resAddress: '',
            resPhone: '',
            resOperation: 0,
            resEndTime: '00:00',
            resStarTime: '00:00',
            resIntro: ''
        },
        specialServiceList: [],//提供服务
        topInfoList: [],
        shopList: [],//店铺就餐方式列表
        memberCardDto: {//会员卡信息
            memberTypeDiscount: 0,//折扣
            memberBalance: 0,//余额
            memberIntegral: 0,//积分
        },
        discount: null,//最大会员卡折扣
    },
    onLoad(options) {
        new app.ToastPannel();//初始自定义toast
        let that = this;
        try {
            if (options) {
                Object.assign(that.data.options, options);
                console.warn(`初始化${that.data.text}`, options);
            } else {
                throw {message: '初始化options为空'};
            }
        } catch (e) {
            console.warn(e, options);
        }
        that.loadCb();
    },
    onReady() {
        // 页面渲染完成
        this.data.isShow = true;
    },
    onShow(options) {
        let that = this;
        /**
         * 页面显示
         */
        if (this.data.isShow && this.data.resId) {
            this.getMainInfo();
            this.getCommonBannerList();
        }
    },
    onHide() {
        // 页面隐藏
    },
    onUnload() {
        // 页面关闭
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.getMainInfo().then(() => {
            setTimeout(() => {
                wx.stopPullDownRefresh();
            }, 1000);
        });
    },
};

/**
 * 方法类
 */
const methods = {
    loadCb() {
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
                    ApiService.token = rsp.value.token;
                    that.judgeJumpMode();
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        );
    },
    /**
     * 加载数据
     */
    loadData() {
        let that = this,
            resId = that.data.resId,
            isOrderType = 0;
        if (!resId || resId.length === 0) return;
        that.getMainInfo().then(
            () => {
                isOrderType = that.utilPage_getOrderType(that.data.shopInfo.restaurantBusinessRules).isOrderType;
                if (that.data.isTableCode) {
                    if (isOrderType == 0) {
                        goOrderPage();
                    } else if (isOrderType == 3) {
                        ApiService.checkHasWaitPayConsumer(
                            {
                                objId: that.data.objId,
                                tableCode: that.data.qrcodeInfo.tableCode,
                                resId: resId,
                            },
                            (rsp) => {
                                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                                    util.go('/pages/order/order-detail/order-detail', {
                                        type: 'blank',
                                        data: {
                                            tableCode: that.data.qrcodeInfo.tableCode,
                                            resId,
                                            consumerId: rsp.value.consumerId
                                        }
                                    });
                                } else if (2001 == rsp.code) {
                                    goOrderPage();
                                } else {
                                    util.failToast(rsp.message);
                                }
                            }
                        );
                    }
                }
            });
        that.getCommonBannerList();//获取banner图
        function goOrderPage() {
            that.data.isShow = true;
            util.go('/pages/shop/order/order',
                {
                    data: {
                        orderType: isOrderType,
                        resId: that.data.resId,
                        tableCode: that.data.qrcodeInfo.tableCode,
                        tableName: that.data.qrcodeInfo.tableName
                    }
                }
            )
        }
    },
    /**
     * 判断跳转进入模式
     */
    judgeJumpMode() {
        let that = this,
            options = this.data.options;
        if (options.resId) {
            console.warn('分享&进店铺模式');
            that.data.resId = options.resId;
            that.data.isShow = false;
            // that.checkIsFirstUse();
            that.loadData();
        } else if (options.q) {
            console.warn('扫码模式', options.q);
            that.data.isShow = false;
            let rid = that.utilPage_getQrcodeRid(options.q);
            that.utilPage_getQRcodeTable(rid).then(
                (rsp) => {
                    if (rsp.status > 0) {
                        that.data.qrcodeInfo = rsp;
                        that.data.resId = rsp.resId;
                        if (rsp.tableCode && rsp.tableCode.length > 0) {
                            that.data.isTableCode = true;
                        }
                        // that.checkIsFirstUse();
                        that.loadData();
                    } else {
                        setTimeout(function () {
                            util.go('/pages/init/init', {
                                type: 'tab'
                            })
                        }, 1500)
                    }
                },
                (err) => {
                    setTimeout(function () {
                        util.go('/pages/init/init', {
                            type: 'tab'
                        })
                    }, 1500)
                })
        } else {
            util.go('/pages/init/init', {
                type: 'tab'
            })
        }
    },
    /**
     * 获取店铺信息
     */
    getMainInfo() {
        let that = this, objId = this.data.objId, resId = this.data.resId;
        return new Promise((resolve, reject) => {
            ApiService.getMainInfo(
                {objId, resId},
                (rsp) => {
                    if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        let shopList = SHOP_PAGES.shopList,
                            discount = rsp.value.discount,
                            resDetailDto = rsp.value.resDetailDto,//店铺信息
                            memberCardDto = rsp.value.memberCardDto || null,//会员卡信息
                            specialServiceList = rsp.value.specialServiceList;//店铺服务列表;
                        that.utilPage_setNavigationBarTitle(resDetailDto.resName);//设置导航栏信息
                        util.extend(shopList[0], resDetailDto.restaurantBusinessRules);//堂食
                        util.extend(shopList[1], resDetailDto.takeoutBusinessRules);//外卖
                        let topInfoList = that.data.topInfoList;
                        if (resDetailDto.notice) {
                            topInfoList = [];
                            topInfoList.push(resDetailDto.notice);
                        } else {
                            topInfoList.push('欢迎使用微信小程序点餐！！！');
                        }
                        that.setData({
                            shopInfo: resDetailDto,//店铺信息
                            specialServiceList,//店铺服务列表
                            shopList,//店铺点餐列表
                            memberCardDto,//会员卡信息
                            topInfoList,
                            discount
                        });

                        app.globalData.memberCardDtos[resId] = memberCardDto;
                        app.globalData.resDetailDtos[resId] = resDetailDto;
                        that.utilPage_setShopCartsStorage();
                    }
                },
                (err) => {
                    if (err.status) {

                    }
                    that.setData({hasMoreData: true});
                    resolve();
                }
            );
        })
    },
    /**
     * 获取banner图片列表
     */
    getCommonBannerList() {
        let _this = this,
            resId = this.data.resId;
        ApiService.getCommonBannerList(
            {resId},
            (res) => {
                let topImages = SHOP_PAGES.topImages.concat(res.value);
                _this.setData({
                    topImages
                })
            }
        );
    }
};
const events = {
    /**
     * 绑定扫码跳跳堂食点餐页功能
     * @param e
     */
    bindAzmScanCode(e) {
        let that = this,
            dataset = e.currentTarget.dataset,
            type = dataset.type,
            value = dataset.value,
            resId = that.data.resId,
            url = dataset.url,
            disabled = dataset.disabled,
            orderType = 1;
        if (disabled != 1) {
            util.failToast(`未开通${dataset.text}`);
            return;
        }
        let isOrderType = that.utilPage_getOrderType(value).isOrderType;
        if (0 == type && 3 === isOrderType) {
            orderType = 3;
            util.go('/pages/shop/home_scanCode/home_scanCode', {
                data: {
                    resId,
                    orderType
                }
            });
        } else {
            if (1 === type) orderType = 1;
            else orderType = isOrderType;
            util.go(url, {
                data: {
                    resId,
                    orderType
                }
            });
        }
    },
    /**
     * 打开微信内置地图功能
     */
    bindOpenMap() {
        let that = this,
            shopInfo = that.data.shopInfo,
            latitude = shopInfo.lat,
            longitude = shopInfo.lng,
            address = shopInfo.resAddress,
            name = shopInfo.resName;
        wx.openLocation({
            latitude,
            longitude,
            scale: 18,
            address,
            name
        })
    },
    /**
     * 绑定手机按钮
     * @param e
     */
    getPhoneNumber(e) {
        let that = this;
        util.go('/pages/vkahui/memberApplication/memberApplication', {
            data: {
                resId: that.data.resId,
                resName: that.data.shopInfo.resName,
                resLogo: that.data.shopInfo.resLogo
            }
        })
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));