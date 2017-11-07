const app = getApp(),
    queryString = require('../../../utils/queryString'),
    util = require('../../../utils/util'),
    regExpUtil = require('../../../utils/RegExpUtil'),
    utilCommon = require('../../../utils/utilCommon'),
    apiService = require('../../../utils/ApiService'),
    utilPage = app.utilPage,
    authorize = app.authorize,
    Amap = app.Amap;
// {imageUrl: '/images/shop/brooke-lark-203839.png'},
// {imageUrl: '/images/shop/brooke-lark-331977.png'},
// {imageUrl: '/images/shop/brooke-lark-203830.png'}
// 默认数据
const SHOP_PAGES = {
    shopList: [
        {
            img: '/images/shop/eat.png',
            name: '堂食',
            url: '',
            orderType: 0
        },
        {
            img: '/images/shop/takeaway.png',
            name: '外卖',
            url: '',
            orderType: 1
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
        hasMoreData: false,
        isShow: false,//进入初始是否刷新数据
        isShareCurrentPage: false,//是否分享首页
        isTableCode: false,//是否带桌台号
        imageServer: app.globalData.serverAddressImg,
        qrcodeInfo: {},
        orderUrl: '/pages/shop/order/order',
        resLogoDefault: '../../../images/logo.jpg',
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
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        console.log('初始化店铺首页_______________________________', options);
        let _this = this;
        if (options && options.resId) {
            _this.data.resId = utilCommon.isFalse(options.resId);
        }
        this.login(options);
    },
    onReady: function () {
        // 页面渲染完成
        this.data.isShow = true;
    },
    onShow: function () {
        // 页面显示
        if (this.data.isShow && this.data.resId) {
            this.getMainInfo();
            this.getCommonBannerList();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
};

/**
 * 方法类
 */
const methods = {
    login(options) {
        let _this = this,
            openId = app.globalData.openId,
            token = app.globalData.token;
        console.log('店铺首页获取openId_______________________________', openId);
        // wx.chooseAddress({
        //     success: function (res) {
        //         console.log(res,'微信通讯地址')
        //     }
        // });
        // let key = '4e2be20f430ba143f9e898a37956febb';
        // var myAmapFun = new amapFile.AMapWX({key: key});
        // myAmapFun.getRidingRoute({
        //     origin: '114.03763,22.67649',
        //     destination: '114.05787,22.5431',
        //     success: function (data) {
        //         //成功回调
        //         console.log(data, '骑行路线数据');
        //     },
        //     fail: function (info) {
        //         //失败回调
        //         console.log(info)
        //     }
        // });
        app.getLoginRequestPromise().then((res) => {
            openId = app.globalData.openId;
            if (!openId)
                app.requestLogin().then(function () {
                    setUserInfo();
                });
            else
                setUserInfo();
        });

        function setUserInfo() {
            openId = app.globalData.openId;
            token = app.globalData.token;
            _this.setData({openId, token});
            if (_this.data.resId) {//分享模式
                _this.data.isShow = false;
                getUserInfo();
            } else if (options && options.q) {//扫码模式
                _this.data.isShow = false;
                app.getQrcodeRid(options);
                app.getResId((res) => {
                    _this.data.qrcodeInfo = res.value;
                    _this.data.resId = res.value.resId;
                    if (res.value.tableCode && res.value.tableCode.length > 0) {
                        _this.data.isTableCode = true;
                    }
                    getUserInfo();
                }, () => {
                    setTimeout(function () {
                        util.go('/pages/init/init', {
                            type: 'tab'
                        })
                    }, 2000);
                })
            } else {
                util.go('/pages/init/init', {
                    type: 'tab'
                })
            }
        }

        function getUserInfo() {
            let userInfo = app.globalData.userInfo;
            let data = {
                openId: app.globalData.openId,
                resId: _this.data.resId
            };
            if (userInfo && !utilCommon.isEmptyObject(userInfo)) {
                Object.assign(data, {
                    nikeName: userInfo.nickName,
                    sex: userInfo.gender,
                    headImgUrl: userInfo.avatarUrl,
                })
            }
            app.checkIsFirstUse(data, load);
        }

        function load() {
            apiService.token = token;
            let resId = _this.data.resId;
            _this.getMainInfo(() => {
                let isOrderType = _this.getOrderType(_this.data.shopInfo.restaurantBusinessRules).isOrderType;
                if (_this.data.isTableCode) {
                    if (isOrderType == 0) {
                        goOrderPage();
                    } else if (isOrderType == 3) {
                        apiService.checkHasWaitPayConsumer({
                            openId: app.globalData.openId,
                            tableCode: _this.data.qrcodeInfo.tableCode,
                            resId: resId,
                        }, (rsp) => {
                            if (rsp.code === '2000') {
                                util.go('/pages/order/order-detail/order-detail', {
                                    data: {
                                        tableCode: _this.data.qrcodeInfo.tableCode,
                                        resId: resId,
                                        consumerId: rsp.value.consumerId
                                    }
                                });
                            } else if (rsp.code === '2001') {
                                goOrderPage();
                            } else {
                                util.showToast(rsp.message);
                            }
                        });
                    }
                }
            });
            _this.getCommonBannerList();
            _this.data.isShow = true;
        }

        function goOrderPage() {
            util.go('/pages/shop/order/order', {
                data: {
                    orderType: 0,
                    resId: _this.data.resId,
                    tableCode: _this.data.qrcodeInfo.tableCode,
                    tableName: _this.data.qrcodeInfo.tableName
                }
            })
        }
    },
    /**
     * 获取店铺信息
     */
    getMainInfo(cb) {
        let _this = this, openId = this.data.openId, resId = this.data.resId;
        apiService.getMainInfo({openId, resId}, (res) => {
            let shopList = SHOP_PAGES.shopList,
                shopInfo = res.value.resDetailDto;
            _this.setNavigationBarTitle(shopInfo.resName);
            util.extend(shopList[0], shopInfo.restaurantBusinessRules);//堂食
            util.extend(shopList[1], shopInfo.takeoutBusinessRules);//外卖
            let memberCardDto = res.value.memberCardDto;
            memberCardDto.memberTypeDiscount = util.moneyToFloat(memberCardDto.memberTypeDiscount);//会员折扣
            memberCardDto.memberBalance = util.money(memberCardDto.memberBalance);//会员卡余额
            memberCardDto.memberIntegral = util.moneyToFloat(memberCardDto.memberIntegral);//会员卡积分
            app.globalData.memberCardDtoObj[resId] = memberCardDto;
            let topInfoList = this.data.topInfoList;
            if (res.value.resDetailDto.notice) {
                topInfoList = [];
                topInfoList.push(shopInfo.notice);
            } else {
                topInfoList.push('欢迎使用微信小程序点餐！！！');
            }
            _this.setData({
                shopInfo,//店铺信息
                specialServiceList: res.value.specialServiceList,//店铺服务列表
                shopList,//店铺点餐列表
                memberCardDto,//会员卡信息
                topInfoList
            });
            _this.setShopCartsStorage();
            _this.setData({
                hasMoreData: true
            });
            cb && cb();
        });
    },
    /**
     * 获取banner图片列表
     */
    getCommonBannerList() {
        let _this = this, resId = this.data.resId;
        apiService.getCommonBannerList({resId}, (res) => {
            let topImages = SHOP_PAGES.topImages.concat(res.value);
            _this.setData({
                topImages
            })
        });
    }
};
const events = {
    /**
     * 绑定扫码跳跳堂食点餐页功能
     * @param e
     */
    bindAzmScanCode(e) {
        let _this = this,
            dataset = e.currentTarget.dataset,
            type = dataset.type,
            value = dataset.value,
            url = dataset.url,
            flag = false;
        let isOrderType = this.getOrderType(value).isOrderType;
        if (type === 0 && isOrderType === 3) {
            flag = true;
        }
        if (flag) {
            util.go('/pages/shop/home_scanCode/home_scanCode', {
                data: {
                    resId: _this.data.resId
                }
            });
        } else {
            util.go(url);
        }
    },
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
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, utilPage));