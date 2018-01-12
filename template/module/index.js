let EVENTS = {};
const ApiService = require('../../utils/ApiService'),
    util = require('../../utils/util'),
    RegExpUtil = require('../../utils/RegExpUtil');
let modulePopup = {
    azm_modulePopup_show() {
        let that = this, data = arguments[0],
            obj = {
                isMask: true,
                isLoading: data.isLoading || true,
                isDisabled: false,
                isAnimated: data.isAnimated || false,
                title: data.title,
                data: data.data,
                tableContent: `table-${data.type}`,
            };
        if (util.trim(data.type)) {
            obj.version = 1;
        }
        if (data.confirmText || data.cancelText) {
            obj.footer = {
                confirmText: data.confirmText || '是',
                cancelText: data.cancelText || '否',
                cancelColor: '#f74b7b',
                confirmColor: '#f74b7b',
                status: true
            }
        }
        if (!data.type) return;
        EVENTS.type = data.type;
        EVENTS.success = data.success;
        EVENTS.fail = data.fail;
        EVENTS.verify = data.verify;
        EVENTS.complete = data.complete;
        EVENTS.data = data.data;
        let _data = {
            isMask: true,
            isTemplate: true
        };
        _data[data.type] = data.type;
        _data[`isAnimated`] = true;
        if (that.data[`${data.type}Data`] && that.data[`${data.type}Data`].AnimatedTimeout) {
            clearTimeout(that.data[`${data.type}Data`].AnimatedTimeout);
            that.setData({
                [`${data.type}Data.isAnimated`]: false
            })
        }
        that.setData(Object.assign(_data, {
            [`${data.type}Data`]: obj
        }));
    },
    azm_modulePopup_success(e) {
        let that = this,
            type = e.currentTarget.dataset.type,
            active = e.currentTarget.dataset.active,
            select = e.currentTarget.dataset.select,
            value = e.detail.value, confirm = false, cancel = false;
        if (EVENTS.verify && EVENTS.verify(value)) {
            success();
        } else if (EVENTS.verify === undefined) {
            success();
        }

        function success() {
            try {
                if (!type) type = e.detail.target.dataset.type;
                that.azm_closeModule(EVENTS.type);//关闭弹框
            } catch (e) {
                console.log('azm_modulePopup_success调用失败');
            }
            if (type === 'confirm') {
                confirm = true;
            } else if (type === 'confirm') {
                cancel = true;
            }
            EVENTS.success && EVENTS.success({
                confirm,
                cancel,
                active,
                select,
                value,
                data: EVENTS.data,
                target: e
            });
            EVENTS.complete && EVENTS.complete({
                confirm,
                cancel,
                active,
                select,
                value,
                data: EVENTS.data,
                target: e
            });
        }
    },
    azm_modulePopup_fail(e) {
        console.log(e);
        let that = this,
            type = e.currentTarget.dataset.type,
            select = e.currentTarget.dataset.select,
            active = e.currentTarget.dataset.active,
            cancel = true,
            value = e.detail.value;
        that.azm_closeModule(EVENTS.type);
        EVENTS.fail && EVENTS.fail({
            cancel,
            active,
            select,
            type,
            value,
            data: EVENTS.data,
            target: e
        });
        EVENTS.complete && EVENTS.complete({
            cancel,
            active,
            select,
            type,
            value,
            data: EVENTS.data,
            target: e
        });
    },
    azm_modulePopup_bindinput(e) {
        // console.log(e);
        let type = e.currentTarget.dataset.type,
            value = e.detail.value;
        this.setData({
            [`${EVENTS.type}Data.data.${type}`]: util.trim(value)
        })
    },
    azm_modulePopup_getSmsCode(e) {
        let that = this;
        if (EVENTS.isSmsCode) {
            return;
        }
        let mobile = e.currentTarget.dataset.mobile;
        mobile = util.trim(mobile);
        if (!mobile) {
            util.failToast('手机号码为空');
            return;
        } else if (!RegExpUtil.isPhone(mobile)) {
            util.failToast('手机格式错误');
            return;
        }
        that.setData({
            [`${EVENTS.type}Data.data.focus_code`]: 1
        });
        EVENTS.isSmsCode = true;
        ApiService.getSmsCode(
            {"mobile": mobile, msgTemp: "SMS_DEFAULT_CONTENT"},
            function (rsp) {
                if (2000 == rsp.code) {
                    util.showToast('验证码已发送');
                    new util.Countdown(that, {
                        time: 60 * 1000,
                        type: 'ss',
                        module: EVENTS.type,
                        text: 'ClockCode',
                        onEnd() {

                        }
                    });
                }
            },
            (rsp) => {
                if (!rsp.status) {
                    util.failToast('验证码发送失败');
                }
                EVENTS.isSmsCode = false;
            });
    },
    /**
     * 关闭module-popup弹框
     * @param str
     * @param animated
     */
    azm_closeModule(str, animated) {
        let that = this;
        let data = {
            isMask: false,
            isTemplate: false,
        };
        if (that.data[`${str}Data`]) {
            that.data[`${str}Data`].AnimatedTimeout = setTimeout(() => {
                this.setData({
                    [`${str}Data.isAnimated`]: false
                });
            }, 300);
            if (that.data[`${str}Data`].azm_ClockCode) {
                that.data[`${str}Data`].azm_ClockCode.clear()
            }
            data[`${str}Data.data`] = {};
            data[`${str}Data.isMask`] = false;
            data[`${str}Data.isLoading`] = false;
            data[`${str}Data.isDisabled`] = false;
        }
        data[str] = '';
        this.setData(data);
    },
};

function ModulePopup() {
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    this.__page = curPage;
    Object.assign(curPage, modulePopup);
    curPage.modulePopup = this;
    return this;
}

module.exports = {
    ModulePopup
};