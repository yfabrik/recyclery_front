export const weekDays = () => {
    const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" })
    return [1, 2, 3, 4, 5, 6, 0].map(day => {
        const jour = new Date(1970, 0, 4 + day) // 04/01/1970=dimanche = 0
        return formatter.format(jour)
    })
}

export const weekDaysMap = () => {
    const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" })
    return [1, 2, 3, 4, 5, 6, 0].reduce((prev, current) => {
        const jour = new Date(1970, 0, 4 + current) // 04/01/1970=dimanche = 0
        return prev.set(current, formatter.format(jour))
    }, new Map())
}
export const weekDaysArray = () => {
    const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" })
    return [1, 2, 3, 4, 5, 6, 0].map(day => {
        const jour = new Date(1970, 0, 4 + day) // 04/01/1970=dimanche = 0
        return { key: day, label: formatter.format(jour) }
    })
}

export const getDay = (n: number) => {
    const formatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long" })
    const jour = new Date(1970, 0, 4 + n)
    return formatter.format(jour)
}

export const formatDate = (d: Date) => {
    return d.toLocaleDateString("fr-FR")
}

export const formatTime = (d: Date) => {
    return d.toLocaleTimeString("fr-FR", { minute: "2-digit", hour: "2-digit" })
}