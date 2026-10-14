# Creates the "RadVox IR" icon on the desktop and in the Start menu (Windows).
$App = Split-Path -Parent $PSScriptRoot
$Launcher = Join-Path $PSScriptRoot 'RadVoxIR.ps1'
$Icon = Join-Path $App 'public\icons\radvox-ir.ico'
$PowerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$Shell = New-Object -ComObject WScript.Shell
$Places = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))
foreach ($place in $Places) {
  if (-not $place) { continue }
  $link = $Shell.CreateShortcut((Join-Path $place 'RadVox IR.lnk'))
  $link.TargetPath = $PowerShell
  $link.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Launcher`""
  $link.WorkingDirectory = $App
  $link.IconLocation = "$Icon,0"
  $link.WindowStyle = 7
  $link.Description = 'RadVox IR - opisy zabiegów radiologii interwencyjnej'
  $link.Save()
}
Write-Output 'Shortcuts created.'
