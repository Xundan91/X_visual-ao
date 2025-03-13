"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const handleThemeChange = () => {
        const newTheme = theme == "light" ? "dark" : "light";
        setTheme(newTheme);

        // Store theme in localStorage for other components
        localStorage.setItem("theme", newTheme);

        // Dispatch custom event for Monaco editor
        window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: newTheme } }));
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted-foreground/10"
            onClick={handleThemeChange}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
} 