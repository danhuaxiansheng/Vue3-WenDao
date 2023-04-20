import { isNullOrEmpty } from "@LIB/base.js"

export default (number, fixNum = 2) => {
    var unitNumber = '',                          //最终返回的字符
        units = ["", "万", "亿", "万亿"],
        dividend = 10000,
        currentNum = number,
        currentUnit = units[0];                  //转换数字
    var numberSize = function (number) {
        var stringNum = number.toString(),
            index = stringNum.indexOf("."),
            newNum = stringNum;

        if (index != -1)
            newNum = stringNum.substring(0, index)

        return newNum.length;
    }

    //转换单位 
    for (var i = 0; i < 4; i++) {
        currentUnit = units[i];
        if (numberSize(currentNum) < 5) break;
        currentNum = currentNum / dividend;
    }
    if (isNullOrEmpty(currentUnit))
        return number;
    unitNumber = parseFloat(currentNum.toFixed(fixNum)) + currentUnit;
    return unitNumber;
}