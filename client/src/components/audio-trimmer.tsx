import React, { ReactEventHandler, useEffect, useRef, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { ffmpegService } from '../services/ffmpeg-service'
import { drawOverlay, drawWaveform } from '../utils/waveform-utils'

interface AudioTrimmerProps {
    min: number
    max: number
    start: number
    setStart: (value: number) => void
    end: number
    setEnd: (value: number) => void
}

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ min, max, start, setStart, end, setEnd }) => {
    const [audioUrl, setAudio] = useState<string | undefined>()
    const audioRef = useRef<HTMLAudioElement>(null)
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
    const markerCanvasRef = useRef<HTMLCanvasElement>(null)
    //extract a small audio clip so we don't have to use the whole audio file
    useEffect(() => {
        //loading the audio takes a noticeable amount of time, so only do it when the min and max change
        const extractAndSetAudio = async () => {
            if (!waveformCanvasRef.current) return
            const { audioUrl, audioBuffer } = await ffmpegService.extractAudio(min, max)
            if (!audioUrl || !audioBuffer) throw Error('No audio data')
            //set the audio url that actually plays the audio
            setAudio(audioUrl)
            //draw the waveform
            const channelData = audioBuffer.getChannelData(0) //only gets one channel
            drawWaveform(channelData, waveformCanvasRef.current)
        }
        extractAndSetAudio()
    }, [min, max])
    //draw the overlay when start or end changes; this is the blue bar that shows the selected range
    useEffect(() => {
        if (!overlayCanvasRef.current) return
        drawOverlay(min, max, start, end, overlayCanvasRef.current)
    }, [min, max, start, end])
    //draw the red line that shows the current time and animate it to the right
    const animationFrameRef = useRef<number>(null) // Store reference to the animation frame
    const animateMarker = (start: number, end: number) => {
        if (!markerCanvasRef.current) return
        const canvas = markerCanvasRef.current
        const ctx = canvas.getContext('2d')
        const duration = max - min
        const startPercent = (start - min) / duration
        const endPercent = (end - min) / duration
        const xStart = startPercent * canvas.width
        const xEnd = endPercent * canvas.width
        const step = canvas.width / (60 * duration)

        let xCurrent = xStart // Starting point of the bar
        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear previous frames
            ctx.fillStyle = 'red' // Set the fill color to red
            ctx.fillRect(xCurrent, 0, 1, canvas.height) // Draw the bar at currentX position
            // Move the bar to the right
            if (xCurrent < xEnd) {
                xCurrent += step
                animationFrameRef.current = requestAnimationFrame(animate) // Request the next animation frame
            }
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
        animate() // Start the animation
    }
    //when the user clicks on the overlay, update the start or end time, play the audio, and animate the marker
    const handleOverlayCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!overlayCanvasRef.current || !audioRef.current) return
        //get click position as a percentage of the canvas width
        const rect = overlayCanvasRef.current.getBoundingClientRect()
        const clickPercent = (event.clientX - rect.left) / rect.width
        //convert the click percentage to a point in time between min and max
        const timeWidth = max - min
        const time = min + clickPercent * timeWidth
        const roundedTime = Math.round(time * 10) / 10
        //assume the click is meant to change the side that is closer to the click
        const midPoint = (start + end) / 2
        if (roundedTime < midPoint) {
            setStart(roundedTime)
            //play audio
            audioRef.current.currentTime = roundedTime - min
            audioRef.current.play()
            animateMarker(roundedTime, end)
        } else {
            setEnd(roundedTime)
            //play audio
            audioRef.current.currentTime = start - min
            audioRef.current.play()
            animateMarker(start, roundedTime)
        }
    }
    //when the user changes the start time, play the audio and animate the marker
    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setStart(time)
        if (audioRef.current) {
            audioRef.current.currentTime = time - min
            audioRef.current.play()
            animateMarker(time, end)
        }
    }
    //when the user changes the end time, play the audio and animate the marker
    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setEnd(time)
        if (audioRef.current) {
            audioRef.current.currentTime = start - min
            audioRef.current.play()
            animateMarker(start, time)
        }
    }
    //pause the audio when it reaches the end time
    const pauseAudioAtEnd: ReactEventHandler<HTMLAudioElement> = (event) => {
        if (event.currentTarget.currentTime >= end - min) event.currentTarget.pause()
    }
    //play the audio when the component is first rendered
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = start - min
            audioRef.current.play()
            animateMarker(start, end)
        }
    }, [audioUrl])
    //
    return (
        <div className="mt-2">
            {audioUrl && <audio ref={audioRef} src={audioUrl} onTimeUpdate={pauseAudioAtEnd} />}
            {/* <div style={{ position: 'relative', width: '600px', height: '100px' }}>
                <canvas ref={waveformCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} />
                <canvas ref={overlayCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} />
                <canvas ref={markerCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} onClick={handleOverlayCanvasClick} />
            </div> */}
            <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                <canvas ref={waveformCanvasRef} style={{ position: 'absolute', width: "100%", height: "100%" }} />
                <canvas ref={overlayCanvasRef} style={{ position: 'absolute', width: "100%", height: "100%" }} />
                <canvas ref={markerCanvasRef} style={{ position: 'absolute', width: "100%", height: "100%" }} onClick={handleOverlayCanvasClick} />
            </div>
            <Row>
                <Col xs={6}>
                    <Form.Group>
                        <Form.Label>Start</Form.Label>
                        <Form.Control
                            type="number"
                            value={start}
                            onChange={handleStartChange}
                            step="0.1"
                        />
                    </Form.Group>
                </Col>
                <Col xs={6}>
                    <Form.Group>
                        <Form.Label>End</Form.Label>
                        <Form.Control
                            type="number"
                            value={end}
                            onChange={handleEndChange}
                            step="0.1"
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    )
}

export default AudioTrimmer