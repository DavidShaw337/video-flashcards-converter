import { useEffect, useRef } from "react"
import { Col, Form, Row } from "react-bootstrap"

interface IScreenshotSelector {
    video: File //video file to show the screenshot from
    min: number //minimum time in seconds
    max: number //maximum time in seconds
    time: number //selected time to take the screenshot from
    setTime: (value: number) => void
}
const ScreenshotSelector: React.FC<IScreenshotSelector> = ({ video, min, max, time, setTime }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    //show the image of the video at the selected time
    useEffect(() => {
        const videoElement = videoRef.current
        const canvasElement = canvasRef.current
        if (videoElement && canvasElement) {
            const handleLoadedMetadata = async () => {
                videoElement.currentTime = time
                videoElement.onseeked = async () => {
                    const context = canvasElement.getContext("2d")
                    if (context) {
                        context.clearRect(0, 0, 0, 0)
                        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
                        await new Promise(resolve => setTimeout(resolve, 1))
                        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
                    }
                }
                // Trigger the onseeked event manually
                videoElement.onseeked!(new Event('seeked'))
            }
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
            return () => {
                videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
            }
        }
    }, [time])
    return (
        <div>
            <canvas ref={canvasRef} width="320" height="180" style={{ width: "100%" }} />
            <video ref={videoRef} src={URL.createObjectURL(video)} style={{ display: "none" }} />
            <Row>
                <Col xs={10}>
                    <input
                        className="mt-8"
                        type="range"
                        min={min}
                        max={max}
                        step="0.1"
                        value={time}
                        style={{ width: "100%" }}
                        onChange={event => setTime(parseFloat(event.target.value))}
                    />
                </Col>
                <Col xs={2}>
                    <Form.Control
                        type="number"
                        value={time}
                        onChange={event => setTime(parseFloat(event.target.value))}
                        step="0.1"
                    />
                </Col>
            </Row>
        </div>
    )
}
export default ScreenshotSelector