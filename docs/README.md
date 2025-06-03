# Tales Tech Encyclopedia

Tales Tech Encyclopedia (TTE) is a community project that aims to document techniques and mechanics for the various games of the "Tales of Series". Our primary objective is to clarify all gameplay aspects, such as glitches, exploits, or any other behavior that can be reproduced. This project is still in development (everything is subject to change).

Project started 12th of April 2021.

## Project

TTE is a static website. Game articles are formatted as human-readable Markdown pages. This was done to help with maintainability and simplifies the contribution process because it does not require any knowledge of HTML or CSS.

The project currently uses HTML/Typescript/CSS. We use **tsdown** for bundling, and you can see instructions on how to build it yourself in the section below. We also use **remarkable** to parse markdown files.

Pull Requests for Front-End or other improvements are welcome! Just follow the guidelines from the "How to Contribute" page (in the footer of the website).

## Building

First, [install npm](https://www.npmjs.com/get-npm) on your machine.

For testing, you can clone/download the repository with git/github and run the following command on the root folder of the project:

- npm install

*npm install* will install all required dependencies and create a node_modules folder on the repository.

To test the website, the best way is to create a live server on your local machine by running the following command:

- npm run watch

*npm run watch*, will build the project and open a test version of the website on your default browser. This command will also watch for changes in the source files and automatically rebuild the project when a change is detected.

For contributing, the following commands should be run before pushing or creating a pull request:

- tsc
- npm run lint
- npm run prettier
- npm run build

These will check for typescript errors, lint the code, format the code, and build the project for production. These can all be run together with the command **npm run release**.

*npm install* should also be run after modifications to the package.json file (including version changes).
