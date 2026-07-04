# PowerShell script to fix Antigravity IDE update location issues

# 1. Update registry properties for the Antigravity IDE (User) installation
$registryPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\{AA73B3E3-C6C8-45C8-B1DC-4AE56C751432}_is1"

if (Test-Path $registryPath) {
    Write-Host "Updating registry paths to D:\Antigravity\Antigravity IDE..."
    Set-ItemProperty -Path $registryPath -Name "Inno Setup: App Path" -Value "D:\Antigravity\Antigravity IDE" -ErrorAction Stop
    Set-ItemProperty -Path $registryPath -Name "InstallLocation" -Value "D:\Antigravity\Antigravity IDE\" -ErrorAction Stop
    Set-ItemProperty -Path $registryPath -Name "DisplayIcon" -Value "D:\Antigravity\Antigravity IDE\Antigravity IDE.exe" -ErrorAction Stop
    Set-ItemProperty -Path $registryPath -Name "UninstallString" -Value '"D:\Antigravity\Antigravity IDE\unins000.exe"' -ErrorAction Stop
    Set-ItemProperty -Path $registryPath -Name "QuietUninstallString" -Value '"D:\Antigravity\Antigravity IDE\unins000.exe" /SILENT' -ErrorAction Stop
    Write-Host "Registry paths updated successfully."
} else {
    Write-Warning "Registry key for Antigravity IDE not found under HKCU Uninstall."
}

# 2. Update user PATH environment variable to remove the invalid C: drive bin folder
Write-Host "Cleaning up PATH environment variable..."
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($oldPath -like "*C:\Users\Acer\AppData\Local\Programs\Antigravity IDE\bin*") {
    $pathElements = $oldPath -split ";" | Where-Object { $_ -ne "C:\Users\Acer\AppData\Local\Programs\Antigravity IDE\bin" -and $_ -ne "" }
    $newPath = $pathElements -join ";"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Removed C: drive bin path from PATH."
} else {
    Write-Host "C: drive bin path was not found in PATH."
}

# 3. Clean up the C: folder if it exists
$cFolder = "C:\Users\Acer\AppData\Local\Programs\Antigravity IDE"
if (Test-Path $cFolder) {
    Write-Host "Removing partial files from $cFolder..."
    Remove-Item -Path $cFolder -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $cFolder) {
        Write-Warning "Could not completely delete $cFolder (some files might be locked). It will be safe to delete manually later."
    } else {
        Write-Host "Cleaned up C: drive folder successfully."
    }
}

# 4. Trigger the installer setup with the update parameters
$setupExe = "C:\Users\Acer\AppData\Local\Temp\antigravity-stable-user-x64\AntigravitySetup-stable-e0b7a2bcf575cfba10528c4e7c10bd3ce2d7769a.exe"
if (Test-Path $setupExe) {
    Write-Host "Triggering update installer targeting the D: drive..."
    Start-Process -FilePath $setupExe -ArgumentList "/verysilent /log /update=""C:\Users\Acer\AppData\Local\Temp\antigravity-stable-user-x64\AntigravitySetup-stable-e0b7a2bcf575cfba10528c4e7c10bd3ce2d7769a.flag"" /sessionend=""C:\Users\Acer\AppData\Local\Temp\antigravity-stable-user-x64\session-ending.flag"" /nocloseapplications /mergetasks=runcode,!desktopicon,!quicklaunchicon"
    Write-Host "Update installer has been triggered silently."
    Write-Host "IMPORTANT: Please restart your Antigravity IDE (close and reopen it) to let the update finish applying."
} else {
    Write-Host "Setup installer was not found in the Temp directory. You can trigger the update again from inside the IDE (Help -> Check for Updates)."
}
