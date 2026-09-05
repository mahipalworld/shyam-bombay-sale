Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\mahip_or2vm0z\.gemini\antigravity-ide\brain\7d4acb90-79e2-4e6c-aab8-f0fb0bbdb538\.user_uploaded\media_1788589609181.jpg"
$publicDir = "c:\Users\mahip_or2vm0z\OneDrive\Desktop\sbs web\public"
$appDir = "c:\Users\mahip_or2vm0z\OneDrive\Desktop\sbs web\src\app"

if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Force -Path $publicDir
}
if (-not (Test-Path $appDir)) {
    New-Item -ItemType Directory -Force -Path $appDir
}

# Load source image
$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

function Resize-AndSaveIcon($targetWidth, $targetHeight, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($srcImg, 0, 0, $targetWidth, $targetHeight)
    
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $outputPath ($targetWidth x $targetHeight)"
}

# 1. Generate Public Icons
Resize-AndSaveIcon 512 512 "$publicDir\icon-512x512.png"
Resize-AndSaveIcon 192 192 "$publicDir\icon-192x192.png"
Resize-AndSaveIcon 512 512 "$publicDir\icon.png"
Resize-AndSaveIcon 180 180 "$publicDir\apple-touch-icon.png"
Resize-AndSaveIcon 48 48 "$publicDir\favicon-48x48.png"
Resize-AndSaveIcon 32 32 "$publicDir\favicon.png"
Resize-AndSaveIcon 512 512 "$publicDir\logo.png"

# 2. Generate Next.js App Router Icons
Resize-AndSaveIcon 512 512 "$appDir\icon.png"
Resize-AndSaveIcon 180 180 "$appDir\apple-icon.png"
Resize-AndSaveIcon 32 32 "$appDir\favicon.ico"
Resize-AndSaveIcon 32 32 "$publicDir\favicon.ico"

# 3. Create SVG embedding the new 512px icon base64 data
$bytes = [System.IO.File]::ReadAllBytes("$publicDir\icon-512x512.png")
$base64 = [Convert]::ToBase64String($bytes)
$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,$base64" width="512" height="512" />
</svg>
"@
[System.IO.File]::WriteAllText("$publicDir\icon.svg", $svgContent)
Write-Host "Generated: $publicDir\icon.svg (with embedded base64 mascot)"

$srcImg.Dispose()
Write-Host "All icons completely refreshed!"
