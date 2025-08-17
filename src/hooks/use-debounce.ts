"use client"

import { useState, useEffect } from "react"

export function useDebounce<T>(val: T, delay: number): T{
    const [value, setValue] = useState<T>(val)
    
    useEffect(() => {
        const handler = setTimeout(() => {
        setValue(val)
        }, delay)
    
        return () => {
        clearTimeout(handler)
        }
    }, [val, delay])
    
    return value
}