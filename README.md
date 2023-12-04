# Directus.io Starter Package
A starter package to get a Directus instance up and running quickly. It doesn't cover everything, but it's got a good start. This will create a docker-backed instance of Directus.io, with a container for MySQL. As I learn more, it'll expand.

Directus.io is a great platform that is designed as a headless CMS, but I find its biggest value to me is as a backend for my own applications. It provides a great schema/model builder, UI for managing data manually, and an API layer. Then you just develop your own front-end to consume/populate it.

You should have SOME familiarity with the "normal" setup process too: https://docs.directus.io/self-hosted/quickstart.html?fbclid=IwAR1c79l9rwjaZVHguj6zqp-bUh7MWVUp5vjebcaEuuXlzoM21_F9D-CCYrc

-----

## Requirements
Everything I've done is based on a Mac, so if you are working on anything you might need to do some digging and modifications.

- Install `Docker Desktop`: https://www.docker.com/products/docker-desktop/
  - alternatively: https://docs.docker.com/engine/install/
- `NodeJS`: https://formulae.brew.sh/formula/node
  - alternatively: https://nodejs.org/en/learn/getting-started/how-to-install-nodejs

-----

## Setup
1. Install everything in the Requirements above, make sure Docker is actively running
2. Clone the repo locally: `git clone https://github.com/nodeGarden/directus_starter.git`
3. Install dependencies: `npm install`
3. Install dependencies: `npm run installDev`
4. Generate an `.env` file: `npm run generate_env`
5. Answer all the questions
6. Edit the `docker-compose.yml`: Do a Find-and-Replace of `**APP_NAME**` with your actual app name (no spaces, e.g. myapp)
7. Change the `Dockerfile`: make sure to update the Directus build version: `FROM directus/directus:10.8.2` to the latest: https://github.com/directus/directus/releases (using "latest" isn't always reliable/advised)
8. Start the services: `npm run start`
9. Open your browser: `http://localhost:8055/` (or whatever port you specified)
   1.  Remember your email is: `<APP_EMAIL_USER>+<APP_NAME>@<APP_EMAIL_DOMAIN>`... e.g.: `mondo+myapp@gmail.com`
   2.  Grab your password from the `.env` file with `<APP_ADMIN_PASSWORD>`

-----

## How it works
I'll assume everything up until the `generate_env`, `Dockerfile`, and `docker-compose.yml` is understandable.


### Scripts
One exception is lets talk about the `npm/npm` scripts:

```json
  "scripts": {
    "start": "docker-compose up --build",
    "stop": "docker-compose down",
    "rebuild": "docker build --pull --no-cache",
    "preinstall": "export NODE_ENV=development",
    "postinstall": "mkdir -p ./extensions && mv node_modules/directus-extension* ./extensions/ && mv node_modules/@premieroctet/* ./extensions/ && rm node_modules/.package-lock.json && rm -R node_modules && mkdir -p ./uploads",
    "generate_env": "node env_generator.mjs",
    "start_over": "rm -R extensions & rm -R node_modules",
    "installDev": "npm install inquirer randexp"
  },
```

- `Start`: of course just calls docker-compose to launch the docker containers and rebuild if needed
- `Stop`: probably never needs to be called, since you'll likely just `ctrl + c` to get out of it, unless its running from a prior invocation
- `rebuild`: do a rebuild of the docker containers, usually because you are forcing updates that the `start` and `--build` option isn't catching
- `postinstall`: since extensions would first be installed in `node_modules`, but the `extensions` is the folder that gets persisted into the container, we must move all the files into there, and then we delete the `node_modules` folder.
- `generate_env`: this kicks off a command line questionnaire to get all information for generating the `.env` file (more below)
- `start_over`: I've added this as I go through many iterations of moving extensions around. This will probably get more complex later, for now just deletes the `node_modules` folder content

### Extensions
Then lets look at the Extensions installed via the `dependencies` section of `package.json`.

```json
  "dependencies": {
    "@premieroctet/directus-extension-sql-panel": "latest",
    "directus-extension-field-actions": "latest",
    "directus-extension-group-modal-interface": "latest",
    "directus-extension-sanitize-html": "latest",
    "directus-extension-sparkline-display": "latest",
    "directus-extension-tags-m2m-interface": "latest"
  },
  ```
Essentially any extensions we want installed for the Directus platform go here. These are ones I've been personally using, you might want to change up this list. In the future I'd like to make this part of the generator.

### ENV_GENERATOR
This uses Inquirer to and CLI prompts for data, and performs some BASIC validations and transformations. All questions then populate a template literal of what would go into the `.env` file. 

Please read the documentation for Inquirer: https://github.com/SBoudrias/Inquirer.js

In the future this will also populate parts of the `package.json` and would be run before install, or require an additional install call.

We automatically generate a hash value with the format: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX`. If you want a different number of characters, change the values: `{8}`, `{4}`, `{4}`, `{4}`, `{8}`. If you are good at regex, you can also change the criteria. I'm just using lower-and-upper-case letters only.

```js
    const key = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const secret = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const admin_password = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const db_pass = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
    const db_root = new RandExp(/^([a-zA-Z]){8}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){4}-([a-zA-Z]){8}$/).gen();
```


### docker-compose.yml
You'll see if basically just pass the values from `.env` into here, but there are a couple cases were I have hard-coded patterns.

**IMPORTANT** Don't forget the step to do a find/replace of the string `**APP_NAME**` with the actual app name (until the generator can handle this)

- `ADMIN_EMAIL: "${APP_EMAIL_USER}+${APP_NAME}@${APP_EMAIL_DOMAIN}"`   e.g.: `mondo+myapp@gmail.com`
- `EMAIL_FROM: "${APP_EMAIL_USER}+${APP_NAME}+server@${APP_EMAIL_DOMAIN}"`  e.g.: `mondo+myapp+server@gmail.com`

I do this so that I don't need to make multiple email users (you can change if you like), as well as creating easy filters within Gmail.

### Dockerfile
Make sure to change the `FROM directus/directus:10.8.2` bit to the latest release number: https://github.com/directus/directus/releases

Really shouldn't be anything else to do here unless you want to have any other things run on startup. I don't advise moving to NPM install of extensions each time, because some extensions may need to write files that need to persist. Remember docker storage will reset each time.

-----

## To-Do's
- [ ] Have the generator modify `docker-compose.yml` and do find/replace of `**APP_NAME**`
- [ ] Have the generator also modify `package.json` dependencies
