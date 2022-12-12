:: Link game with target folder

:: Read game path config
@call ".\cli\utils\ini" "./config.ini" STALKER_GAME_FOLDER_PATH GameFolder
@echo Linking target target/gamedata folder to: %GameFolder%

:: Add symlink to use gamedata from target folder
@mklink /J "%GameFolder%\gamedata" ".\target\gamedata\"

