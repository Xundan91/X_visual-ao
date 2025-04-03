import welcomeBanner from "@/assets/welcome-banner.png"
import Image from "next/image"
import { Button } from "../ui/button"
import { useLocalStorage } from "usehooks-ts"

export default function Guide1() {
    const [guideIndex, setGuideIndex] = useLocalStorage("guide-index", 0)

    function next() {
        setGuideIndex(1)
    }

    function skip() {
        setGuideIndex(4)
    }

    if (guideIndex !== 0) {
        return null
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-background border rounded-3xl p-8 shadow-lg">
            <Image
                draggable={false}
                src={welcomeBanner}
                alt="Visual AO Welcome Banner"
                className="object-cover mb-4"
            />

            <div className="text-center space-y-4">
                <h1 className="text-3xl font-medium">Welcome Aboard! New here 👀?</h1>

                <p className="text-lg max-w-md mx-auto">
                    This tour will guide you through the key features and functionalities we offer,
                    ensuring you have a smooth and successful start.
                </p>

                <div className="space-y-3 pt-4 flex flex-col w-fit mx-auto">
                    <Button
                        variant="default"
                        className="hover:text-foreground py-3 px-6 rounded-lg hover:bg-secondary/80 transition-colors shadow-md"
                        onClick={next}
                    >
                        Give me a walkthrough
                    </Button>

                    <Button
                        variant="link"
                        className="py-2 px-6 hover:opacity-60 transition-colors"
                        onClick={skip}
                    >
                        I don&apos;t need help, I&apos;ll do it myself
                    </Button>
                </div>
            </div>

        </div>
    )
}