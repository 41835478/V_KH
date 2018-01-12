// function handle(e, num) {
//     var dataset = e.currentTarget.dataset;
//     var componentId = dataset.componentId;
//     var disabled = dataset.disabled;
//     var stepper = +dataset.stepper;
//
//     if (disabled) return null;
//
//     callback.call(this, componentId, stepper + num);
// }
//
// function callback(componentId, stepper) {
//     stepper = +stepper;
//     var e = {componentId, stepper};
//     console.info('[zan:stepper:change]', e);
//
//     if (this.handleZanStepperChange) {
//         this.handleZanStepperChange(e);
//     } else {
//         console.warn('页面缺少 handleZanStepperChange 回调函数');
//     }
// }
//
// var Stepper = {
//     _handleZanStepperMinus(e) {
//         handle.call(this, e, -1);
//     },
//
//     _handleZanStepperPlus(e) {
//         handle.call(this, e, +1);
//     },
//
//     _handleZanStepperBlur(e) {
//         var dataset = e.currentTarget.dataset;
//         var componentId = dataset.componentId;
//         var max = +dataset.max;
//         var min = +dataset.min;
//         var value = e.detail.value;
//
//         if (!value) {
//             setTimeout(() => {
//                 callback.call(this, componentId, min);
//             }, 16);
//             callback.call(this, componentId, value);
//             return '' + value;
//         }
//
//         value = +value;
//         if (value > max) {
//             value = max;
//         } else if (value < min) {
//             value = min;
//         }
//
//         callback.call(this, componentId, value);
//
//         return '' + value;
//     }
// };
//
//
// module.exports = Stepper;


let EVENTS = {};

let stepper = {
    azm_stepper_initstall() {
        let that = this, data = arguments[0],
            obj = {
                isMask: true,
                type: data.type,
                isLoading: data.isLoading || true,
                isDisabled: false,
                isAnimated: data.isAnimated || false,
                title: data.title,
                data: data.data,
                tableContent: `picker-view-${data.type}`,
            };
        if (data.confirmText || data.cancelText) {
            obj.footer = {
                confirmText: data.confirmText || '是',
                cancelText: data.cancelText || '否',
                cancelColor: '',
                confirmColor: '',
                status: true
            };
            if (data.cancelColor) {
                obj.footer.cancelColor = `background-color: ${data.cancelColor};color: #fff`
            }
            if (data.confirmColor) {
                obj.footer.confirmColor = `background-color: ${data.confirmColor};color: #fff`
            }
        }
        if (!data.type) return;
        EVENTS.type = data.type;
        EVENTS.success = data.success;
        EVENTS.fail = data.fail;
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
            });
        }
        that.setData(Object.assign(_data, {
            [`${data.type}Data`]: obj
        }));
    },
    azm_stepper_blur(e) {
        var dataset = e.currentTarget.dataset;
        var componentId = dataset.componentId;
        var max = +dataset.max;
        var min = +dataset.min;
        var value = e.detail.value;

        value = +value;
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        }

        let that = this,
            type = e.currentTarget.dataset.type,
            active = e.currentTarget.dataset.active,
            select = e.currentTarget.dataset.select,
            confirm = false, cancel = false;
        try {
            if (!type) type = e.detail.target.dataset.type;
            that.azm_closePickerView(EVENTS.type);//关闭弹框
        } catch (e) {
            console.log('azm_stepper_blur调用失败');
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
    },
    azm_stepper_plus(e) {
        this.azm_stepper_blur(e, 1)
    },
    azm_stepper_minus(e) {
        this.azm_stepper_blur(e, -1)
    },
};

function Stepper() {
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    this.__page = curPage;
    Object.assign(curPage, stepper);
    curPage.stepper = this;
    return this;
}

module.exports = {
    Stepper
};
