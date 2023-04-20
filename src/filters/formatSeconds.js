export default function (value) {
    let result = parseInt(value);
    let hour = Math.floor(result / 3600);
    let minutes = Math.floor((result / 60 % 60));
    let seconds = Math.floor((result % 60));
    let h = hour < 10 ? "0" + hour : hour;
    let m = minutes < 10 ? "0" + minutes : minutes;
    let s = seconds < 10 ? "0" + seconds : seconds;
    return result = `${h}小时${m}分${s}秒`;
}