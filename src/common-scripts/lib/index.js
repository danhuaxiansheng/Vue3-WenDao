/**
 * @param { String } url
 * @returns { Object }
 */
export function getQueryObject(url) {
    url = url === null ? window.location.href : url
    const search = url.substring(url.lastIndexOf('?') + 1)
    const obj = {}
    const reg = /([^?&=]+)=([^?&=]*)/g
    search.replace(reg, (rs, $1, $2) => {
        const name = document.decodeURIComponent($1)
        let val = document.decodeURIComponent($2)
        val = String(val)
        obj[name] = val
        return rs
    })
    return obj
}

/**
 * @param { String } input value
 * @returns { Number } output value
 */
export function byteLength(str) {
    let s = str.length
    for (let i = str.length - 1; i >= 0; i--) {
        const code = str.charCodeAt(i)
        if (code > 0x7f && code <= 0x7ff) s++
        else if (code > 0x7ff && code <= 0xffff) s += 2
        if (code >= 0xDC00 && code <= 0xDFFF) i--
    }
    return s
}
/**
 * @param { String } url
 * @returns { Object }
 */
export function param2Obj(url) {
    const search = url.split('?')[1]
    if (!search) {
        return {}
    }
    return JSON.parse(
        '{"' +
        decodeURIComponent(search)
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"')
            .replace(/\+/g, ' ') +
        '"}'
    )
}

/**
 * @param { HTMLElement } element
 * @param { string } className
 */
export function toggleClass(element, className) {
    if (!element || !className) {
        return
    }

    let classString = element.className
    const nameIndex = classString.indexOf(className)

    if (nameIndex === -1) {
        classString += '' + className
    } else {
        classString = classString.substr(0, nameIndex) +
            classString.substr(nameIndex + className.length)
    }

    element.className = className
}

/**
 * Check if an element has a class
 * @param { HTMLElement } elm
 * @param { String } cls
 * @returns { Boolean }
 */
export function hasClass(ele, cls) {
    return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param { HTMLElement } elm
 * @param { String } cls
 */
export function addClass(ele, cls) {
    if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param { HTMLElement } elm
 * @param { String } cls
 */
export function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
        ele.className = ele.className.replace(reg, ' ')
    }
}

/**
 * @param { Function } func
 * @param { Number } wait
 * @param { Boolean } immediate
 * @return { * }
 */
export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result

    const later = function () {
        // 距上次触发时间间隔
        const last = +new Date() - timestamp

        // 上次被包装函数调用时间间隔 last 小于设定时间间隔 wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last)
        } else {
            timeout = null

            // 如果设定为 immediate === true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args)
                if (!timeout) context = args = null
            }
        }
    }

    return function (...args) {
        context = this
        timestamp = +new Date()
        const callNow = immediate && !timeout
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait)
        if (callNow) {
            result = func.apply(context, args)
            context = args = null
        }

        return result
    }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param { Object } source
 * @returns { Object }
 */
export function deepClone(source) {
    if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'deepClone')
    }

    const targetObj = source.constructor === Array ? [] : {}

    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            deepClone(source[keys])
        } else {
            targetObj[keys] = source[keys]
        }
    })

    return targetObj
}

/**
 * Unique String
 * @returns { String }
 */
export function createUniqueString() {
    const timestamp = +new Date() + ''
    const randomNum = parseInt((1 + Math.random()) * 65536) + ''
    return (+(randomNum + timestamp)).toString(32)
}

/**
 * 二叉搜索
 * @param { Array } arr 源数组
 * @param { Object } item 查找的目标
 * @param { Function } compareFunc 比较方法, 传入两个参数 a,b, 若返回 大于0 则表示 a > b, 小于 0 则 a < b
 * @return { Number } item 所处的 index
 *
 */
export function binarySearch(arr, item, compareFunc) {
    let start = 0;
    let end = arr.length;
    let current = Math.floor(arr.length / 2);
    while (end != current) {
        if (compareFunc(item, arr[current]) > 0) {
            start = current + 1;
        } else {
            end = current;
        }

        current = Math.floor((start + end) / 2);
    }
    return current;
}


/**
 * 分页获取数据
 * @param {Array} data 源数据
 * @param {number} [page=1] 当前页面，1开始
 * @param {number} [size=10] 页大小，默认10
 * @return {Array}
 */
export function pager(data, page = 1, size = 10) {
    if (!data) return []
    const start = (page - 1) * size
    const end = start + size
    return data.length > start ? data.slice(start, end) : []
}
