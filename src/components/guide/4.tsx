import { Button } from "../ui/button"
import { useLocalStorage } from "usehooks-ts"

export default function Guide4() {
    const [guideIndex, setGuideIndex] = useLocalStorage("guide-index", 0)

    function finish() {
        setGuideIndex(4)
    }

    if (guideIndex !== 3) {
        return null
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-background border rounded-3xl p-8 shadow-lg">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-medium">Connect & Customise 🔗</h1>
                <p className="text-muted-foreground text-lg">
                    You can connect nodes in chains or branch them out to setup execution however you want.<br />
                    Protip: press alt/option anytime to view the execution order. Happy Hacking!
                </p>
            </div>

            <div className="relative w-full aspect-video mt-4 mb-8 rounded-lg overflow-hidden">
                <video
                    src="/4.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </div>

            <div className="flex justify-between items-center">
                <Button
                    variant="ghost"
                    onClick={() => setGuideIndex(2)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Back
                </Button>
                <Button
                    onClick={finish}
                    className=""
                >
                    Get Started
                </Button>
            </div>

        </div>
    )
} 