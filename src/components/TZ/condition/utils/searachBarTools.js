
import { isNumber, isIntegerNum, checkMAC, checkIP, checkPort, checkDecimal, checkIpSegment, checkIPV6 } from "@LIB/regex.js"

class SearachBarTools {
    constructor() {
        /**
          * 验证消息模板
          */
        this.message = {

            NORMAL_NUMBER_MESSAGE: "请输入整数 ！",
            NORMAL_IP_MESSAGE: "请输入正确的IP格式！",
            NORMAL_IPv6_MESSAGE: "IPv6格式只支持“等于/不等于”查询！",
            NORMAL_PORT_MESSAGE: "请输入正确的端口格式！",
            NORMAL_MAC_MESSAGE: "请输入正确的MAC格式！",
            NORMAL_DECIMAL_MESSAGE: "请输入至少保留两位小数的数值 ！",
        };

        // 状态码
        this.statusCode = {
            error: 2,
            success: 1,
            empty: 0
        }
    }

    // 当前模式是否为区间
    isRange(key) {
        return ["range", "notRange"].includes(key)
    }
    // 值是否为空 （下拉框 全部-999 代表空）
    valueIsEmpty(value) {
        if (typeof value === 'object') {
            if (value && !value[0] && !value[1]) {
                return true
            }
        } else {
            if (value === '-999') {
                return true
            }
            if (!value || value.length === 0) {
                return true
            }
        }
        return false
    }
    // 获取字段类型 
    getTypeList() {
        let fieldTypeList = {
            string: { label: '字符串', modeList: ['equal', 'notEqual'] },
            ip: { label: 'IP', modeList: ['equal', 'notEqual', 'range', 'notRange'] },
            port: { label: '端口', modeList: ['equal', 'notEqual', 'range', 'notRange'] },
            time: { label: '时间', modeList: ['range', 'notRange'] },
            number: { label: '数值', modeList: ['equal', 'notEqual'] },
            mac: { label: 'MAC', modeList: ['equal', 'notEqual'] },
            password: { label: '密码', modeList: ['equal', 'notEqual'] }
        };
        return fieldTypeList;
    }

    // 获取模式 label
    getModeTitle(key) {
        let ma = {
            equal: { label: '等于', text: "=" },
            notEqual: { label: '不等于', text: "!=" },
            range: { label: '区间', text: "=" },
            notRange: { label: '区间非', text: "!=" },
            contain: { label: '包含', text: "包含" },
            notContain: { label: '不包含', text: "不包含" },
            start: { label: '开始', text: "开始" },
            end: { label: '结束', text: "结束" },
            notEnd: { label: '结束非', text: "结束非" },
        };
        return ma[key] || {};
    }

    /**
        * 验证Number类型的值合法性（是否在指定区间）
        *
        * @method validateNumber 
        * @param  {string} value 必填 待验证的值
        */
    validateNumber(value, min = 0, max = 0) {
        if (isNumber(value) || isIntegerNum(value)) {
            let val = parseInt(value)
            if (min === max || !max) {
                return true;
            }

            return (min <= val) && (val <= max)
        }
        return false
    }

    /**
     * 验证区间大于的情况
     *
     * @method validateGreaterThan 
     * @param {string} l 必填 区间左侧的值
     * @param {string} r 必填 区间右侧的值
     * @return {object} true/false
     */
    validateGreaterThan(l, r, type) {
        //如果都为空 则返回失败
        if (l === '' && r === '') {
            return false;
        }

        //如果 左或者有 有一个为空 则判定通过
        if (l === '' || r === '') {
            return true;
        }

        if (type === "IP") {
            return checkIpSegment(l, r)
        }

        if (type !== 'NUMBER') {
            l = l.replace(/\./g, '');
            r = r.replace(/\./g, '');
        }
        return parseInt(l) <= parseInt(r); //其他类型
    }
    /**
     * 验证区间
     */
    validateRange(type, valueObj, min = 0, max = 0) {
        let left = valueObj[0] ?? '';
        let right = valueObj[1] ?? '';
        let fieldType = type.toLocaleUpperCase(); // 字段类型
        let isTrue = false;

        if (left === '' && right === '') {
            return {
                code: 0,  // 0 代表空
                message: "区间不能为空！"
            }
        }
        switch (fieldType) {
            case "NUMBER":
                isTrue = false;
                if (left || left == 0) {
                    isTrue = this.validateNumber(left, min, max)
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `起始值应为${min}-${max}的整数！`
                        }
                    }
                }
                if (right || right == 0) {
                    isTrue = this.validateNumber(right, min, max)
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `起始值应为${min}-${max}的整数！`
                        }
                    }
                }
                break;
            case "IP":
                if (left) {
                    isTrue = checkIP(left);
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `区间起始值应为合法的IPv4格式！`
                        }
                    }
                }
                if (right) {
                    isTrue = checkIP(right);
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `区间结束值应为合法的IPv4格式！`
                        }
                    }
                }
                break;
            case "PORT":
                if (left) {
                    isTrue = checkPort(left);
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `区间起始值应为合法的端口格式！`
                        }
                    }
                }
                if (right) {
                    isTrue = checkPort(right);
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `区间结束值应为合法的端口格式！`
                        }
                    }
                }
                break;
            case "DECIMAL":
                if (left) {
                    isTrue = checkDecimal(left);
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `区间起始值应为至少保留两位小数的数值！`
                        }
                    }
                }
                if (right) {
                    isTrue = checkDecimal(right);
                    if (!isTrue) {
                        return {
                            code: this.statusCode.error,
                            message: `区间结束值应为至少保留两位小数的数值！`
                        }
                    }
                }
                break;
        }

        var isGreaterThan = this.validateGreaterThan(left, right, fieldType);
        return {
            code: isGreaterThan ? this.statusCode.success : this.statusCode.error,
            message: isGreaterThan ? "验证通过。" : "区间起始值应小于区间结束值！"
        }
    }

    // 验证普通格式
    validateValue(type, val, min = 0, max = 0) {
        let fieldType = type; // 字段类型
        let obj = {};
        let value = val ?? '';
        if (value === '') {
            return {
                code: this.statusCode.empty,
                message: "内容不能为空！"
            }
        }
        switch (fieldType.toLocaleUpperCase()) {
            case "NUMBER":
                obj = {
                    code: this.validateNumber(value, min, max) ? this.statusCode.success : this.statusCode.error,
                    message: this.message.NORMAL_NUMBER_MESSAGE
                }
                break;
            case "MAC":
                obj = {
                    code: checkMAC(value) ? this.statusCode.success : this.statusCode.error,
                    message: this.message.NORMAL_MAC_MESSAGE
                }
                break;
            case "IP":
                obj = {
                    code: checkIP(value) || checkIPV6(value) ? this.statusCode.success : this.statusCode.error,
                    message: this.message.NORMAL_IP_MESSAGE
                }
                break;
            case "PORT":
                obj = {
                    code: checkPort(value) ? this.statusCode.success : this.statusCode.error,
                    message: this.message.NORMAL_PORT_MESSAGE
                }
                break;
            case "DECIMAL":
                obj = {
                    code: checkDecimal(value) ? this.statusCode.success : this.statusCode.error,
                    message: this.message.NORMAL_DECIMAL_MESSAGE
                }
                break;
            case "TIME":
            case "STRING":
            case "DEFAULT":
                obj = {
                    code: value || value == 0 ? this.statusCode.success : this.statusCode.error,
                    message: "数据不能为空！"
                }
                break;
        }
        return obj
    }

    // 通用验证
    validateModelByValue(fieldModel, op, val) {
        // 如果是区间
        if (this.isRange(op)) {
            if (!val || (val.length === 0 || (!val[0] && !val[1]))) {
                return {
                    code: this.statusCode.empty,
                    message: "区间不能为空！"
                }
            }
            return this.validateRange(fieldModel.type, val, fieldModel.min, fieldModel.max)
        } else {
            // 如果是下拉框 只需要判断是否有值
            if (fieldModel.dropDownList && fieldModel.dropDownList.length > 0) {
                return {
                    code: val === "-999" ? 0 : 1,
                    message: "请选择一项数据！"
                }
            }
            return this.validateValue(fieldModel.type, val, fieldModel.min, fieldModel.max)
        }
    }

    // 获取条件对象格式
    getFormatCondition(field, machType, value, connector = "and") {
        let isr = this.isRange(machType);
        let condition = {
            connector: connector || "and",
            field: field,
            op: machType,
        }
        condition.value = isr ? (value[0] + " - " + value[1]) : value
        return condition
    }

    // 格式化列
    getColumnFormat(d) {
        let dropDownList = d.dropDownList && d.dropDownList.length ? (d.dropDownList ?? []).map(d => {
            return {
                label: d.value,
                value: d.key
            }
        }) : null;

        return {
            value: d.field,
            label: d.displayText,
            matchList: d.machTypes,
            type: d.dropDownList && d.dropDownList.length > 0 ? 'string' : d.type,
            min: (d.min !== d.max && d.min) || null,
            max: (d.min !== d.max && d.max) || null,
            dropDownList: dropDownList
        }
    }

    /* 查找重复项   
       list Array 父数组
       newValue Object 子对象
       notIndex Number 过滤的索引  
    */
    findRepeat(list, newVal, notIndex = -1) {
        return list.some((d, inx) =>
            d.connector === newVal.connector &&
            d.field === newVal.field &&
            d.op === newVal.op &&
            d.value === newVal.value &&
            notIndex !== inx
        )
    }
}

export default new SearachBarTools()

