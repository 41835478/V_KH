const util = require('./util'),
    utilCommon = require('./utilCommon'),
    queryString = require('./queryString'),
    ApiService = require('./ApiService');
const failToast = (that, text) => {
    if (that.showToast) {
        that.showToast(text);
    } else {
        util.failToast(text);
    }
};

const showToast = (that, text) => {
    if (that.showToast) {
        that.showToast(text);
    } else {
        util.showToast(text);
    }
};
module.exports = {
    _app: null,
    getApp() {
        if (!this._app) {
            this._app = getApp();
        }
        return this._app;
    },
    /**
     * 转发分享事件
     * @param options
     * @returns {{title: string, path: string, success: success, fail: fail}}
     */
    onShareAppMessage(options) {
        let that = this,
            route = util.CurrentPages(),
            resId = that.data.resId,
            data = that.data.options,
            orderType = that.data.orderType,
            shopInfo = that.data.shopInfo,
            resName = shopInfo ? '欢迎光临' + shopInfo.resName : '欢迎使用V卡汇小程序',
            imageUrl = shopInfo ? this.data.imageServer + shopInfo.resLogo : null,
            path = '/pages/init/init';//jumpMode跳转模式  0：无模式 1：分享 2：加菜 。。。
        if (1 === that.data.isShareCurrentPage) {
            path = '/pages/shop/home/home'
        } else if (2 === that.data.isShareCurrentPage) {
            if (3 == orderType) {
                path = '/pages/shop/home/home'
            } else {
                path = '/' + route
            }
        }
        return {
            title: resName,
            path: path + '?' + queryString.stringify(data),
            success: function (res) {
                showToast(that, '分享成功')
            },
            fail: function (res) {
                failToast(that, '分享失败')
            }
        }
    },
    /**
     * 预览图片
     * @param e
     */
    previewImage(e) {
        console.log(e);
        let currentImageUrl = e.currentTarget.dataset.imageUrl
        wx.previewImage({
            current: currentImageUrl, // 当前显示图片的http链接
            urls: [currentImageUrl] // 需要预览的图片http链接列表
        })
    },

    /**
     * 图片加载失败事件
     * @param e
     */
    imageError(e) {
        console.log(e)
    },
    /**
     * 设置并并保存本地购物车信息
     */
    utilPage_setShopCartsStorage() {
        this.getApp();
        let that = this;
        let resId = that.data.resId,
            shopCartsStorage = that._app.globalData.shopCarts,
            shopInfo = that.data.shopInfo,
            shopCarts = {
                hallCarts: {
                    totalPrice: 0,
                    amount: 0,
                    counts: 0,
                    list: [],
                    otherList: [],
                    info: {},
                    unsetOrders: {}
                },
                takeawayCarts: {
                    totalPrice: 0,
                    amount: 0,
                    counts: 0,
                    list: [],
                    otherList: [],
                    info: {}
                }
            };
        // console.log(shopCartsStorage, 'shopCartsStorage');
        if (!shopInfo) {
            this.getResDetail(function (res) {
                shopInfo = res.value;
                setShopCartsInfo();
            });
        } else {
            setShopCartsInfo()
        }

        function setShopCartsInfo() {
            if (shopInfo.restaurantBusinessRules && shopInfo.restaurantBusinessRules.status) {
                let hallInfo = shopInfo.restaurantBusinessRules;
                shopCarts.hallCarts.info = hallInfo;
                hallInfo.name = hallInfo.serviceChangeName;
                hallInfo.price = hallInfo.serviceChange;
                hallInfo.counts = 1;
            }
            if (shopInfo.takeoutBusinessRules && shopInfo.takeoutBusinessRules.status) {
                let takeawayInfo = shopInfo.takeoutBusinessRules,
                    distributionFee = takeawayInfo.distributionFee || 0, //配送费
                    packingCharge = Number(takeawayInfo.packingCharge) || 0;//打包费
                shopCarts.takeawayCarts.info = takeawayInfo;
                takeawayInfo.name = '配送费';
                takeawayInfo.price = distributionFee;
                shopCarts.takeawayCarts.otherList.push({
                    name: '打包费',
                    price: util.money(packingCharge),
                    counts: 1
                })
            }
            if (!!shopCartsStorage && utilCommon.isString(shopCartsStorage)) {
                shopCartsStorage = JSON.parse(shopCartsStorage);
            }
            if (!shopCartsStorage || !shopCartsStorage[resId]) {
                shopCartsStorage[resId] = shopCarts;
            }
            shopCarts.hallCarts.info.resName = shopInfo.resName;
            shopCarts.hallCarts.info.resLogo = shopInfo.resLogo;
            shopCartsStorage[resId].hallCarts.otherList = shopCarts.hallCarts.otherList;
            shopCartsStorage[resId].hallCarts.info = shopCarts.hallCarts.info;
            shopCartsStorage[resId].hallCarts.unsetOrders = shopCarts.hallCarts.unsetOrders;
            if (!utilCommon.isArray(shopCartsStorage[resId].hallCarts.list)) {
                shopCartsStorage[resId].hallCarts.list = shopCarts.hallCarts.list;
            }
            shopCarts.takeawayCarts.info.resName = shopInfo.resName;
            shopCarts.takeawayCarts.info.resLogo = shopInfo.resLogo;
            shopCartsStorage[resId].takeawayCarts.otherList = shopCarts.takeawayCarts.otherList;
            shopCartsStorage[resId].takeawayCarts.info = shopCarts.takeawayCarts.info;
            if (!utilCommon.isArray(shopCartsStorage[resId].takeawayCarts.list)) {
                shopCartsStorage[resId].takeawayCarts.list = shopCarts.takeawayCarts.list;
            }
            that._app.globalData.shopCarts = shopCartsStorage;
            that._app.setShopCartsStorage();
        }
    },
    /**
     * 获取会员卡信息
     */
    utilPage_checkMember(resId) {
        this.getApp();
        let that = this,
            data = {
                message: '获取会员卡失败',
                status: false,
                code: 0
            };
        return new Promise(function (resolve, reject) {
            if (!resId) {
                data.message = 'resId为空';
                reject(data);
                return;
            }

            let objId = that.data.objId;
            if (!utilCommon.isObject(that.data.memberCardDto)) {
                that.data.memberCardDto = {};
            }
            try {
                let memberCardDto = that._app.globalData.memberCardDtos[resId];
                if (memberCardDto && memberCardDto.resId === resId) {
                    that.data.memberCardDto && Object.assign(that.data.memberCardDto, memberCardDto);
                    data.message = '获取会员卡成功';
                    data.status = true;
                    resolve(data);
                    return;
                }
                ApiService.checkMember(
                    {resId, objId},
                    (rsp) => {
                        if (2000 === rsp.code && rsp.value && 1 === rsp.value.isBindMobile && rsp.value.member) {
                            memberCardDto = rsp.value.member;
                            that._app.globalData.memberCardDtos[resId] = memberCardDto;
                            that.data.memberCardDto && Object.assign(that.data.memberCardDto, memberCardDto);
                            data.message = '获取会员卡成功';
                            data.status = true;
                        }
                    },
                    (err) => {
                        if (2000 == err.code && err.value && err.value.length > 0 && err.value[0].resId === resId) {
                            resolve(data);
                        } else {
                            data.message = '获取会员卡失败';
                            data.code = 1;
                            reject(data);
                        }
                    }
                );
            } catch (e) {
                console.warn('utilPage_getMemberCardList调用失败');
                data.message = 'utilPage_getMemberCardList调用失败';
                reject(data);
            }
        })
    },
    /**
     * 获取店铺信息
     */
    utilPage_getResDetail(resId) {
        let that = this,
            data = {
                message: '获取店铺信息失败',
                status: false,
                code: 0
            };
        that.getApp();
        return new Promise(function (resolve, reject) {
            if (!resId) {
                data.message = 'resId为空';
                reject(data);
                return;
            }
            if (!utilCommon.isObject(that.data.shopInfo)) {
                that.data.shopInfo = {};
            }

            let shopInfo = that.data.shopInfo;
            try {
                let resDetailDto = that._app.globalData.resDetailDtos[resId];
                if (resDetailDto && resDetailDto.resId === resId) {
                    shopInfo && Object.assign(shopInfo, resDetailDto);
                    that.setData({shopInfo});
                    data.message = '获取店铺信息成功';
                    data.status = true;
                    resolve(data);
                    return;
                }
                ApiService.getResDetail(
                    {resId},
                    (rsp) => {
                        if (2000 === rsp.code && rsp.value && rsp.value.resId === resId) {
                            resDetailDto = rsp.value;
                            that._app.globalData.resDetailDtos[resId] = resDetailDto;
                            shopInfo && Object.assign(shopInfo, resDetailDto);
                            that.setData({shopInfo});
                            data.message = '获取店铺信息成功';
                            data.status = true;
                        }
                    },
                    (err) => {
                        if (2000 == err.code && err.value && err.value.resId === resId)
                            resolve(data);
                        else {
                            data.message = '获取店铺信息失败';
                            data.code = 1;
                            reject(data);
                        }
                    }
                );
            } catch (e) {
                console.warn('utilPage_getResDetail调用失败');
                data.message = 'utilPage_getResDetail调用失败';
                reject(data);
            }
        })
    },
    /**
     * 设置导航栏信息
     * @param txt
     */
    utilPage_setNavigationBarTitle(txt) {
        wx.setNavigationBarTitle({
            title: txt
        })
    },
    /**
     * 拨打电话
     * @param e
     */
    makePhoneCall(e) {
        let phone = e.target.dataset.phone || e.currentTarget.dataset.phone || '';
        if (!phone) return;
        wx.makePhoneCall({
            phoneNumber: phone,
            success() {

            },
            fail() {

            }
        })
    },
    /**
     * 打开module-popup弹框
     * @param str
     */
    utilPage_openModule(str) {
        let that = this,
            data = {
                isMask: true,
                isTemplate: true
            };
        data[str] = str;
        data[`isAnimated`] = true;
        if (that.data[`${str}Data`] && that.data[`${str}Data`].AnimatedTimeout) {
            clearTimeout(that.data[`${str}Data`].AnimatedTimeout);
            that.setData({
                [`${str}Data.isAnimated`]: false
            });
        }
        this.setData(data);
    },
    /**
     * 关闭module-popup弹框
     * @param str
     * @param animated
     */
    utilPage_closeModule(str, animated) {
        let that = this;
        let data = {
            isMask: false,
            isTemplate: false,
        };
        if (that.data[`${str}Data`]) {
            that.data[`${str}Data`].AnimatedTimeout = setTimeout(() => {
                that.setData({
                    [`${str}Data.isAnimated`]: false
                });
            }, 300);
            data[`${str}Data.data`] = {};
            data[`${str}Data.isMask`] = false;
            data[`${str}Data.isLoading`] = false;
            data[`${str}Data.isDisabled`] = false;
        }
        data[str] = '';
        this.setData(data);
    },
    /**
     * 设置店铺就餐模式
     * @param info
     */
    utilPage_setOrderType(info) {
        let data = {//默认堂食
            isOrderType: 0,
            text: '堂食'
        };
        if (this.data.orderType == 1) {
            data.isOrderType = 1;//外卖
            data.text = '外卖';
        } else if (info) {
            data = this.utilPage_getOrderType(info)
        }
        this.utilPage_setNavigationBarTitle(`${data.text}-${this.data.text}`);
        this.setData({isOrderType: data.isOrderType});
        return data;
    },
    /**
     * 获取店铺就餐模式
     * @param info
     * @returns {{isOrderType: number, text: string}}
     */
    utilPage_getOrderType(info) {
        let data = {};
        try {
            data = {
                isOrderType: 0,
                text: '堂食'
            };
            if (info.payType == 1) {
                data.isOrderType = 3;//餐后付款
                data.text = '餐后付款';
            } else {
                if (info.dinnerType == 1) {
                    data.isOrderType = 2;//自助取餐
                    data.text = '自助取餐';
                }
            }
        } catch (e) {
            data = {
                isOrderType: -1,
                text: ''
            }
        }
        return data;
    },
    /**
     * 根据二维码获取ID
     * @param q
     */
    utilPage_getQrcodeRid(q) {
        try {
            if (q && q.length > 0) {
                q = decodeURIComponent(q);
                return queryString.parse(q).id;
            }
        } catch (e) {
            console.error(e, '根据二维码获取ID报错');
        }
    },
    utilPage_getQRcodeTable(rid) {
        let _this = this, objId = this.data.objId;
        return new Promise(function (resolve, reject) {
            let data = {
                type: null,
                resId: null,
                tableName: null,
                tableCode: null,
                status: 0
            };
            if (!rid) {
                reject(data);
                return;
            }
            ApiService.getQRcodeTable(
                {id: rid, objId},
                (rsp) => {
                    try {
                        if (2000 === rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                            data.resId = rsp.value.resId;
                            data.type = rsp.value.type;
                            if (!data.resId) {
                                data.message = '扫描二维码不正确';
                                failToast(_this, data.message);
                                reject(data);
                                return;
                            } else {
                                data.status = 1;
                            }
                            data.tableCode = rsp.value.tableCode;
                            if (!!data.tableCode) {
                                data.status = 2;
                            }
                            data.tableName = rsp.value.tableName;
                            resolve(data)
                        } else {
                            data.message = '无效的二维码';
                            failToast(_this, data.message);
                            reject(data);
                        }
                    } catch (err) {
                        data.status = 0;
                        console.error('rid获取resId与tableCode', err, data);
                        reject(data);
                    }
                },
                () => {
                    reject(data);
                }
            )
        })
    },
    /**
     * 获取二维码桌台
     * @param qrCode
     * @param resId
     * @param bol
     * @returns {Promise}
     */
    utilPage_isQRcode(qrCode, resId, bol) {
        let objId = this.data.objId;
        if (utilCommon.isBoolean(resId)) {
            bol = resId;
            resId = null;
        }
        let promise = new Promise(function (resolve, reject) {
            let data = {
                value: {},
                status: false,
                message: '扫码失败'
            };
            if (qrCode) {
                let rid = queryString.parse(qrCode);
                if (rid && rid.id && rid.id.length > 0) {
                    let id = rid.id;
                    ApiService.getQRcodeTable({id, objId}, (res) => {
                        try {
                            if (!utilCommon.isEmptyValue(res.value)) {
                                throw {message: '无效的二维码'}
                            }
                            data.value = {
                                id,
                                type: res.value.type,
                                resId: res.value.resId,
                                tableCode: res.value.tableCode,
                                tableName: res.value.tableName,
                            };
                            data.status = true;
                            data.message = '扫码成功';
                            if (!res.value.resId) {
                                data.status = false;
                                data.message = '无效的二维码';
                            }
                            if (resId) {
                                if (resId !== res.value.resId) {
                                    data.status = false;
                                    data.message = '非当前店铺二维码'
                                }
                            }
                            if (!bol) {
                                if (0 !== Number(res.value.type) && res.value.resId) {
                                    data.status = false;
                                    data.message = '非店铺二维码';
                                    if (!res.value.tableCode) {
                                        data.message = '无效的桌台二维码';
                                    }
                                }
                            }
                            resolve(data);
                        } catch (err) {
                            data.status = false;
                            data.message = err.message;
                            reject(data);
                            console.log('getQRcodeTable报错', err);
                        }
                    });
                } else {
                    reject(data);
                }
            } else {
                reject(data);
            }
        });
        return promise;
    },
    utilPage_goMemberApplication() {
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