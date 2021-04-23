:::newsheader{data-tags="{'media' : 'news/books.webp', 'dateDay' : 15, 'dateMonth' : 'APR', 'description' : 'The birth of Tales Tech Encyclopedia!'}"}

# TTE

:::

TTE is fueled by the Unified toolchain to parse tech documents and news into the website. It supports GFM (Github Flavored Markdown) and multiple others functionalities such as emojis (:joy:), math and custom directives (from commonmark) for media and tag handling.

:::tagging{data-tags="{'versions' : ['All versions of TTE!'], 'todo' : true}"}
In the future, special icons will appear on this paragraph! To use this special tagging, just follow examples for now.
:::

Project started 12th of April.

:::tagging{data-tags="{'versions' : ['All versions of TTE!'], 'todo' : true}"}

### We can also tag headers! And not use all options!

:::

The toolchain: Unified, esbuild, prettier, npm. Only javascript and css.

## Table of Contents

## TOC Explanations

TTE also has automatic Table of Contents creation. Just add a markdown heading after the Table of Contents header is defined! It also obtains headings from inside custom directives.

> ## Example
>
> This, since it is a block quote, will not enter the ToC.

Due to GFM, task-lists can be used to track progress in different topics during documents:

## Task-list for next versions

(!) For bug fixes. Rest for base functionality.

- [x] Basic inspiration. (https://ballsystemgroup.it/it/about/) + design images on TTE folder.
- [x] Start of project.
- [x] Nav bar definition. + Placeholders for section heading and content.
- [x] Logo and icon art. Fonts to be used in the project.
- [x] Interactive logo on nav-bar, used to return to homepage/news. (Also added placeholder search box)
- [x] Tab bar definition.
- [x] Tab bar created with scroll and fade. Tooltips added to buttons.
- [x] Considerations on how to handle tech documents. Needs to be very human readable to allow more contributions. Needs to be able to be digested by JS. Solution: a lightweight markup language.
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
- [x] Card system to present News (how to differentiate between different headers of news? Make a folder only for news and a handler?) (make shadow effect when hovering cards)
- [x] Add sidebar to quotes. (markdown)
- [x] Styling update (divide into multiple files, the first file, loaded first, is for global stuff, after that things like nav bar...) + name re-definition.
- [x] Simple Footer
- [x] Code organization, comments and considerations (change to ts? NO).
- [x] Variable names checks and others (JSPrettier).
- [x] Add placeholder files, update package.json and add gitignore
- [x] Test on GitHub pages.
- [x] Handle footer pages. (redirect to a document on root folder when using footbar links)
- [x] Better styling for headers/text. (Based on GitHubs markdown styling.)
- [x] Search system on nav bar (checks heading from tech files and present Gamename-bold + headername-italics. Redirects to game and header somehow)
- [x] Update bottom left and right border on keyup. (Update back on clear) (So start round then once start typing animate -- if possible -- to 0 px.)
- [x] Research on news file handling. Will have to stay the same due to CORS errors.
- [x] Translate ToV documents.
- [x] Include basic battle explanations and better format ToV document.
- [x] Make so that search filters things based on words. So for example, one can search TOV Cancel and all matches that have both words will come out (no need for strict word search)
- [x] Make media on some techs.
- [x] Research proper media format for videos. Convert recorded videos to format. (MP4, 1000kbps, no audio, 30 fps, 480p, videos no more than 30s)
- [x] Add icons to tagged elements to represent each information. Forced video means inside the div, non-forced on hover like the other icons. All icons are images that present something on hover.
- [x] Format and comment HTML and css files.
- [x] https://developers.google.com/speed/pagespeed/insights/ Test and try to fix. Maybe offloading fonts? Images seem like a big problem.
- [x] Properly tag and test every header. ToDPS2. Review Page.
- [x] Javascript handling of checkboxes.
- [x] Proper code formatting with Highlight.js
- [x] Separate game media on folders (ex: media/tod/gliding.mp4)
- [x] Function for global updates every time a new markdown page is loaded.
- [x] (!) Search redirect missing target (ex: ToDPS2 SB Cancel)
- [x] Properly tag and test every header. ToV. Review Page.
- [x] Change nav-bar depending on viewport size.
- [x] In case of just using the search for nav-bar, make sure there is a base page reference there (so ToV, TODPS2, TOL...)
- [x] (!) Cards resize only on one axis (instead of keeping aspect-ratio) when resizing window (x or y). (Content box resize on viewport change alleviates the problem. Only happens in extreme zoom now.)
- [x] Update Copyright notice. (Floating left beneath the horizontal logo. Styling like the section heading?)
- [ ] Record media for Spell Cancel and static FRC. (TOV)
- [ ] Styling guide document
- [ ] Remake news1 page. (Whats is TTE about? --> Documentation of useful techniques for both battle and exploration, while also giving a explanation of the battle system of each game) (glitches/techs that are not useful -- such as softlocks and freezes -- can be kept in github issues in case they can be exploited for good effects in the future) (glitches/mechanics that appear during combat, even if negatively, should also be documented in the pages)
- [ ] Code review (code flow, function sizes, comments, important segments...)
- [ ] (!) Media cannot play warning.
- [ ] Test other OSs and browsers.
- [ ] ... (period to gather feedback)
- [ ] README.
- [ ] How to Contribute (+ How to use Github for the project --> Issues can be both bug reports and tech descriptions. Need tags for both.)
- [ ] Styling guide.
- [ ] Where to store media?
- [ ] https://developers.google.com/speed/pagespeed/insights/ Part2
- [ ] Keep an object/map with parsed md pages to improve runtime. Async on page start, so most functions can be asynchronous and just wait for the map entry to be ready.
- [ ] ... (period of release)
- [ ] Mobile port
- [ ] White theme
- [ ] Full Custom Tab bar (JS)
- [ ] Modifications needed and tutorial on how to fork and use for other game series. (Set as template on github and make a naked template branch? -- demo images and documents)

## Autolink literals

Due to using GFM, TTE supports autolink literals that do no require special markdown syntax to work. See the examples below:

www.example.com, https://example.com, and contact@example.com. (P.S. Remember you can use [the default syntax too](http://example.com/)!)

The table of contents also has links created automatically by another part of the unified toolchain (slug).

## Strikethrough and Math

TTE supports other specific syntax (including all of the basic Markdown syntax) such as the above.

~one~ or ~~two~~ tildes.

Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following
equation. :heart:

$$
L = \frac{1}{2} \rho v^2 S C_L
$$

## Tables

Tables are part of the GFM syntax and can be created as the example below:

| Beep |  No.   |   Boop |
| :--- | :----: | -----: |
| beep |  1024  |    xyz |
| boop | 338845 |    tuv |
| foo  | 10106  | qrstuv |
| bar  |   45   |   lmno |

> Quoteblock test
>> Quoteblock test
> Quoteblock test  
> Quoteblock test

    var thisIs = "Code";
    console.log(thisIs);
    //Code styling by highlight.js
