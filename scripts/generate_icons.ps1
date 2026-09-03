Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\mahip_or2vm0z\.gemini\antigravity-ide\brain\a36d8b4f-025f-4759-9925-36a579c98c50\.user_uploaded\media_1788437845390.png"
$publicDir = "c:\Users\mahip_or2vm0z\OneDrive\Desktop\sbs web\public"

# 1. Copy raw logo
Copy-Item -Path $sourcePath -Destination "$publicDir\logo.png" -Force
Write-Host "Copied logo.png"

# Load source image
$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

function Create-SquareAppIcon($targetSize, $outputPath, $bgColor) {
    $bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Fill background
    $brush = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillRectangle($brush, 0, 0, $targetSize, $targetSize)
    
    # Calculate aspect-ratio fit with 18% padding
    $pad = [int]($targetSize * 0.12)
    $availW = $targetSize - ($pad * 2)
    $availH = $targetSize - ($pad * 2)
    
    $ratio = [Math]::Min($availW / $srcImg.Width, $availH / $srcImg.Height)
    $destW = [int]($srcImg.Width * $ratio)
    $destH = [int]($srcImg.Height * $ratio)
    
    $destX = [int](($targetSize - $destW) / 2)
    $destY = [int](($targetSize - $destH) / 2)
    
    $g.DrawImage($srcImg, $destX, $destY, $destW, $destH)
    
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $brush.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outputPath"
}

# Create White background App Icons
$whiteColor = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
Create-SquareAppIcon 512 "$publicDir\icon-512x512.png" $whiteColor
Create-SquareAppIcon 512 "$publicDir\icon.png" $whiteColor
Create-SquareAppIcon 192 "$publicDir\icon-192x192.png" $whiteColor
Create-SquareAppIcon 180 "$publicDir\apple-touch-icon.png" $whiteColor

$srcImg.Dispose()
Write-Host "All icons generated successfully!"
