import Cookies from 'js-cookie'

export function getCookie(TokenKey) {
    return Cookies.get(TokenKey)
}

export function setCookie(TokenKey, token) {
    return Cookies.set(TokenKey, token)
}

export function removeCookie(TokenKey) {
    return Cookies.remove(TokenKey)
}

// 清除所有cookie
export function removeAllCookie() {
    document.cookie?.split(';')
        ?.forEach(cookie =>
            document.cookie = cookie
                ?.replace(/^ +/, '')
                ?.replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`))
}
