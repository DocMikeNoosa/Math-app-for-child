# One-line installer for picture making (and optionally video). Paste into PowerShell:
#   irm https://raw.githubusercontent.com/DocMikeNoosa/Math-app-for-child/claude/dazzling-bohr-1gdahq/open-webui/images.ps1 | iex
# For video too, first run:  $global:LocalAIArgs = '-Video'
if (-not $global:LocalAIArgs) { $global:LocalAIArgs = '-Images' }
try {
    irm https://raw.githubusercontent.com/DocMikeNoosa/Math-app-for-child/claude/dazzling-bohr-1gdahq/open-webui/install.ps1 | iex
} finally {
    Remove-Variable -Name LocalAIArgs -Scope Global -ErrorAction SilentlyContinue
}
