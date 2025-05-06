import { useState } from "react"

const useLocalStorage = <T>(key: string, defaultValue: T): [T, (value: T | ((value: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
    })

    const setValue = (value: T | ((value: T) => T)) => {
        if (value instanceof Function) {
            value = value(storedValue)
        }
        if (JSON.stringify(value) == JSON.stringify(defaultValue)) {
            window.localStorage.removeItem(key)
            setStoredValue(defaultValue)
        } else {
            window.localStorage.setItem(key, JSON.stringify(value))
            setStoredValue(value)
        }
    }
    return [storedValue, setValue]
}
export default useLocalStorage