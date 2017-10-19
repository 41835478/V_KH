const util = require('./util'),
    utilCommon = require('./utilCommon'),
    queryString = require('./queryString'),
    apiService = require('./ApiService');
module.exports = {
    /**
     * 设置并并保存本地购物车信息
     */
    setShopCartsStorage() {
        let app = getApp();
        let resId = this.data.resId,
            shopCartsStorage = app.globalData.shopCarts,
            shopInfo = this.data.shopInfo,
            orderType = this.data.orderType,
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
        console.log(shopCartsStorage, 'shopCartsStorage');
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
            shopCartsStorage[resId].hallCarts.otherList = shopCarts.hallCarts.otherList;
            shopCartsStorage[resId].hallCarts.info = shopCarts.hallCarts.info;
            shopCartsStorage[resId].hallCarts.unsetOrders = shopCarts.hallCarts.unsetOrders;
            if (!utilCommon.isArray(shopCartsStorage[resId].hallCarts.list)) {
                shopCartsStorage[resId].hallCarts.list = shopCarts.hallCarts.list;
            }
            shopCartsStorage[resId].takeawayCarts.otherList = shopCarts.takeawayCarts.otherList;
            shopCartsStorage[resId].takeawayCarts.info = shopCarts.takeawayCarts.info;
            if (!utilCommon.isArray(shopCartsStorage[resId].takeawayCarts.list)) {
                shopCartsStorage[resId].takeawayCarts.list = shopCarts.takeawayCarts.list;
            }
            app.globalData.shopCarts = shopCartsStorage;
            app.setShopCartsStorage();
        }
    },
    /**
     * 获取会员卡信息
     */
    getOneMemberCardList(resId) {
        let app = getApp();
        if (!resId) {
            return;
        }
        let _this = this,
            openId = app.globalData.openId,
            appMemberCardDto = app.globalData.memberCardDtoObj[resId];
        if (appMemberCardDto && appMemberCardDto.resId === resId) {
            _this.data.memberCardDto && (_this.data.memberCardDto = util.extend(appMemberCardDto));
            return;
        }
        apiService.getMemberCardList({resId, openId}, (res) => {
            if (res.value && res.value.length > 0 && res.value[0].resId === resId) {
                let memberCardDto = res.value[0];
                memberCardDto.memberTypeDiscount = util.moneyToFloat(memberCardDto.memberTypeDiscount);
                memberCardDto.memberBalance = util.moneyToFloat(memberCardDto.memberBalance);
                memberCardDto.memberIntegral = util.moneyToFloat(memberCardDto.memberIntegral);
                app.globalData.memberCardDtoObj[resId] = memberCardDto;
                this.data.memberCardDto && Object.assign(this.data.memberCardDto, memberCardDto);
                // _this.setData({memberCardDto});
            }
            _this.updateShopCart && _this.updateShopCart();
        });
    },
    /**
     * 设置导航栏信息
     * @param txt
     */
    setNavigationBarTitle(txt) {
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
     * 图片加载失败事件
     * @param e
     */
    imageError(e) {
        console.log(e)
    },
    /**
     * 打开module-popup弹框
     * @param str
     */
    openModule(str) {
        let data = {
            isMask: true,
            isTemplate: true
        };
        data[str] = str;
        this.setData(data);
    },
    /**
     * 关闭module-popup弹框
     * @param str
     * @param animated
     */
    closeModule(str, animated) {
        let that = this;
        let data = {
            isMask: false,
            isTemplate: false,
        };
        if (animated) {
            setTimeout(() => {
                data = {
                    isMask: false,
                    animated: false
                };
                that.setData(data);
            });
        }
        data[str] = '';
        this.setData(data);
    },
    /**
     * 转发分享事件
     * @param options
     * @returns {{title: string, path: string, success: success, fail: fail}}
     */
    onShareAppMessage(options) {
        let route = util.CurrentPages(),
            resId = this.data.resId,
            orderType = this.data.orderType,
            shopInfo = this.data.shopInfo,
            imageUrl = shopInfo ? this.data.imageServer + shopInfo.resLogo : null,
            path = '/' + route,
            data = {resId, orderType, isShare: 1};
        if (!this.data.isShareCurrentPage) {
            path = '/pages/shop/home/home'
        }
        return {
            title: '欢迎光临' + shopInfo.resName,
            path: path + '?' + queryString.stringify(data),
            success: function (res) {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            fail: function (res) {
                wx.showToast({
                    title: '分享失败',
                    icon: 'success',
                    duration: 2000
                })
            }
        }
    },
    /**
     * 获取二维码桌台
     * @param qrCode
     * @param resId
     * @param bol
     * @returns {Promise}
     */
    getQRcodeTable(qrCode, resId, bol) {
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
                    apiService.getQRcodeTable({id}, (res) => {
                        try {
                            if (!res.value) {
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
                            if (resId) {
                                if (resId !== res.value.resId) {
                                    data.status = false;
                                    data.message = '非当前店铺二维码'
                                }
                            }
                            if (!bol) {
                                if (0 !== Number(res.value.type)) {
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
    setOrderType(info) {
        let data = {//默认堂食
            isOrderType: 0,
            text: '堂食'
        };

        if (this.data.orderType == 1) {
            data.isOrderType = 1;//外卖
            data.text = '外卖';
        } else if (info) {
            data = this.getOrderType(info)
        }
        this.setNavigationBarTitle(data.text + ' - ' + this.data.text);
        this.setData(data);
    },
    getOrderType(info) {
        let data = {
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
        return data;
    }
};