:::newsheader{data-tags="{'media' : 'news/books.webp', 'dateDay' : 15, 'dateMonth' : 'APR', 'description' : 'The birth of Tales Tech Encyclopedia!'}"}

# TTE Checklist

:::

Here is the checklist that was (and still is) being used to define the progress of the TTE project.

## Task-list for next versions

(!) For bug fixes. Rest for base functionality.

- [x] [Inspiration](https://ballsystemgroup.it/it/about/).
- [x] Start of project.
- [x] Nav bar definition. + Placeholders for section heading and content.
- [x] Logo and icon art. Fonts to be used in the project.
- [x] Interactive logo on nav-bar, used to return to homepage/news. (Also added placeholder search box)
- [x] Tab bar definition.
- [x] Tab bar created with scroll and fade. Tooltips added to buttons.
- [x] Considerations on how to handle tech documents. Needs to be human readable to allow more contributions. Needs to be able to be digested by JS. Solution: a lightweight markup language.
- [x] Checked different definitions on Markdown. Decided on GFM due to ease-of-use, being modern and able to be read easily while in Github Pages.
- [x] Libraries to treat Markdown. Used Unified due to the possible customizations.
- [x] Research on Markdown and how to use on browser. After a lot of searching esbuild was selected to bundle the dependency code to be used on browser.
- [x] Demo News page created.
- [x] Code reformat to keep things simpler and separate (separate markdown handling from page animations/commands).
- [x] Sample page is injected into content section with unified.
- [x] Research on other possible plugins to help user and content customization.
- [x] TOC, math, proper GFM, and emoji support added.
- [x] Research on tagging methods to add specific icons (version, media, TODO, and time). Either macro blocks, generic extensions or directives. Due to errors on both macros and g.extensions, directives were chosen.
- [x] (!) Tagging while preserving the TOC. (Headers inside custom directives.)
- [x] (!) Tagging multiple pieces to data-\*. (Due to limitations went with a simple JSON object.)
- [x] (!) Fix transparent tab bar borders to be locked with the tab bar. Test with different zoom configurations.
- [x] Sticky Section header and style changes.
- [x] Auto load news on start.
- [x] Styling of text (headers, paragraphs, most of the basic stuff that is returned by unified).
- [x] Automatic button to return to TOC once below a certain point of it. "Sticky" to bottom right.
- [x] Smooth scrolling on TOC.
- [x] ToD Tech doc to GFM. Test. (Update GRM inject function to search for tech file and load.)
- [x] Card system to present News.
- [x] Add sidebar to quotes.
- [x] Styling update (divide into multiple files, the first file, loaded first, is for global stuff) + name re-definition.
- [x] Simple Footer.
- [x] Code organization, comments and considerations.
- [x] Variable names checks and others (JSPrettier).
- [x] Add placeholder files, update package.json and add gitignore.
- [x] Test on GitHub pages.
- [x] Handle footer pages.
- [x] Better styling for headers/text. (Based on GitHubs markdown styling.)
- [x] Search system on nav bar.
- [x] Update bottom left and bottom right border on keyup for search box. (Update back on clear)
- [x] Research on news file handling. Will have to stay the same due to CORS errors.
- [x] Translate ToV documents.
- [x] Include basic battle explanations and better format ToV document.
- [x] Make so that the search filters is based on words. So for example, one can search TOV Cancel and all matches that have both words will come out (no need for strict word search).
- [x] Make media on some techs.
- [x] Research proper media format for videos. Convert recorded videos to format. (MP4, 1000kbps, no audio, 30 fps, 480p, videos no more than 30s)
- [x] Treat tagged elements by adding icons to represent each information.
- [x] Format and comment HTML and css files.
- [x] https://developers.google.com/speed/pagespeed/insights/ 1st test and simple fixes.
- [x] Properly tag and test every header. ToDPS2. Review Page.
- [x] Javascript handling of checkboxes.
- [x] Proper code formatting with Highlight.js
- [x] Separate game media on folders (ex: media/tod/gliding.mp4)
- [x] Function for global updates every time a new markdown page is loaded.
- [x] (!) Search redirect missing target.
- [x] Properly tag and test every header. ToV. Review Page.
- [x] Change nav-bar depending on viewport size.
- [x] Add base page reference to search.
- [x] (!) Cards resize only on one axis. (Content box resize on viewport change alleviates the problem. Only happens in extreme zoom now.)
- [x] Update Copyright notice.
- [x] Record media for Spell Cancel. (TOV)
- [x] Styling guide document.
- [x] Remake this page and make a simple README.
- [x] Code review (code flow, function sizes, comments, important segments...) (documentParser has some synchronous-only actions and functions that could be reduced in size/split into two)
- [x] (!) Media cannot play warning.
- [x] (!) Google fonts and other styles blocking page load when offline.
- [x] Test other OSs and browsers.
- [ ] ... (period to gather feedback)
- [ ] README.
- [ ] MacOS testing (Safari)
- [ ] How to Contribute (+ How to use Github for the project --> Issues can be both bug reports and tech descriptions. Need tags for both.)
- [ ] Code of conduct.
- [ ] Organization/Custom Domain.
- [ ] Where to store media? vp8 for Chromium and other android browsers?
- [ ] https://developers.google.com/speed/pagespeed/insights/ Part2
- [ ] Self host icons and fonts.
- [ ] Keep an object/map with parsed md pages to improve runtime. Async on page start, so most functions can be asynchronous and just wait for the map entry to be ready. (Could increase load times, but should result in a better user experience)
- [ ] Apache 2.0 License for Markdown files?
- [ ] ... (period of release)
- [ ] Mobile port
- [ ] White theme
- [ ] Full Custom Tab bar (JS)
- [ ] Project Template format and tutorial on how to fork and use for other game series. (Set as template on github and make a naked template branch -- demo images and documents)
