import * as SH from "react-syntax-highlighter";
import { atomOneDark as styleDark, atomOneLight as styleLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export default function SyntaxHighlighter({ code, theme }: { code: string, theme: string | undefined }) {
    return <SH.default
        language="lua"
        customStyle={{ fontSize: "0.75rem", padding: "1rem", borderTopWidth: "1px", borderBottomWidth: "1px", marginTop: "1.5rem" }}
        style={theme == "dark" ? styleDark : styleLight}
    >
        {code}
    </SH.default>
}
