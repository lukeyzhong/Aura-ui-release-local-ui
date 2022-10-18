# AuraUi

## Description

Aura application is used to take care the complete recruitment process. This application contains different modules like Sales, HR, Recruitment, Reports and Admin. Using admin module, we can manage access of a user to different modules. Sales module is used by business development manager. HR module has document management system. Using reports module different reports can be seen related to different sections.

[Demo Link](https://antra-inc.github.io/Aura-ui/)

## Prerequisites

Install [Node version 12](https://nodejs.org/download/release/v12.0.0/)

## Installation

1. Clone the repo:

```
git clone https://github.com/Antra-Inc/Aura-ui.git
```

2. Install NPM packages:

```
npm install
```

## local env setup

1. `npm run start`
2. open chrome with disable-security mode in OSX
   in terminal:
   `open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security`

3. visit http://localhost:4200/login from the chrome you just opened.

## Build

Run `npm rum build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Deploying to Github Pages

CICD will auto deploy the main branch of aura-ui to the git pages.

## Further help

For further help. Please contact below team members:

1. Yuhan Lin (yuhan.lin@antra.com)
2. Rajeev Kumar (rajeev.kumar@antra.com)
3. Narendar Gentyala (narendar.gentyala@antra.com)
