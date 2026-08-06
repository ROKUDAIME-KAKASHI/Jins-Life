@echo off
echo ===================================================
echo     MEETING TRANSCRIBER - AUDIO SETUP
echo ===================================================
echo.
echo 1. The Sound Control Panel will now open.
echo 2. Right-click anywhere in the list and check "Show Disabled Devices"
echo 3. Right-click "Stereo Mix" and select "Enable"
echo 4. Right-click "Stereo Mix" again and select "Set as Default Device"
echo.
echo When your meeting is over, come back to this same menu 
echo and set your normal Microphone back to Default.
echo.
pause
control mmsys.cpl,,1
