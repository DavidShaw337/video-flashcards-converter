import React, { useCallback, useEffect, useRef } from 'react'
import { drawOverlay, drawWaveform } from '~/utils/waveform-utils'

interface AudioTrimmerProps {
    audioUrl: string
    audioBuffer: AudioBuffer
    min: number
    max: number
    start: number
    setStart: (value: number) => void
    end: number
    setEnd: (value: number) => void
}

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ audioUrl, audioBuffer, min, max, start, setStart, end, setEnd }) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!waveformCanvasRef.current) return
        const sampleRate = audioBuffer.sampleRate
        const startSample = Math.floor(min * sampleRate)
        const endSample = Math.floor(max * sampleRate)
        const channelData = audioBuffer.getChannelData(0).slice(startSample, endSample)
        drawWaveform(channelData, waveformCanvasRef.current)
    }, [min, max])

    useEffect(() => {
        if (!overlayCanvasRef.current) return
        drawOverlay(min, max, start, end, overlayCanvasRef.current)
    }, [min, max, start, end])

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
            audioRef.current.currentTime = roundedTime
            audioRef.current.play()
        } else {
            setEnd(roundedTime)
            //play audio
            audioRef.current.currentTime = start
            audioRef.current.play()
        }

    }

    const pauseAudioAtEnd = useCallback(() => {
        // console.log(`Current time: ${audioRef.current?.currentTime}, End time: ${end}`)
        if (audioRef.current && audioRef.current.currentTime >= end) {
            audioRef.current.pause()
        }
    }, [end])

    useEffect(() => {
        if (!audioRef.current) return

        //pause audio at end
        audioRef.current.addEventListener('timeupdate', pauseAudioAtEnd)
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', pauseAudioAtEnd)
            }
        }
    }, [start, pauseAudioAtEnd])

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setStart(time)
        if (audioRef.current) {
            audioRef.current.currentTime = time
            audioRef.current.play()
        }
    }

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value)
        setEnd(time)
        if (audioRef.current) {
            audioRef.current.currentTime = start
            audioRef.current.play()
        }
    }

    return (
        <div>
            <h1>Audio Trimmer</h1>
            <audio ref={audioRef} controls src={audioUrl} />

            <div style={{ position: 'relative', width: '600px', height: '100px' }}>
                <canvas ref={waveformCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} />
                <canvas ref={overlayCanvasRef} width="600" height="100" style={{ position: 'absolute', top: 0, left: 0 }} onClick={handleOverlayCanvasClick} />
            </div>
            <div>
                <label>Start: </label>
                <input type="number" step="0.1" value={start} onChange={handleStartChange} />
            </div>
            <div>
                <label>End: </label>
                <input type="number" step="0.1" value={end} onChange={handleEndChange} />
            </div>
        </div>
    )
}

export default AudioTrimmer