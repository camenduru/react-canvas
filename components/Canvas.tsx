"use client";

import React, { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { Image as ImageIcon, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

type ImageState = {
  src: string;
  zoom: number;
  x: number;
  y: number;
}

export default function Component() {
  const [images, setImages] = useState<ImageState[]>(Array(4).fill({ src: "", zoom: 1, x: 0, y: 0 }))
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number }>({ isDragging: false, startX: 0, startY: 0 })
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImages = [...images]
        newImages[index] = { src: e.target?.result as string, zoom: 1, x: 0, y: 0 }
        setImages(newImages)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReplaceImage = (index: number) => {
    fileInputRefs.current[index]?.click()
  }

  const handleZoom = (index: number, direction: 'in' | 'out') => {
    const newImages = [...images]
    const currentZoom = newImages[index].zoom
    newImages[index].zoom = direction === 'in' ? Math.min(currentZoom + 0.1, 3) : Math.max(currentZoom - 0.1, 0.5)
    setImages(newImages)
  }

  const handleMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    dragRef.current = { isDragging: true, startX: e.clientX - images[index].x, startY: e.clientY - images[index].y }
  }

  const handleMouseMove = useCallback((index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return
    const newImages = [...images]
    newImages[index].x = e.clientX - dragRef.current.startX
    newImages[index].y = e.clientY - dragRef.current.startY
    setImages(newImages)
  }, [images])

  const handleMouseUp = () => {
    dragRef.current.isDragging = false
  }

  const renderPanel = (index: number) => (
    <div className="relative h-full bg-gray-700 flex items-center justify-center overflow-hidden">
      {images[index].src ? (
        <div 
          className="relative w-full h-full cursor-move"
          onMouseDown={(e) => handleMouseDown(index, e)}
          onMouseMove={(e) => handleMouseMove(index, e)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${images[index].x}px, ${images[index].y}px) scale(${images[index].zoom})`,
              transition: 'transform 0.1s',
              width: '100%',
              height: '100%',
              backgroundImage: `url(${images[index].src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => handleZoom(index, 'in')}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => handleZoom(index, 'out')}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleReplaceImage(index)}
              aria-label="Replace image"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label htmlFor={`upload-${index}`} className="cursor-pointer flex flex-col items-center">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span>Upload Image</span>
        </label>
      )}
      <input
        id={`upload-${index}`}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleImageUpload(index, e)}
        ref={(el) => {fileInputRefs.current[index] = el}}
      />
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 bg-gray-800 border-hidden ">
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={50}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  {renderPanel(0)}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  {renderPanel(1)}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  {renderPanel(2)}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  {renderPanel(3)}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Card>
      </div>
    </div>
  )
}