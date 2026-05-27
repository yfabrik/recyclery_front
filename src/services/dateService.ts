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
    return d.toLocaleTimeString("fr-FR", { minute: "2-digit", hour: "2-digit", hour12: false })
}

/** Week (Monday–Sunday) containing the given date. Returns date_from and date_to in en-ca format for API. */
export const getWeekRangeFromDate = (selectedDate: Date): { date_from: string; date_to: string } => {
    const lundi = new Date(selectedDate)
    const day = lundi.getDay()
    const diff = lundi.getDate() - day + (day === 0 ? -6 : 1)
    lundi.setDate(diff)
    const dimanche = new Date(lundi)
    dimanche.setDate(lundi.getDate() + 6)
    return {
        date_from: lundi.toLocaleString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }),
        date_to: dimanche.toLocaleString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }),
    }
}