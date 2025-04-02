import { Button } from "../ui/button"
import { useLocalStorage } from "usehooks-ts"

export default function Guide3() {
    const [guideIndex, setGuideIndex] = useLocalStorage("guide-index", 0)

    function next() {
        setGuideIndex(3)
    }

    if (guideIndex !== 2) {
        return null
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-background border rounded-3xl p-8 shadow-lg">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-medium">Build with Nodes ⚙️</h1>
                <p className="text-muted-foreground text-lg">
                    Drag and drop nodes to build your process flow. Connect them together to create powerful functionalities
                </p>
            </div>

            <div className="relative w-full aspect-video mt-4 mb-8 rounded-lg overflow-hidden">
                <video
                    src="/3.mp4"
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
                    onClick={() => setGuideIndex(1)}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Back
                </Button>
                <Button
                    onClick={next}
                    className=""
                >
                    Next
                </Button>
            </div>
        </div>
    )
} 