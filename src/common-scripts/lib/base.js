/**
 * [Javascript core]: 常用工具函数扩展
 */

/**
 * 判断变量的值是否是 undefined
 * Determines whether or not the provided object is undefined
 *
 * @method isUndefined
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的值是 undefined 时返回 true
 */
export function isUndefined(o) {
  return typeof o === "undefined";
}

/**
 * 判断变量的值是否是 null
 * Determines whether or not the provided object is null
 *
 * @method isNull
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的值是 null 时返回 true
 */
export function isNull(o) {
  return o === null;
}

/**
 * 判断变量的值是否为undefined、null、空字符串
 * Determines whether or not the provided object is null
 *
 * @method isNull
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的值是 undefined、null、空字符串 时返回 true
 */
export function isNullOrEmpty(o) {
  if (typeof o === "undefined" || o === null || o === "") return true;
  else return false;
}

/**
 * 判断变量的类型是否是 Number
 * Determines whether or not the provided object is a number
 *
 * @memberOf Uis.prototype
 * @name isNumber
 * @function
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 number 时返回 true
 */
export function isNumber(o) {
  return (o === 0 || o) && o.constructor === Number;
}

/**
 * 判断变量的类型是否是 Boolean
 * Determines whether or not the provided object is a boolean
 *
 *
 * @method isBoolean
 * @memberOf Uis.prototype
 *
 * @static
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 boolean 时返回 true
 */
export function isBoolean(o) {
  return (o === false || o) && o.constructor === Boolean;
}

/**
 * 判断变量的类型是否是 String
 * Determines whether or not the provided object is a string
 *
 *
 * @method isString
 * @memberOf Uis.prototype
 *
 * @static
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 string 时返回 true
 */
export function isString(o) {
  return (o === "" || o) && o.constructor === String;
}

/**
 * 判断变量的类型是否是 Date
 * Determines whether or not the provided object is a Date
 *
 *
 * @method isDate
 * @memberOf Uis.prototype
 *
 * @static
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 Date 时返回 true
 */
export function isDate(obj) {
  return typeof obj == "object" && obj.constructor == Date;
}

/**
 * 判断变量的类型是否是 Object
 * Determines whether or not the provided object is a object
 *
 *
 * @method isObject
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 object 时返回 true
 */
export function isObject(o) {
  return (
    o &&
    (o.constructor === Object ||
      Object.prototype.toString.call(o) === "[object Object]")
  );
}

/**
 * 判断变量的类型是否是 Array
 * Determines whether or not the provided object is a array
 *
 *
 * @method isArray
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 array 时返回 true
 */
export function isArray(o) {
  return (
    o &&
    (o.constructor === Array ||
      Object.prototype.toString.call(o) === "[object Array]")
  );
}

/**
 * 判断变量的类型是否是 Arguments
 * Determines whether or not the provided object is a arguments
 *
 *
 * @method isArguments
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 arguments 时返回 true
 */
export function isArguments(o) {
  return o && o.callee && isNumber(o.length) ? true : false;
}

/**
 * 判断变量的类型是否是 Function
 * Determines whether or not the provided object is a function
 *
 *
 * @method isFunction
 * @memberOf Uis.prototype
 *
 * @param {Mixed} o 传入被检测变量的名称
 * @return {Boolean} 当 o 的类型是 function 时返回 true
 */
export function isFunction(o) {
  return o && o.constructor === Function;
}
