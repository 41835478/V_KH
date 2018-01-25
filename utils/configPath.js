"use strict";
const api = {
    /**
     * 获取openid  API
     */
    getOpenId: {
        path: '/microcode/getOpenId',
        query: {}
    },
    /**
     * 获取平台用户信息
     */
    getCommonUserInfo: {
        path: '/commonUser/getCommonUserInfo',
        query: {}
    },
    /**
     * 更新平台用户信息
     */
    updateCommonUserInfo: {
        path: '/commonUser/updateCommonUserInfo',
        query: {}
    },
    /**
     * 申请会员卡  API
     */
    applyMember: {
        path: '/microcode/applyMember',
        query: {
            name: '',//String *
            birthday: '',//2017-10-24 00:00:00 *
            sex: 0,//0：无 1：男 2：女 *
            provinceId: '',//省
            cityId: '',//市
            objId: '',//*
            token: '',//*
            resId: '',//*
        }
    },
    /**
     * 判断时候为首次使用获取openid  API
     */
    newCheckIsFirstUse: {
        path: '/microcode/newCheckIsFirstUse',
        query: {}
    },
    /**
     * 获取会员拉列表  API
     */
    getMemberCardList: {
        path: '/microcode/getMemberCardList',
        query: {}
    },
    /**
     * 二维码获取列表
     */
    getQRcodeTable: {
        path: '/qrtable/getQRcodeTable',
        query: {}
    },
    /**
     * 新增用户会员列表
     */
    checkIsFirstUse: {
        path: '/microcode/checkIsFirstUse',
        query: {}
    },
    /**
     * 获取是否绑定手机号
     */
    checkBindMobile: {
        path: '/microcode/checkBindMobile',
        query: {}
    },
    checkMemberBindMobile: {
        path: '/microcode/checkMemberBindMobile',
        query: {}
    },
    checkMember: {
        path: '/microcode/checkMember',
        query: {}
    },
    /**
     * 获取菜品列表
     */
    getFoodList: {
        path: '/food/getFoodList',
        query: {}
    },
    /**
     * 获取菜品tab分类
     */
    findFoodCatalogList: {
        path: '/foodCatalog/findFoodCatalogList  ',
        query: {}
    },
    /**
     * 获取规格列表
     */
    getFoodRuleList: {
        path: '/foodRule/getFoodRuleList',
        query: {}
    },
    /**
     * 获取套餐子菜列表
     */
    findFoodPackage: {
        path: '/foodPackage/findFoodPackage',
        query: {}
    },
    /**
     * 获取口味列表
     */
    getFoodPracticesList: {
        path: '/foodPractices/getFoodPracticesList',
        query: {}
    },
    /**
     * 获取点餐店铺列表
     */
    getResDetail: {
        path: '/microcode/getResDetail',
        query: {}
    },
    /**
     * 绑定手机
     */
    bindWechatUser: {
        path: '/microcode/bindWechatUser',
        query: {}
    },
    /**
     * 绑定手机
     */
    bindMobile: {
        path: '/microcode/bindMobile',
        query: {}
    },
    /**
     * 获取店铺首页信息
     */
    getMainInfo: {
        path: '/microcode/getMainInfo',
        query: {}
    },
    /**
     * 获取店铺banner
     */
    getCommonBannerList: {
        path: '/banner/getCommonBannerList ',
        query: {}
    },
    /**
     * 获取桌位列表
     */
    findTableDtoList: {
        path: '/table/findTableDtoList',
        query: {}
    },
    /**
     * 提交订单
     */
    commitOrder: {
        path: '/microcode/commitOrder',
        query: {}
    },
    /**
     * 获取订单详情
     */
    getOrderDetail: {
        path: '/microcode/getOrderDetail',
        query: {}
    },
    /**
     * 检查是否存在未结账的消费者
     */
    checkHasWaitPayConsumer: {
        path: '/microcode/checkHasWaitPayConsumer',
        query: {}
    },
    /**
     * 验证会员卡支付验证码
     */
    checkSmsCodeByOpenId: {
        path: '/sms/checkSmsCodeByOpenId',
        query: {}
    },
    /**
     * 会员卡支付
     */
    memberCardPay: {
        path: '/microcode/memberCardPay',
        query: {}
    },
    /**
     * 获取验证码
     */
    getSmsCode: {
        path: '/sms/getSmsCode',
        query: {}
    },
    /**
     * 支付获取验证码
     */
    getSmsCodeByConn: {
        path: '/sms/getSmsCodeByConn',
        query: {}
    },
    /**
     * 获取订单列表
     */
    getOrderList: {
        path: '/microcode/getOrderList',
        query: {}
    },
    /**
     * 微信支付
     */
    finishPay: {
        path: '/microcode/finishPay',
        query: {}
    },
    /**
     * 微信支付接口
     */
    wxPayForH5: {
        path: '/wxpay/wxPayForH5',
        query: {}
    },
    /**
     * 修改收货地址
     */
    updateConsigneeAddress: {
        path: '/consigneeAddress/updateConsigneeAddress',
        query: {}
    },
    /**
     * 新增地址
     */
    addAddress: {
        path: '/consigneeAddress/addAddress',
        query: {}
    },
    /**
     * 设置默认地址
     */
    setDefaultAddress: {
        path: '/consigneeAddress/setDefaultAddress',
        query: {}
    },
    /**
     * 设置默认地址
     */
    deleteConsigneeAddress: {
        path: '/consigneeAddress/deleteConsigneeAddress',
        query: {}
    },
    /**
     * 设置默认收货地址
     */
    loadDefaultAddress: {
        path: '/consigneeAddress/loadDefaultAddress',
        query: {}
    },
    /**
     * 获取收货地址列表
     */
    loadAddressList: {
        path: '/consigneeAddress/loadAddressList',
        query: {}
    },
    /**
     * 买单叫号
     */
    callAttendant: {
        path: '/microcode/callAttendant',
        query: {}
    },
    /**
     * 消息模板通知
     */
    sendMiniWxTemplateMsg: {
        path: '/wechatTemplateMsg/sendTemplateMsgForMini',
        query: {},
        templateIds: {
            OrderPaySuccess: 'TF3BoYwKtKDEuwhNt5tkcRmRs9DcdM5-8mIu72xYvUc'
        }
    },
    /**
     * 三级联动 - 省
     */
    getAllProvince: {
        path: '/region/getAllProvince',
        query: {}
    },
    /**
     * 三级联动 - 市/区
     */
    getRegionByPid: {
        path: '/region/getRegionByPid',
        query: {
            pid: ''
        }
    },
    /**
     * 订单跟踪
     */
    getOrderProcessList: {
        path: '/order/getOrderProcessList',
        query: {
            pid: ''
        }
    },
    /**
     * 预定营业规则信息
     */
    getReserveBusinessRules: {
        path: '/reserveBusinessRules/getReserveBusinessRules',
        query: {
            resId: ''
        }
    },
    /**
     * 提交预定订单
     */
    insertReserve: {
        path: '/reserve/insertReserve',
        query: {}
    },
    /**
     * 根据手机号获取验证码
     */
    getSmsCodeByMobile: {
        path: '/sms/getSmsCodeByMobile',
        query: {}
    },
    /**
     * 预定订单支付
     */
    memberPayReserve: {
        path: '/reserve/memberPayReserve',
        query: {}
    },
    /**
     * 预订订单详情
     */
    getReserveDetail: {
        path: '/reserve/getReserveDetail',
        query: {}
    },
    /**
     * 更新订单状态
     */
    updateReserve: {
        path: '/reserve/updateReserve',
        query: {}
    },
    /**
     * 更新订单状态
     */
    wxPayForReserve: {
        path: '/wxpay/wxPayForReserve',
        query: {}
    },
    /**
     * 预订订单列表
     */
    getReserveList: {
        path: '/reserve/getReserveList',
        query: {}
    },
    /**
     * 预订订单跟踪列表
     */
    getReserveProcessList: {
        path: '/reserveProcess/getReserveProcessList',
        query: {}
    },
}
module.exports = api;