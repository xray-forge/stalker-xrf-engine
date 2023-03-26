# [XRF](../README.md) / [DOCS](./README.md)

## 🧰 Checking game logs

To enable loggingб make sure the `GameConfig` logging flag is set to true. <br/>

Depending on how you run the game, you can use the following approaches to check the logs:

## With pre-built engine

- Make sure you are using the custom engine. If not, switch to the mixed/release variant: `npm run engine use release`
- Link the application logs folder with the target directory: `npm run link`
- Start the game (`npm run start_game`) and check the log files in `target/logs_link` directory

## With visual studio

- Just run the project and check `Output` window of application
