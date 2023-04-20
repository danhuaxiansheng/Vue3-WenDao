import CryptoJS from 'crypto-js';
import setting from '@/setting.js';

//和接口约定好的加密规则
const tempKey = setting.AesKeyWords || "tanzhi8888888888";

//随机生成指定数量的16进制key
export function generatekey(num) {
	let library = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let key = "";
	for (let i = 0; i < num; i++) {
		let randomPoz = Math.floor(Math.random() * library.length);
		key += library.substring(randomPoz, randomPoz + 1);
	}
	return key;
}

export function encrypt(keyStr, encryptKey) {
	const aesKey = encryptKey ? encryptKey : tempKey;
	const key = CryptoJS.enc.Utf8.parse(aesKey);
	return CryptoJS.AES.encrypt(keyStr, key, {
		iv: CryptoJS.enc.Utf8.parse(aesKey.substr(0, 16)),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString();
}

export function decrypt(keyStr, encryptKey) {
	const aesKey = encryptKey ? encryptKey : tempKey;
	const key = CryptoJS.enc.Utf8.parse(aesKey);
	return CryptoJS.AES.decrypt(keyStr, key, {
		iv: CryptoJS.enc.Utf8.parse(aesKey.substr(0, 16)),
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString(CryptoJS.enc.Utf8)

}
