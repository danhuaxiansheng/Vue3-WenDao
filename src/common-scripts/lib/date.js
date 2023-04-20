Date.prototype.addDays = function (d) {
  this.setDate(this.getDate() + d);
  return this;
};

Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    S: this.getMilliseconds(), //millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return format;
};

/**
 * Parse the time to string
 * @param {( Object | String | Number )} time
 * @param { String } cFormat
 * @returns { String | Null }
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null;
  }

  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;

  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string") {
      if (/^[0-9]+$/.test(time)) {
        time = parseInt(time);
      } else {
        time = time.replace(new RegExp(/-/gm), "/");
      }
    }

    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }

    date = new Date(time);
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };

  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });

  return time_str;
}

/**
 * @param { Number } time
 * @param { String } option
 * @returns { String }
 */
export function formatTime(time, option) {
  if (("" + time).length === 10) {
    time = parseInt(time) * 1000;
  } else {
    time = +time;
  }

  const d = new Date();
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return "刚刚";
  } else if (diff < 3600) {
    return Math.ceil(diff / 60) + " 分钟前";
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + " 小时前";
  } else if (diff < 3600 * 24 * 2) {
    return "1 天前";
  }

  if (option) {
    return parseTime(time, option);
  } else {
    return (
      d.getMonth() +
      1 +
      "月" +
      d.getDate() +
      "日" +
      d.getHours() +
      "时" +
      d.getMinutes() +
      "分"
    );
  }
}

/**
 * 获取某月有多少天
 *
 * @param { Number } year
 * @param { Number } month
 * @return { String }
 * @example
 **/
export function getLastDay(year, month) {
  month = month > 12 ? 11 : month++;
  year = month > 12 ? year++ : year;

  let newDate = new Date(year, month, 1);
  return new Date(newDate.getTime() - 1000 * 60 * 60 * 24).getDate();
}

/**
 * 获取上一月
 *
 * @return { Object } 返回年份和月份 { timeStr:2018-12 ,date:{ year:2018,month:12 } }
 * @example
 *      getLastMonth();
 **/
export function getLastMonth(_date) {
  let year = _date.getFullYear(),
    month = _date.getMonth();

  if (month === 0) {
    year -= 1;
    month = 12;
  }

  return {
    timeStr: year + "-" + month,
    date: { year: year, month: month, days: getLastDay(year, month) },
  };
}

/**
 * 获取下一月
 *
 * @return { Object } 返回年份和月份 { timeStr:2018-12 ,date:{ year:2018,month:12 } }
 * @example
 *      getNextMonth();
 **/
export function getNextMonth(_date) {
  let year = _date.getFullYear(),
    month = _date.getMonth() + 2;
  if (month > 11) {
    year += 1;
    month = 1;
  }
  return {
    timeStr: year + "-" + month + "-1",
    date: { year: year, month: month, days: getLastDay(year, month) },
  };
}

/**
 * 获取最近多少天时间
 *
 * @memberOf date
 * @name getLatestDays
 * @function
 * @param {count} format 格式字符串
 * @return {String} 返回开始和结束时间 { t1: "2017-12-03", t2: "2017-12-04"}
 * @example
 *      最近7天 getLatestDays(7)
 *      最近30天 getLatestDays(30)
 *      最近365天 getLatestDays(365)
 **/
export function getLatestDays(count, format) {
  let time1 = new Date();
  time1.setTime(time1.getTime());
  let Y1 = time1.getFullYear();
  let M1 =
    time1.getMonth() + 1 > 10
      ? time1.getMonth() + 1
      : "0" + (time1.getMonth() + 1);
  let D1 = time1.getDate() > 10 ? time1.getDate() : "0" + time1.getDate();
  let timer1 = Y1 + "-" + M1 + "-" + D1; //当前时间
  let time2 = new Date();
  var _count = count - 1;
  if (_count <= 0) _count = 0;
  time2.setTime(time2.getTime() - 24 * 60 * 60 * 1000 * _count);
  let Y2 = time2.getFullYear();
  let M2 =
    time2.getMonth() + 1 > 10
      ? time2.getMonth() + 1
      : "0" + (time2.getMonth() + 1);
  let D2 = time2.getDate() > 10 ? time2.getDate() : "0" + time2.getDate();
  let timer2 = Y2 + "-" + M2 + "-" + D2;

  return {
    t1: new Date(timer1).format(format || "yyyy-MM-dd"),
    t2: new Date(timer2).format(format || "yyyy-MM-dd"),
  };
}

/**
 * 获取两个日期的天数差
 *
 * @param  { String } dateFirst 开始日期
 * @param  { String } dateSecond 结束日期
 * @return { Number } 相差的天数
 * @example
 *      getDays('2018-02-03','2018-03-09');
 **/
// function getDays(dateFirst, dateSecond) {
//   let dateFirstStr = dateFirst.split("-"),
//     dateFirstObj = new Date(
//       dateFirstStr[0],
//       dateFirstStr[1] - 1,
//       dateFirstStr[2]
//     ),
//     dateSecondStr = dateSecond.split("-"),
//     dateSecondObj = new Date(
//       dateSecondStr[0],
//       dateSecondStr[1] - 1,
//       dateSecondStr[2]
//     ),
//     t1 = dateFirstObj.getTime(),
//     t2 = dateSecondObj.getTime(),
//     dateTime = 1000 * 60 * 60 * 24, //每一天的毫秒数
//     minusDays = Math.floor((t2 - t1) / dateTime);
//   return Math.abs(minusDays);
// }
