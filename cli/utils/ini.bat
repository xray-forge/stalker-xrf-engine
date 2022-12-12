:ini
@for /f "tokens=2 delims==" %%a in ('find "%~2=" "%~1"') do @set %~3=%%a
@goto:eof
