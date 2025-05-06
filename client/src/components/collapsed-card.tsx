import type { FunctionComponent } from "react"
import { Col, Row } from "react-bootstrap"
import { Flashcard } from "../data/interfaces"

interface CardProps {
    subtitle: Flashcard
}

const CollapsedCard: FunctionComponent<CardProps> = ({ subtitle }) => {
    return (
        <Row>
            <Col xs={6}>{subtitle.source}</Col>
            <Col xs={6}>{subtitle.translation}</Col>
        </Row>
    )
}

export default CollapsedCard