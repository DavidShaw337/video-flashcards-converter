import React, { useCallback, useEffect, useRef, useState } from 'react'
import { extractAudio } from '~/utils/ffmpeg-utils'
import { drawOverlay, drawWaveform } from '~/utils/waveform-utils'

interface AudioTrimmerProps {
    min: number
    max: number
    start: number
    setStart: (value: number) => void
    end: number
    setEnd: (value: number) => void
}

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ min, max, start, setStart, end, setEnd }) => {
    const [audioUrl, setAudio] = useState<string | null>(null)
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
    const markerCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const extractAndSetAudio = async () => {
            const { audioUrl, audioBuffer } = await extractAudio(min, max)
            setAudio(audioUrl)
            setAudioBuffer(audioBuffer)
        }
        extractAndSetAudio()
    }, [min, max])

    useEffect(() => {
        if (!waveformCanvasRef.current || !audioBuffer) return
        const channelData = audioBuffer.getChannelData(0)
        drawWaveform(channelData, waveformCanvasRef.current)
    }, [audioBuffer])

    useEffect(() => {
        if (!audioBuffer) return
        if (!overlayCanvasRef.current) return
        drawOverlay(min, max, start, end, overlayCanvasRef.current)
    }, [audioBuffer, min, max, start, end])

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

    const pauseAudioAtEnd = useCallback(() => {
        if (audioRef.current && audioRef.current.currentTime >= end - min) {
            audioRef.current.pause()
        }
    }, [min, end])

    useEffect(() => {
        if (!audioRef.current) return

        //pause audio at end
        audioRef.current.addEventListener('timeupdate', pauseAudioAtEnd)
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', pauseAudioAtEnd)
            }
        }
    }, [pauseAudioAtEnd])

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

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setStart(time)
        if (audioRef.current) {
            audioRef.current.currentTime = time - min
            audioRef.current.play()
            animateMarker(time, end)
        }
    }

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setEnd(time)
        if (audioRef.current) {
            audioRef.current.currentTime = start - min
            audioRef.current.play()
            animateMarker(start, time)
        }
    }

    return (
        <div>
            {audioUrl && <audio ref={audioRef} src={audioUrl} />}
            <div style={{ position: 'relative', width: '600px', height: '100px' }}>
                <canvas ref={waveformCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} />
                <canvas ref={overlayCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} />
                <canvas ref={markerCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} onClick={handleOverlayCanvasClick} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, marginRight: '20px' }}>
                    <label>Start: </label>
                    <input type="number" style={{ maxWidth: '5em' }} step="0.1" value={start} onChange={handleStartChange} />
                </div>
                <div style={{ flex: 1 }}>
                    <label>End: </label>
                    <input type="number" style={{ maxWidth: '5em' }} step="0.1" value={end} onChange={handleEndChange} />
                </div>
            </div>
        </div>
    )
}

export default AudioTrimmer