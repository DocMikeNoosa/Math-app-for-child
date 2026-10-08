# EndoList — lokalny serwer bez Node.js (wbudowany Windows PowerShell). Serwuje folder public/ pod http://localhost:4173
# Działa tylko na tym komputerze (127.0.0.1). Zgodny z Windows PowerShell 5.1 i PowerShell 7.
$ErrorActionPreference = 'Stop'
$App = Split-Path -Parent $PSScriptRoot
$Root = [System.IO.Path]::GetFullPath((Join-Path $App 'public'))
$Port = 4173
if ($env:ENDOLIST_PORT) { $Port = [int]$env:ENDOLIST_PORT }
$Version = '0'
try { $Version = (Get-Content -Raw -Encoding UTF8 (Join-Path $App 'package.json') | ConvertFrom-Json).version } catch {}
$Types = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json'; '.webmanifest' = 'application/manifest+json'
  '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.woff2' = 'font/woff2'; '.ttf' = 'font/ttf'; '.ico' = 'image/x-icon'
}
$Utf8 = New-Object System.Text.UTF8Encoding($false)

function Send($stream, [int]$code, [string]$status, [string]$type, [byte[]]$body, [bool]$head) {
  $h = "HTTP/1.1 $code $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nX-Content-Type-Options: nosniff`r`nReferrer-Policy: no-referrer`r`nConnection: close`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($h)
  $stream.Write($hb, 0, $hb.Length)
  if (-not $head -and $body.Length) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}
function Text([string]$s) { return $Utf8.GetBytes($s) }

function Handle($client) {
  $stream = $client.GetStream()
  $stream.ReadTimeout = 3000
  # read the request head (GET/HEAD only — no body)
  $buf = New-Object byte[] 16384; $len = 0; $deadline = [DateTime]::UtcNow.AddSeconds(3)
  while ($len -lt $buf.Length) {
    if ($client.Available -gt 0) { $len += $stream.Read($buf, $len, [Math]::Min($client.Available, $buf.Length - $len)) }
    elseif ([DateTime]::UtcNow -gt $deadline) { break }
    else { Start-Sleep -Milliseconds 2 }
    $txt = [System.Text.Encoding]::ASCII.GetString($buf, 0, $len)
    if ($txt.Contains("`r`n`r`n")) { break }
  }
  $line = ([System.Text.Encoding]::ASCII.GetString($buf, 0, $len) -split "`r`n")[0]
  $parts = $line -split ' '
  if ($parts.Length -lt 2) { return }
  $method = $parts[0]; $target = $parts[1]
  $head = ($method -eq 'HEAD')
  if ($method -ne 'GET' -and -not $head) { Send $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' (Text 'Nieobsługiwane') $false; return }
  $path = [System.Uri]::UnescapeDataString(($target -split '\?')[0])

  # stop request from a newer launcher (custom header: a web page cannot send it without a CORS preflight)
  if ($path -eq '/api/quit' -and ([System.Text.Encoding]::ASCII.GetString($buf, 0, $len) -match '(?im)^X-EndoList:\s*quit')) {
    Send $stream 200 'OK' 'text/plain; charset=utf-8' (Text 'bye') $false; $script:quit = $true; return
  }
  if ($path -eq '/api/status') {
    $json = (@{ app = 'EndoList'; version = $Version; dir = $App; sync = $false; server = 'powershell' } | ConvertTo-Json -Compress)
    Send $stream 200 'OK' 'application/json' (Text $json) $head; return
  }
  if ($path -eq '/config.json') {
    $urlFile = Join-Path $App 'sync-url.txt'
    if (Test-Path $urlFile) {
      $u = (Get-Content -Raw -Encoding UTF8 $urlFile).Trim()
      if ($u) { Send $stream 200 'OK' 'application/json' (Text ((@{ syncUrl = $u }) | ConvertTo-Json -Compress)) $head; return }
    }
  }
  if ($path.EndsWith('/')) { $path += 'index.html' }
  $file = [System.IO.Path]::GetFullPath((Join-Path $Root ($path.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar)))
  if (-not $file.StartsWith($Root, [System.StringComparison]::OrdinalIgnoreCase)) { Send $stream 403 'Forbidden' 'text/plain; charset=utf-8' (Text 'Brak dostępu') $false; return }
  if (-not [System.IO.File]::Exists($file)) { Send $stream 404 'Not Found' 'text/plain; charset=utf-8' (Text 'Nie znaleziono') $head; return }
  $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
  $type = 'application/octet-stream'; if ($Types.ContainsKey($ext)) { $type = $Types[$ext] }
  Send $stream 200 'OK' $type ([System.IO.File]::ReadAllBytes($file)) $head
}

$LogDir = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'EndoList'
if (-not ([Environment]::GetFolderPath('LocalApplicationData'))) { $LogDir = Join-Path ([System.IO.Path]::GetTempPath()) 'EndoList' }
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir 'endolist-server.log'
function Log([string]$m) { $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m"; Write-Output $line; try { Add-Content -Path $Log -Value $line -Encoding UTF8 } catch {} }

# listen on 127.0.0.1 and, when available, ::1 (browsers may try either for "localhost")
$listeners = @()
try { $l4 = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port); $l4.Start(); $listeners += $l4 }
catch { Log "Port $Port zajęty — EndoList prawdopodobnie już działa ($($_.Exception.Message))"; exit 0 }
try { $l6 = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::IPv6Loopback, $Port); $l6.Start(); $listeners += $l6 } catch {}
Log "EndoList: http://localhost:$Port  (folder: $Root)"
# one thread, many connections: serve whichever socket has a request; drop idle ones (browsers open spare connections)
$clients = New-Object System.Collections.ArrayList
while ($true) {
  foreach ($listener in $listeners) { while ($listener.Pending()) { [void]$clients.Add(@{ c = $listener.AcceptTcpClient(); t = [DateTime]::UtcNow }) } }
  foreach ($e in @($clients)) {
    $c = $e.c
    try {
      if ($c.Available -gt 0) { Handle $c; $c.Close(); $clients.Remove($e); if ($script:quit) { Log 'Zatrzymano na prośbę nowszej wersji.'; foreach ($l in $listeners) { $l.Stop() }; exit 0 } }
      elseif (([DateTime]::UtcNow - $e.t).TotalSeconds -gt 20) { $c.Close(); $clients.Remove($e) }
    } catch { Log "Błąd żądania: $($_.Exception.Message)"; try { $c.Close() } catch {}; $clients.Remove($e) }
  }
  if ($clients.Count -eq 0) { Start-Sleep -Milliseconds 15 } else { Start-Sleep -Milliseconds 1 }
}
