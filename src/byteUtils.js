export function toHex(byte) {
    return byte.toString(16).padStart(2, '0')
}

export function toHexString(bytes) {
    return bytes.map(it => toHex(it)).join('')
}

export function toByteCount(sizeUnit) {
    const units = {
        B: 1,
        K: 1024 ** 1,
        M: 1024 ** 2,
        G: 1024 ** 3,
        T: 1024 ** 4,
        P: 1024 ** 5
    }
    const regex = /^(\d+(?:\.\d+)?)\s*([kmgtp]?)b?$/i
    const match = sizeUnit.match(regex)
    if (!match) {
        throw new Error(sizeUnit + '格式不正确')
    }
    const value = parseFloat(match[1])
    if (match[2]) {
        const unit = match[2].toUpperCase()
        return value * units[unit]
    }
    return value
}
