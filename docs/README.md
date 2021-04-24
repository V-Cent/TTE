# Tales Tech Encyclopedia

Tales Tech Encyclopedia (TTE), is a project that aims to document useful techniques on the different games of the "Tales of Series". Here will be documented useful techniques for both battle and exploration, while also giving an explanation of the battle system of each game.

TTE will also keep track of different glitches and exploits in each game. Glitches/techs that are not useful (such as softlocks and freezes) should be kept as Issues in GitHub in case they can be exploited for beneficial effects in the future. Glitches/Techs/Mechanics that appear during combat, even if they have negative effects, should be documented in their respective pages.

Project started 12th of April of 2021.

## Toolchain

TTE is fueled by the Unified collective to parse tech documents and news into the website. It supports GFM (Github Flavored Markdown) and multiple others functionalities such as emojis (:joy:), math and custom directives (from commonmark) for media and tag handling.

The following tools/libraries are utilized: Unified, esbuild, prettier, npm.

Pages use only pure javascript and html/css.

## Building

First, [install npm](https://www.npmjs.com/get-npm) on your machine.

For testing, you can clone/download the repository with git/github and run the following command on the root folder of the project:

- npm install
- npm run build

*npm install* will install all required dependencies and create a node_modules folder on the repository. By running *npm run build* both javascript files in src/ will be packaged and overwrite the ones at docs/scripts/.

After that you can open a web server on your local host to test the page. This is required to avoid CORS errors. If you install the Web Dev packages on Visual Studio you can easily test the page by the "Go Live" button at the bottom bar. Other users can use different methods such as using [Python](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server).

Make sure to run *npm run build* after any modification of the javascript files on src/. Files on docs/scripts/ should not be modified.

*npm install* should also be run after modifications to the package.json file (including version changes).
