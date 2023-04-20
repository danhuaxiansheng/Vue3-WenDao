/**
 * 格式化数字显示方式
 * @param { Number } num 要格式化的数字
 * @param { RegExp } pattern 格式
 * @example
 * formatNumber(12345.999,'#,##0.00');
 *  // out: 12,34,5.99
 * formatNumber(12345.999,'0');
 *  // out: 12345
 * formatNumber(1234.888,'#.0');
 *  // out: 1234.8
 * formatNumber(1234.888,'000000.000000');
 *  // out: 001234.888000
 */
export function formatNumber(num, pattern) {
    let strarr = num ? num.toString().split('.') : ['0'];
    let fmtarr = pattern ? pattern.split('.') : [''];
    let retstr = '';

    // 整数部分
    let str = strarr[0];
    let fmt = fmtarr[0];
    let i = str.length - 1;
    let comma = false;
    for (let f = fmt.length - 1; f >= 0; f--) {
        switch (fmt.substr(f, 1)) {
            case '':
                if (i >= 0)
                    retstr = str.substr(i--, 1) + retstr;
                break;
            case '0':
                if (i >= 0)
                    retstr = str.substr(i--, 1) + retstr;
                else
                    retstr = '0' + retstr;
                break;
            case ',':
                comma = true;
                retstr = ',' + retstr;
                break;
        }
    }
    if (i >= 0) {
        if (comma) {
            let l = str.length;
            for (; i >= 0; i--) {
                retstr = str.substr(i, 1) + retstr;
                if (i > 0 && ((l - i) % 3) == 0)
                    retstr = ',' + retstr;
            }
        } else
            retstr = str.substr(0, i + 1) + retstr;
    }

    retstr = retstr + '.';
    // 处理小数部分
    str = strarr.length > 1 ? strarr[1] : '';
    fmt = fmtarr.length > 1 ? fmtarr[1] : '';
    i = 0;
    for (let f = 0; f < fmt.length; f++) {
        switch (fmt.substr(f, 1)) {
            case '':
                if (i < str.length)
                    retstr += str.substr(i++, 1);
                break;
            case '0':
                if (i < str.length)
                    retstr += str.substr(i++, 1);
                else
                    retstr += '0';
                break;
        }
    }
    return retstr.replace(/^,+/, '').replace(/\.$/, '');
}

/**
 * 生成随机整数，范围是[min, max]
 *
 * @param 	{ Number } min 	随机整数的最小值
 * @param 	{ Number } max 	随机整数的最大值
 * @return 	{ Number } 		生成的随机整数
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 将字节转为数据容量单位（B、KB、MB、GB）
 *
 * @param { String } byte 传入的字节数
 * @param { String } fixNum 保留小数点位数
 * @return { String } 返回生成的时间戳格式字符串
 */
export function byteToSize(byte, fixNum) {
    if (!byte) return "未知";
    if (byte < 1024) return byte + "B";
    else if (byte < 1024 * 1024) return (byte / 1024).toFixed(fixNum) + "KB";
    else if (byte < 1024 * 1024 * 1024) return (byte / 1024 / 1024).toFixed(fixNum) + "MB";
    else return (byte / 1024 / 1024 / 1024).toFixed(fixNum) + "GB";
}

/**
 * getScientNum 数字转为科学计数法
 *
 * @param { Number } num
 * @type Object
 */
export function getScientNum(num) {
    num = num.toString();
    let numLength = num.length;
    let newNum = "";
    if (numLength <= 3) return num;
    newNum = "," + num.substring(numLength - 3, numLength);

    if (numLength >= 4 && numLength <= 6)
        newNum = num.substring(0, numLength - 3) + newNum;

    else {
        newNum = "," + num.substring(numLength - 6, numLength - 3) + newNum;

        if (numLength >= 7 && numLength <= 9)
            newNum = num.substring(0, numLength - 6) + newNum;

        if (numLength >= 10 && numLength <= 12) {
            newNum = "," + num.substring(numLength - 9, numLength - 6) + newNum;
            newNum = num.substring(0, numLength - 9) + newNum;
        }
    }
    return newNum;
}

/**
 * getSerno 获取随机数
 */
export function getSerno() {
    let DaysToMonth365 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365],
        DaysToMonth366 = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366],
        numArray = [],
        date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate();
    function _isLeapYear(year) {
        if ((year % 4) !== 0) {
            return false;
        }
        if ((year % 100) === 0) {
            return ((year % 400) === 0);
        }
        return true;
    }
    numArray = _isLeapYear(year) ? DaysToMonth366 : DaysToMonth365;
    if ((day >= 1) && (day <= (numArray[month] - numArray[month - 1]))) {
        let num = year - 1,
            num2 = ((((((num * 365) + (num / 4)) - (num / 100)) + (num / 400)) + numArray[month - 1]) + day) - 1;
        return (num2 * 864000000000);
    }
}
