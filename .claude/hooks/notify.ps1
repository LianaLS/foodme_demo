param(
  [string]$Title = "Claude Code",
  [string]$Message = "Done"
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$balloon = New-Object System.Windows.Forms.NotifyIcon
$balloon.Icon = [System.Drawing.SystemIcons]::Information
$balloon.BalloonTipTitle = $Title
$balloon.BalloonTipText = $Message
$balloon.Visible = $true
$balloon.ShowBalloonTip(5000)

Start-Sleep -Seconds 6
$balloon.Dispose()
