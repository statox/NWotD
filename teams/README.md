# Teams Virtual Background

Changing the virtual background for Teams is trickier than for Zoom: By default Teams provides a fixed set of virtual backgrounds and only the team admin can change the available background. To get these virtual backgrounds the client makes HTTP calls to a Microsoft server: one to get the list of available backgrounds, one for each background to get its thumbnail and one to get the selected background.

There is a work around to use your own background but it is not straight forward:

- One need to use this unofficial teams client [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux) (A snap package is available)
- Then change the configuration of the client to instruct it to fetch custom virtual backgrounds.
- Then run a local webserver which exposes a configuration file and the background.
    - The server needs to be running at least each time you start teams-for-linux, so it is convenient to have it run constantly. **Set up a firewall to make sure you don't expose your machine to the network** your security team might already not be super happy that you use a non official client, don't expose a webserver publicly in addition.

All of this is following the doc of `teams-for-linux` [here](https://github.com/IsmaelMartinez/teams-for-linux/tree/main/app/customBackground/example)
The default background `visar-neziri-CAQvwCoHLhw` provided in this repo also comes from [the repo](https://github.com/IsmaelMartinez/teams-for-linux/tree/d1c20772b9b/app/customBackground/example) it should be free to use, credits to [Visar Neziri on Unsplash](https://unsplash.com/photos/aerial-photography-of-rock-formation-CAQvwCoHLhw)

## Setup

- Install [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux) (`sudo snap install teams-for-linux`)
- Run `NWoTD` a first time and create a symlink between `$TODAY_WP_PATH` and `./apod`
- Make sure you have `node` and `npm` installed (so that `npx` is available) and update `$NPX` in `./server.sh` to point to the npx binary
- Run the server `./server.sh` before starting `teams-for-linux`
    - You can change the command in the script to expose the server to a different port
    - You can change `./config.json` to expose more virtual backgrounds
    - **Make sure to have all paths starting with `/evergreen-assets/backgroundimages/` this comes from Teams original app and must be there.**
- Copy `./client_config.json` to `~/snap/teams-for-linux/current/.config/teams-for-linux/config.json` (If not using the snap package check [the doc](https://github.com/IsmaelMartinez/teams-for-linux/blob/main/app/config/README.md) to find out where to put this file)
    - You must change the port of the local webserver in this file if you changed it in `./server.sh`
- Start `teams-for-linux`
- When starting a new meeting the backgrounds should be available.
