
const drawWaveform = async (channelData: Float32Array, canvas: HTMLCanvasElement) => {
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await new Promise(resolve => setTimeout(resolve, 1))
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'lightgray'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const sliceWidth = canvas.width / channelData.length
    let x = 0

    ctx.beginPath()
    for (let i = 0; i < channelData.length; i += 1) {
        const v = channelData[i] * 0.5
        const y = canvas.height / 2 + v * canvas.height / 2
        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
        x += sliceWidth
    }
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.strokeStyle = 'black'
    ctx.stroke()
}

const drawOverlay = async (min: number, max: number, start: number, end: number, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await new Promise(resolve => setTimeout(resolve, 1))
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const startX = ((start - min) / (max - min)) * canvas.width
    const endX = ((end - min) / (max - min)) * canvas.width

    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'
    ctx.fillRect(startX, 0, endX - startX, canvas.height)
}

export { drawOverlay, drawWaveform }

