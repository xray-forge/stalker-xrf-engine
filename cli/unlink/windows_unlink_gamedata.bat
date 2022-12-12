:: Unlink game with target folder

:: Read game path config
@call ".\cli\utils\ini" "./config.ini" STALKER_GAME_FOLDER_PATH GameFolder
@echo Un-linking target target/gamedata folder from: %GameFolder%

:: Remove symlink from target folder
@rmdir "%GameFolder%\gamedata"
