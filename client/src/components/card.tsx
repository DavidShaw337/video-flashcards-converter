import type { FunctionComponent } from "react"
import { Flashcard } from "../interfaces"

interface CardProps {
    subtitle: Flashcard
}

const Card: FunctionComponent<CardProps> = ({ subtitle }) => {
    return (
        <div style={{ border: "1px solid black", padding: "10px", margin: "10px", display: "flex", justifyContent: "space-between" }}>
            <p>{subtitle.source}</p>
            <p>{subtitle.translation}</p>
        </div>
    )
}

export default Card