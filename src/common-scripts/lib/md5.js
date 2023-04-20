import md5 from 'js-md5'

export function md5_16(str) {
    return md5(str).substring(0, 16)
}

export function md5_32(str) {
    return md5(str).substring(0, 32)
}
