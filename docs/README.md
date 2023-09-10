# Tales Tech Encyclopedia

Tales Tech Encyclopedia (TTE), is a project that aims to document techniques and mechanics on the games of the "Tales of Series". This includes glitches, exploits or any other behavior that can be reproduced. The project is still in development (everything is subject to change).

Project started 12th of April of 2021.

## Project

TTE is simple static website aimed to be lightweight and easy to use. It is based on human-redable Markdown pages for game articles. This makes contributions and maintainability easier due to not requiring any knowledge of HTML or CSS.

The project currently uses only basic web technologies and javascript. We use **esbuild** for bundling, and you can see instructions on how to build it yourself on the section below. We also use **remarkable** for parsing markdown files.
Pull Requests for Front-End or redabiliy improvements are welcome! Just make sure to follow the guidelines from the "How to Contribute" page (on the footer of the website) and to keep the site static and fast.

## Building

First, [install npm](https://www.npmjs.com/get-npm) on your machine.

For testing, you can clone/download the repository with git/github and run the following command on the root folder of the project:

- npm install
- npm run build

*npm install* will install all required dependencies and create a node_modules folder on the repository. By running *npm run build* both javascript files in src/ will be packaged and overwrite the ones at docs/scripts/.

After that you can open a web server on your local host to test the page. This is required to avoid CORS errors. If you install the Web Dev packages on Visual Studio you can easily test the page by the "Go Live" button at the bottom bar. Other users can use different methods such as using [Python](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server).

Make sure to run *npm run build* after any modification of the files on src/. Javascript/CSS/HTML files on docs/ should not be modified.

*npm install* should also be run after modifications to the package.json file (including version changes).
