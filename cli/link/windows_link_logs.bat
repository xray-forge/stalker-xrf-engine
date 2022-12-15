:: Link game with target folder

:: Read game path config
@call ".\cli\utils\ini" "./config.ini" STALKER_LOGS_FOLDER_PATH LogsFolder
@echo Linking target logs folder to current project target/logs

:: Add symlink to use from from target folder
@mklink /J  ".\target\logs\" "%LogsFolder%"

