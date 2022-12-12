:: Read game path config
@call ".\cli\utils\ini" ".\config.ini" STALKER_GAME_FOLDER_PATH GameFolder
@call ".\cli\utils\ini" ".\config.ini" STALKER_GAME_EXE_NAME ExeName
@echo Starting game from: %GameFolder%
@echo Using executable: %ExeName%

:: Start game
@start "" "%GameFolder%\%ExeName%" -gbg
@echo Executed: "%GameFolder%\%ExeName%", admin permission may be required if cmd is ignored
