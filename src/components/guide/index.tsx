import { useLocalStorage } from "usehooks-ts"
import Guide1 from "./1"
import Guide2 from "./2"
import Guide3 from "./3"
import Guide4 from "./4"

export function Guide() {
    const [hasSeenGuide, setHasSeenGuide] = useLocalStorage("has-seen-guide", false)
    const [guideIndex, setGuideIndex] = useLocalStorage("guide-index", 0)

    // Don't show guide if user has seen it before
    if (hasSeenGuide) {
        return null
    }

    // Mark guide as seen when user reaches the end
    if (guideIndex > 3) {
        setHasSeenGuide(true)
        setGuideIndex(0)
        return null
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Guide1 />
            <Guide2 />
            <Guide3 />
            <Guide4 />
        </div>
    )
} 