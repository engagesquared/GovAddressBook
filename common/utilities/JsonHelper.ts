export function tryParseJson<T = any>(value: string, defaultObj: T): T {
    if (value && value.length > 1) {
        try {
            const obj: T = JSON.parse(value) as T;
            return obj;
        } catch {
            return defaultObj;
        }
    }
    return defaultObj;
}
