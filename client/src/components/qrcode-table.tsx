import { getTableLink } from '@/lib/utils'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

export default function QRCodeTable({
  token,
  tableNumber,
  width = 200,
}: {
  token: string
  tableNumber: number
  width?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!

    canvas.height = width + 70

    canvas.width = width
    const canvasContext = canvas.getContext('2d')!
    canvasContext.fillStyle = '#ffffff'
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)

    canvasContext.font = '15px Arial'
    canvasContext.textAlign = 'center'
    canvasContext.fillStyle = '#000'
    canvasContext.fillText(`Bàn số ${tableNumber}`, width / 2, width + 20)
    canvasContext.fillText('Quét mã QR để đặt món', width / 2, width + 50)

    const virtualCanvas = document.createElement('canvas')

    QRCode.toCanvas(virtualCanvas, getTableLink({ token, tableNumber: tableNumber }), (error) => {
      console.log(error)
      canvasContext.drawImage(virtualCanvas, 0, 0, width, width)
    })
  }, [token, tableNumber, width])

  return <canvas ref={canvasRef} />
}
