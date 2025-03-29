# Tales Tech Encyclopedia

Tales Tech Encyclopedia (TTE) is a community project that aims to document techniques and mechanics for the various games of the "Tales of Series". Our primary objective is to clarify all gameplay aspects, such as glitches, exploits, or any other behavior that can be reproduced. This project is still in development (everything is subject to change).

Project started 12th of April 2021.

## Project

TTE is a simple static website. Game articles are formatted as human-readable Markdown pages. This was done to help with maintainability and simplifies the contribution process because it does not require any knowledge of HTML or CSS.

The project currently uses only basic web technologies and javascript. We use **esbuild** for bundling, and you can see instructions on how to build it yourself in the section below. We also use **remarkable** to parse markdown files.

Pull Requests for Front-End or other improvements are welcome! Just follow the guidelines from the "How to Contribute" page (in the footer of the website) and keep the site static and fast.

## Building

First, [install npm](https://www.npmjs.com/get-npm) on your machine.

For testing, you can clone/download the repository with git/github and run the following command on the root folder of the project:

- npm install
- npm run build

*npm install* will install all required dependencies and create a node_modules folder on the repository. By running *npm run build*, source files from the src/ folder will be packaged and overwrite the ones at docs/scripts/.

After that, you can open a web server on your local host to test the page. This is required to avoid CORS errors. The HTML file you should serve is the one located on docs/. If you install the Web Dev packages on Visual Studio you can easily test the page by the "Go Live" button at the bottom bar. Other users can use different methods such as using [Python](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server).

Make sure to run *npm run build* after any modification of the files on src/. Javascript/CSS/HTML files on docs/ should not be modified.

**Nodemon** is also used as a project dependency to automatically watch file changes and build the project. To use it, run *npm run watch* on the root folder of the project. With this, any file change on src/ will automatically trigger a build.

*npm install* should also be run after modifications to the package.json file (including version changes).

Additionally, we have two commands for code linting and formatting:

- npm run lint
- npm run prettier

These can be used before pushes/PRs to guarantee the changes come up clean in our github workflow.
