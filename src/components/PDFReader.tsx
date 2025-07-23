"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Maximize, Minimize, Download, BookOpen, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PdfReaderModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  bookTitle: string
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  bookTitle,
}) => {
  const { toast } = useToast()
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageInput, setPageInput] = useState("1")
  const [searchTerm, setSearchTerm] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  // Predefined zoom levels
  const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0]

  useEffect(() => {
    setPageInput(pageNumber.toString())
  }, [pageNumber])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            onClose()
          }
          break
        case "ArrowLeft":
          if (pageNumber > 1) {
            setPageNumber(pageNumber - 1)
          }
          break
        case "ArrowRight":
          if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1)
          }
          break
        case "F11":
          event.preventDefault()
          setIsFullscreen(!isFullscreen)
          break
        case "+":
        case "=":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleZoomIn()
          }
          break
        case "-":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleZoomOut()
          }
          break
        case "r":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            handleRotate()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, pageNumber, numPages, isFullscreen])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
    toast({
      title: "PDF Loaded",
      description: `Successfully loaded ${numPages} pages`,
    })
  }, [toast])

  const onDocumentLoadError = useCallback((error: Error) => {
    setError(error.message)
    setLoading(false)
    toast({
      title: "Error Loading PDF",
      description: error.message,
      variant: "destructive",
    })
  }, [toast])

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput, 10)
      if (page >= 1 && page <= numPages) {
        setPageNumber(page)
      } else {
        setPageInput(pageNumber.toString())
        toast({
          title: "Invalid Page",
          description: `Please enter a page number between 1 and ${numPages}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.findIndex(level => level >= scale)
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1)
    setScale(zoomLevels[nextIndex])
  }

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.findIndex(level => level >= scale)
    const prevIndex = Math.max(currentIndex - 1, 0)
    setScale(zoomLevels[prevIndex])
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${bookTitle}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Download Started",
      description: "Your PDF is being downloaded",
    })
  }

  const resetView = () => {
    setScale(1.0)
    setRotation(0)
    setPageNumber(1)
    toast({
      title: "View Reset",
      description: "PDF view has been reset to default",
    })
  }

  const goToFirstPage = () => setPageNumber(1)
  const goToLastPage = () => setPageNumber(numPages)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${isFullscreen
            ? "fixed inset-0 w-screen h-screen max-w-none max-h-none m-0 rounded-none border-0"
            : "max-w-6xl max-h-[90vh] w-[95vw] h-[85vh]"
          } p-0 bg-gray-900 text-white`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold truncate">
              {bookTitle}
            </DialogTitle>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-32 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem onClick={resetView} className="text-white hover:bg-gray-700">
                  Reset View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={goToFirstPage} className="text-white hover:bg-gray-700">
                  Go to First Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={goToLastPage} className="text-white hover:bg-gray-700">
                  Go to Last Page
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={handleDownload} className="text-white hover:bg-gray-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-800">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <Input
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePageInputSubmit(e)
                  }
                }}
                className="w-16 h-8 text-center bg-gray-700 border-gray-600 text-white"
              />
              <span className="text-sm text-gray-400">/ {numPages}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom and Rotation */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.25}
                max={4.0}
                step={0.25}
                className="w-24"
              />
              <span className="text-sm text-gray-400 min-w-[3rem]">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogDescription className="sr-only">
          Đây là trình đọc file PDF cho sách {bookTitle}. Bạn có thể xem nội dung sách tại đây.
        </DialogDescription>
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-600 p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-400 mb-4">Error loading PDF:</p>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="flex justify-center">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={
                    <div className="flex items-center justify-center h-96 bg-white">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600"></div>
                    </div>
                  }
                  className="shadow-lg"
                />
              </Document>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 text-sm text-gray-400">
          <div>
            Page {pageNumber} of {numPages}
          </div>
          <div>
            Zoom: {Math.round(scale * 100)}% | Rotation: {rotation}°
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PdfReaderModal