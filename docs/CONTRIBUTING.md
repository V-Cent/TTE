# How to Contribute

We appreciate your interest in contributing to TTE!

If you wish to contribute on the page of a game, such as adding **new techniques**, clarifying old ones, **fixing errors**, and the sort, TTE provides two alternatives. First, you may directly edit the files with a Github account. In this project, articles are written in markdown, which is a simple text format that is used in multiple projects (like when you type in Discord!). If you need some guidance on how to work with markdown files, you can check our styling guide which is found at the bottom of every page. More information on contributing using Github can be found further in this article. Another alternative for contribution is using the edit functionality that is located in the drop-down menu at the top-right corner of articles. There you can edit the page, prototype and view your changes, and then request a pull request (automatically sent to Github). The edit functionality is the recommended way to contribute to the project and also does not require you to know how to use GitHub or markdown. Make sure to preview your changes before sending them for review! Once you request changes, you will get a link to follow up on the status of your pull request.

The only strict rule we adhere to is making sure the content of the markdown page is fairly original or is given the sources and credits when necessary. If you're not the original author of a guide or a segment of text, make sure to ask for permission first and then add credits to the document. More in-depth rules for contributions can be found below.

If you wish to contribute to the functionality of the page, this website uses HTML/Typescript/CSS. We are also open to the use of web frameworks if needed. If you're an experienced Front-End developer and wish to contribute on this end, feel free to reach out with your ideas on the GitHub discussions page! The project aims to have a light and fast static website where each document is created in a human-readable language, enabling those who do not know any web technologies to contribute easily.

## Tech

For tech pages, our main objective is **inform** the reader. This means a focus on readability, simplicity, and well-defined explanations. Because of that, changes to tech pages can be done both to add new information or to modify the current page to improve a segment and fix any grammar mistakes.

### Writing Style

The following is the writing style that must be followed when contributing to tech pages:

- Prefer short, declarative sentences with simple structure (cut up long sentences into two or more if needed).
- Define every term and acronym before using them.
- Avoid using colloquialisms (casual language or slang).
- Avoid persuasive writing and imperative sentences. For example, on the segment: “You can only perform X once you reach 100 hits. To reach this threshold, use multi-hit attacks or artes.”, the second sentence is unnecessary. Another example: “Use normal attacks after every two artes to avoid X.” can be rewritten as “(Explain X.) A character’s normal attacks affect X, negating its effect if performed after Y.”
- Have visual breaks every ~1 page scroll. This can be images, tables, videos, formulas (in block mode), and even lists.

### Media

Media elements, such as videos and pictures, do not have a strict quality requirement. Since we currently host them together with the site, just keep the size of the files low. The aspect ratio of the original game also needs to match when uploading new media. Higher-quality media may be uploaded once we start using an external service for it.

### Github Discussions

Another objective of TTE is working on techniques that have been already found, but lack a consistent way to perform. For that, we may have segments in tech segments with a TODO tag or we may use GitHub Discussions to track progress on each technique.

If you know about a technique but you're still not sure how it works, you can contribute by updating the GitHub Discussions page of that game. You can also use that page if you know a technique but don't know how to create a Pull Request or simply don't wish to. A team member will add the technique to the page and credit you by linking the GitHub Discussion link.

To use GitHub Discussions, you need to log in to your GitHub account and go to the "Github Discussions" tab of the TTE project repository (not the home page of the app).

### Contributing using Edit

When using the drop-down menu in tech pages, you can edit the **currently** active page. This will open a new menu at the top of the page with various options and an editor (CodeMirror). You may also upload an markdown file to be loaded into the editor or download the current content. By collapsing the advanced options, you can also set a message for the reviewers in your contribution (will not be displayed on the page).

Using the editor is similar to most text editors. Additionally, you can use CTRL + Space to open the command palette, which allows you to easily use TTE's extended syntax.

When finished, backup your changes (either by copying or downloading the markdown file), set your username and password, accept the acknowledgements, and request a pull request. A message will be displayed on the screen with the status of your request.

### Contributing using GitHub

To contribute to a techpage (if using Github and not the edit functionality), you must create a Pull Request that modified a markdown file in the project. The flow to start a Pull Request is to first fork the project. To do that, you can simply check the top right corner of the TTE project page. This fork is where you can make changes that only affect your version of TTE.

You can either clone that fork using git or edit the pages using GitHub itself (something that can be easy since the tech pages are made using the markdown format). After you perform your changes, you can commit it to your fork and then proceed to a pull request.

To start a pull request, you can go to the Pull Requests page for the TTE project and start comparing your version to the current main branch of TTE. Fill in the template that is on the screen and you're done! A team member will review your changes, request modifications if needed, and merge them to TTE.

New pages can be added by creating a new markdown file in the `docs/tech` folder. The file `src/shared/globals.ts` should also be updated to include the page in the build process.

## Enhancements, Bug Fixes and Other

For all other modifications, you can also follow the same tips as above -- use GitHub discussions, create an issue, or create a pull request with your changes.
