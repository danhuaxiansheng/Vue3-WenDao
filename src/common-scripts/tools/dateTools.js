import { parseTime, getLatestDays } from "@LIB/date";

export function getTimeByFlag(flag) {
    let baseD;
    let timeArr = [];
    switch (flag) {
        case "最近30分钟":
        case "30minutes":
            baseD = new Date().getTime();
            timeArr = [
                parseTime(new Date(baseD - 1800 * 1000), "{y}-{m}-{d} {h}:{i}:{s}"),
                parseTime(new Date(baseD), "{y}-{m}-{d} {h}:{i}:{s}"),
            ];
            break;
        case "最近1小时":
        case "1hour":
            baseD = new Date().getTime();
            timeArr = [
                parseTime(
                    new Date(baseD - 3600 * 1000),
                    "{y}-{m}-{d} {h}:{i}:{s}"
                ),
                parseTime(new Date(baseD), "{y}-{m}-{d} {h}:{i}:{s}"),
            ];

            break;
        case "当天":
        case "today":
            baseD = parseTime(new Date(), "{y}-{m}-{d}");
            timeArr = [baseD + " 00:00:00", baseD + " 23:59:59"];
            break;
        case "最近24小时":
        case "24hours":
            baseD = parseTime(new Date(), "{y}-{m}-{d} {h}:{i}:{s}");
            timeArr = [
                parseTime(
                    new Date().addDays(-1),
                    "{y}-{m}-{d} {h}:{i}:{s}"
                ),
                baseD,
            ];
            break;
        case "最近7天":
        case "sevenDays":
            baseD = getLatestDays(7);
            timeArr = [baseD.t2 + " 00:00:00", baseD.t1 + " 23:59:59"];
            break;
        case "最近14天":
        case "fourteenDays":
            baseD = getLatestDays(14);
            timeArr = [baseD.t2 + " 00:00:00", baseD.t1 + " 23:59:59"];
            break;
        case "最近30天":
        case "thirtyDays":
            baseD = getLatestDays(30);
            timeArr = [baseD.t2 + " 00:00:00", baseD.t1 + " 23:59:59"];
            break;
        default:
            timeArr = [];
            break;
    }
    return timeArr;
}