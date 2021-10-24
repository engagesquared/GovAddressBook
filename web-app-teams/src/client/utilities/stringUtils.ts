export const splitString = (defaultStr: string): string => {
    return defaultStr.replace(/([a-z])([A-Z])/g, '$1 $2');
}