# Document Styling

This document will go over the styling guide for markdown files in the TTE project.

Markdown is a lightweight markup language that was chosen to keep track of game specific documents and pages like this one. The main objective of markdown in this project is for pages to be easy for any reader to read and contribute while also being possible to use the same data for the browser.

The format of Markdown used is a subset of GFM (Github Flavored Markdown). Most effects should be able to be shown on Github's parser to check files if the website is offline. Most of the original Markdown syntax also work on GFM and multiple guides are available online for both.

Here we will discuss how to use GFM for the TTE project and how to format pages to keep the same format for games down the line.

## Text

Text in GFM does not need any special formatting. The only specific rule is that line breaks are only considered when at least one line is blank between paragraphs. While you can also create a new line by having the previous line in two spaces, this is not recommended. Not only will it break styling in TTE, it will also make certain syntaxes fail.

Feel free to use new lines sparingly to make the text easier to read. They should also be used any time you want to use a special effect such as spoiler tages, colored text or tagging.

### Text Decorations

You can also decorate your text with **bold** (text between double asterisks or underscores) and _italics_ (text between single asterisk or underscore). You can also mix __*both*__.

Strikethrough can be used by using ~~two~~ tildes.

## Headings

Headings can be defined by starting the line with a hashtag (#). In TTE we use the first heading (#) for the game title. The second and third (## and ###) as sub-titles. And the fourth (####) as tech and glitch definitions.

Heading should not have any special characters such as colons, quotes or exclamation marks. They should also not be used inside quote blocks.

## Ordered and Unordered Lists

Ordered lists can be created by starting the lines by a number and a period. Heres an example:

1. This is the first item.
2. This is the second item.

Unordered list can be created by starting the lines by an hyphen. Heres another example:

- This is the first item... but in an unordered lists that doesn't matter much.
- And I'm the second item!

## Links and Images

Links in markdown can be attributed to any word by encapsulating the word in brackets and the link in parentheses. The link has to follow the closing bracket of the word. Heres an [example](http://example.com/).

Images can be added by using the same syntax as links but with an exclamation mark before the first bracket. The link should be the path to the image file.

## Tables

Tables are part of the GFM syntax and can be created as the example below:

| Beep |  No.   |   Boop |
| :--- | :----: | -----: |
| beep |  1024  |    xyz |
| boop | 338845 |    tuv |
| foo  | 10106  | qrstuv |
| bar  |   45   |   lmno |

They use pipes/vertical bars to define the columns. New lines in the document defined new lines in the table. Hyphens can be used to separate the table heading from the table data. Trailing colons are optional and define the alignment of further elements in the table (left right or center). Heres an example of a delimiter row:

| :- | :-: | --: | :- | -: |

The number of hyphens itself does not matter. However, you can use different numbers to make the table easier to read in text format (keep them in the same size as the table heading).

## Quote Blocks

Quote blocks can be created by starting a line with a greater-than sign (>). They can have multiple levels if needed. If you wish to continue the quote in another line, finish the current line with two empty spaces.

> Quote blocks can be created by starting a line with a greater-than sign (>).
>> They can have multiple levels if needed.

> If you wish to continue the quote in another line,  
> finish the current line with two empty spaces.

Avoid using headings inside quoteblocks.

## Extended Syntax

These allow us to tag any paragraph or heading with objects that are not usually able to be inserted by text. There are two types of extended syntax: inline and block.

Inline syntax works by either using a emphasis symbol (*) or header symbol (#) followed by a colon (:) and the name of the effect. Emphasis symbol should be used for text and should be closed by another symbol. Header Symbol should only be used for headers and it's closed by a new line.

Blocks are created by using three marks (`) followed by the same parameters. The list of available parameters are:

- :! -- *:! Spoiler Tag.*
- :r -- *:r Red* Text.
- :g -- *:g Green* Text.
- :b -- *:b Blue* Text.
- :y -- *:y Yellow* Text.
- :p -- *:p Pink* Text.
- :t -- *:t Teal* Text.
- :{ -- Start of a custom directive.

Custom directives are tags to modify the behavior of pages. They are json objects that are injected as the parent of the current text.
Heres a simple example a custom directive: {'versions' : 'TTE', 'todo' : true}

Headings only allow custom directives. The first colon should also have one space before it. An example: ### :{ 'versions' : 'TTE', 'todo' : true} Heading3.

The possible options are:

- 'versions' : 'text here that defines which versions'
- 'todo' : true (a flag that defines if the section needs work)
- 'media' : 'url' (url of video)
- 'forcedmedia' : true (a flag that defines if the video is forced on the page)

*:{'versions' : 'TTE', 'todo' : true} This is a test!*

Each parameter should be encapsulated in braces like the example above. The name of each parameter is set between single quotes ('); the same should be done for text values.

## Default Format for a Tech Page

TTE does not currently enforce a strict format. However, we do need some care when dealing with headings to keep all pages in the same format. The first heading (#) is only used for the game title. The second (##) is used for section definitions (Base Mechanics, Combat Techniques...). The third (###) is used as a sub-title for normal game mechanics or description of important techs. Finally, the forth heading (####) is used for glitches and tech definitions; they are the ones which are used to fill the search menu, so be sure to only include elements that define new information.

For a specific definition of each segment, follow the guidelines below:

- Every tech pages starts with a heading (#) of the game name followed by a simple description oof when the game was released. After that, every version (if needed) that will be used throughout the document is listed.
- After the list of versions, the TOC is defined (##).
- On the next segment, base mechanics (##) of the game are documented. These will use headings 3 only (###). Definitions of certain mechanics are also explained here. Special thanks can also be placed during the base mechanics heading if needed.
- After that, glitches (##) are documented depending on where they affect. On this segment will not be glitches that are useful for the battle system. Example for glitches sub-titles (###) are: "Equipment/Items/Accessories Glitches", "Out of Bounds and Sequence Breaks", "Exploits" and "Minor Battle Glitches". Use the fourth heading (####) for each glitch description.
- Finally, the Combat Techniques (##) segment starts. Here will be described the various techniques and glitches of the battle system of each game. It will always start with a General Techniques (###) sub-title for each techniques that does not require a segment of its own. Important techniques should have their only section using a sub-title (###). Use the fourth heading (####) for each tech description.

## Other Resources

You probably can edit a page by simply following the syntax of other pages, but in case you want further definitions of GFM and Markdown syntax, you can follow these links: [GFM](https://github.github.com/gfm/), [Markdown](https://www.markdownguide.org/basic-syntax/).
