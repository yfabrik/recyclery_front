export const emptyStringToNull = (obj: Object) => Object.entries(obj).reduce((prev: Record<string, any>, cur) => {
    if (cur[1] != null)
        prev[cur[0]] = cur[1]
    return prev
}, {})