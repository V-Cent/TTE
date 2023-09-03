# Document Styling

This document will go over the styling guide for markdown files in the TTE project.

Markdown is a lightweight markup language that was chosen to keep track of game specific documents and pages like this one. The main objective of markdown in this project is for pages to be easy for any reader to read and contribute while also being possible to use the same data for the browser.

The format of Markdown used is GFM (Github Flavored Markdown) due to it being modern (having multiple useful features) and easy to check on the github repository. Most of the original Markdown syntax also work on GFM and multiple guides are available online for both.

Here we will discuss how to use GFM for the TTE project and how to format pages to keep the same format for games down the line.

TTE itself also has unique features such as automatic Table of Contents, emojis (:joy:), math and custom directives (from commonmark, another markdown format).

For example, the next heading will start the Table of Contents (TOC) for this whole document. We will create a heading with the text "Table of Contents" and all further headings (that are of the same level or higher than the TOC heading -- more on this later) will automatically be linked by the TOC. TTE also obtains headings from inside custom directives. The TOC heading is instantly followed by the heading of the next section, and has no text.

## Table of Contents

## Text

Text in GFM does not need any special formatting. The only specific rule is that line breaks are only considered when at least one line is blank between paragraphs. You can also end the previous line with two empty spaces for the same effect (not recommended).

### Text Decorations

You can also decorate your text with **bold** (text between double asterisks or underscores) and _italics_ (text between single asterisk or underscore). You can also mix __*both*__.

Strikethrough can be used by using ~one~ or ~~two~~ tildes.

## Headings

Headings can be defined by starting the line with a hashtag (#). In TTE we use the first heading (#) for the game title. The second and third (## and ###) as sub-titles. And the fourth (####) as tech and glitch definitions.

TOC will only list headings of the same level or higher than itself. For example, if your TOC is set as heading two (##) it will only fill itself with heading two or above entries (##, ###, ####...).

## Ordered and Unordered Lists

Ordered lists can be created by starting the lines by a number and a period. Heres an example:

1. This is the first item.
2. This is the second item.

Unordered list can be created by starting the lines by an hyphen. Heres another example:

- This is the first item... but in an unordered lists that doesn't matter much.
- And I'm the second item!

## Autolink Literals & other Link References

Links in markdown can be attributed to any word by encapsulating the word in brackets and the link in parentheses. The link has to follow the closing bracket of the word. Heres an [example](http://example.com/).

Due to using GFM, TTE also supports autolink literals that do no require special markdown syntax to work. See the examples below:

www.example.com, https://example.com, and contact@example.com.

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

Headings inside quoteblocks will not enter the TOC and can only be used for styling.

## Custom Directives

One of the most important features of TTE is custom directives. These allow us to tag any paragraph or heading with objects that are not usually able to be inserted by text. The custom directive syntax used in TTE is a block created with triple colons (:). The start of the block also is followed by the type of the directive (currently only supports "tagging") and parameters between braces/curly brackets ({}).

Heres a simple example of the first part of a custom directive: :::tagging{data-tags="{'versions' : 'TTE', 'todo' : true}"}

By finishing the block with triple :::, the result is this:

:::tagging{data-tags="{'versions' : 'TTE', 'todo' : true}"}
Did it work?
:::

Currently TTE will only accept custom directives that have tagging as its type and the parameter data-tags. The value of data-tags is a simple JSON object. The possible options are:

- 'versions' : 'text here that defines which versions'
- 'todo' : true (a flag that defines if the section needs work)
- 'media' : 'url' (url of video)
- 'forcedmedia' : true (a flag that defines if the video is forced on the page)
- 'dateDay' : 20 (ONLY USED FOR NEWS SEGMENTS) (defines the day the article was created)
- 'dateMonth' : '???' (ONLY USED FOR NEWS SEGMENTS) (defines the month the article was created, three capitalized letters should be used)
- 'description' : 'text here for a quick description' (ONLY USED FOR NEWS SEGMENTS) (a quick description of the news)

Each parameter should be encapsulated in braces like the example above. The name of each parameter is set between single quotes ('); the same should be done for text values.

### Spoiler

Custom Directives can also be used for spoiler tags. They can be either be used in the block format above or inline by using one colon, the name of the effect and the inline text in brackets ([]). The inline format would looks like this : spoiler[], but without the empty space after the colon.

The spoiler tag can be used for game spoilers or anything you want to hide until the user clicks the text. :spoiler[Like this!]

### Colors

You can also use block or inline custom directives for colored text. Currently, TTE supports :red[red], :blue[blue], :green[green], :yellow[yellow], :orange[orange], :purple[purple], :illuminating[illuminating], :classblue[classic blue] (classblue) and :livcoral[living coral] (livcoral).

## Task-lists

Due to GFM, task-lists can be used to track progress in different topics during documents. The lines should start by an hyphen and brackets.

The brackets should be filled with an x if completed and an empty space if not (- [x] or - [ ]). Heres an example:

- [x] Done
- [x] Done
- [ ] Not Done

## Default Format for a Tech Page

TTE does not currently enforce a strict format. However, we do need some care when dealing with headings to keep all pages in the same format. The first heading (#) is only used for the game title. The second (##) is used for section definitions (Base Mechanics, Combat Techniques...). The third (###) is used as a sub-title for normal game mechanics or description of important techs. Finally, the forth heading (####) is used for glitches and tech definitions; they are the ones which are used to fill the search menu, so be sure to only include elements that define new information.

For a specific definition of each segment, follow the guidelines below:

- Every tech pages starts with a heading (#) of the game name followed by a simple description oof when the game was released. After that, every version (if needed) that will be used throughout the document is listed.
- After the list of versions, the TOC is defined (##).
- On the next segment, base mechanics (##) of the game are documented. These will use headings 3 only (###). Definitions of certain mechanics are also explained here. Special thanks can also be placed during the base mechanics heading if needed.
- After that, glitches (##) are documented depending on where they affect. On this segment will not be glitches that are useful for the battle system. Example for glitches sub-titles (###) are: "Equipment/Items/Accessories Glitches", "Out of Bounds and Sequence Breaks", "Exploits" and "Minor Battle Glitches". Use the fourth heading (####) for each glitch description.
- Finally, the Combat Techniques (##) segment starts. Here will be described the various techniques and glitches of the battle system of each game. It will always start with a General Techniques (###) sub-title for each techniques that does not require a segment of its own. Important techniques should have their only section using a sub-title (###). Use the fourth heading (####) for each tech description.

## Default Format for a News Page

News pages should always start by a heading (#) with the following custom directive properties: dateDay, dateMonth and description.

After that, any proper GFM format can be used.

## Other Resources

You probably can edit a page by simply following the syntax of other pages, but in case you want further definitions of GFM and Markdown syntax, you can follow these links: [GFM](https://github.github.com/gfm/), [Markdown](https://www.markdownguide.org/basic-syntax/).

