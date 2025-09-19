import { getTableLink } from '@/lib/utils'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

export default function QRCodeTable({
  token,
  tableNumber,
  width = 200,
}: {
  token: string
  tableNumber: string
  width?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    QRCode.toCanvas(canvas, getTableLink({ token, tableNumber: Number(tableNumber) }), { width }, (error) => {
      console.log(error)
    })
  }, [token, tableNumber, width])

  return <canvas ref={canvasRef} />
}
