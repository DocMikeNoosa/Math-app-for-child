# Tworzy ikonę „EndoList" na pulpicie i w menu Start (Windows).
$App = Split-Path -Parent $PSScriptRoot
$Launcher = Join-Path $PSScriptRoot 'EndoList.ps1'
$Icon = Join-Path $PSScriptRoot 'endolist.ico'
$PowerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$Shell = New-Object -ComObject WScript.Shell
foreach ($place in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
  if (-not $place) { continue }
  $link = $Shell.CreateShortcut((Join-Path $place 'EndoList.lnk'))
  $link.TargetPath = $PowerShell
  $link.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Launcher`""
  $link.WorkingDirectory = $App
  $link.IconLocation = "$Icon,0"
  $link.WindowStyle = 7
  $link.Description = 'EndoList - listy do lekarzy kierujących'
  $link.Save()
}
Write-Output 'Shortcuts created.'
