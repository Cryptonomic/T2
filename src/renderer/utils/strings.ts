export function limitLength(str: string, limit: number, indicator = '...') {
    if (str.length <= limit) {
        return str;
    }

    return str.slice(0, limit - indicator.length) + indicator;
}

export default limitLength;
