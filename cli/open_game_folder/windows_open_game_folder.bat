:: Read game path config
@call ".\cli\utils\ini" ".\config.ini" STALKER_GAME_FOLDER_PATH GameFolder
@echo Open game from: %GameFolder%

:: Open game folder
@explorer "%GameFolder%"
