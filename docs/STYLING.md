# Document Styling

This document will go over the styling guide for markdown files in the TTE project.

Markdown is a lightweight markup language that was chosen to keep track of game-specific documents and pages like this one. The main objective of markdown in this project is for pages to be easy for any reader to read and contribute while also being possible to use the same data for the browser.

The format of Markdown used is a subset of GFM (GitHub Flavored Markdown). Most effects should be able to be shown on Github's parser to check files if the website is offline. Most of the original Markdown syntax also works on GFM and multiple guides are available online for both.

Here we will discuss how to use GFM for the TTE project and how to format pages to keep the same format for games down the line. To help in understanding this document, open the raw version of this file and follow along with the examples.

## Text

Text in GFM does not need any special formatting. The only specific rule is that line breaks are only considered when at least one line is blank between paragraphs. While you can also create a new line by having the previous line in two spaces, this is not recommended. Not only will it break styling in TTE, but it will also make certain syntaxes fail.

Feel free to use new lines sparingly to make the text easier to read. They should also be used any time you want to use a special effect such as spoiler tags, colored text, or tagging.

### Text Decorations

You can also decorate your text with **bold** (text between double asterisks or underscores) and _italics_ (text between single asterisk or underscore). You can also mix __*both*__.

Strikethrough can be used by using ~~two~~ tildes.

## Headings

Headings can be defined by starting the line with a hashtag (#). In TTE we use the first heading (#) for the game title. The second heading (##) are categories, which define the current content focus on the page (only one category active at a time). The third heading (###) is for sub-titles. Finally, the fourth heading (####) is for mechanics, tech, and glitch definitions.

Search indexing works for the third and fourth headings. However, any header under a "Mechanics" or "Misc" category (second header) will be ignored. A third heading named "General Techniques" will also be ignored.

Headings can be used freely, but try to use the same categories as other pages.

Heading should not have any special characters such as colons, quotes, or exclamation marks (only dashes are allowed). They should also not be used inside quote blocks or have the same name as another heading in the current file.

## Ordered and Unordered Lists

Ordered lists can be created by starting the lines with a number and a period. Here is an example:

1. This is the first item.
2. This is the second item.

An unordered list can be created by starting the lines with a hyphen. Here is another example:

- This is the first item... but in an unordered list that doesn't matter much.
- And I'm the second item!

## Links and Images

Links in markdown can be attributed to any word by encapsulating the word in brackets and the link in parentheses. The link has to follow the closing bracket of the word. Heres is an [example](http://example.com/).

Images can be added by using the same syntax as links but with an exclamation mark before the first bracket. The link should be the path to the image file. In this case, the word will be hidden and used as an alt (accessibility) text for the image.

## Tables

Tables are part of the GFM syntax and can be created like the example below:

| Beep |  No.   |   Boop |
| :--- | :----: | -----: |
| beep |  1024  |    xyz |
| boop | 338845 |    tuv |
| foo  | 10106  | qrstuv |
| bar  |   45   |   lmno |

They use pipes/vertical bars to define the columns. New lines in the document defined new lines in the table. Hyphens can be used to separate the table heading from the table data. Trailing colons are optional and define the alignment of further elements in the table (left right or center). Heres is an example of a delimiter row:

| :- | :-: | --: | :- | -: |

The number of hyphens itself does not matter. However, you can use different numbers to make the table easier to read in text format (keep them in the same size as the table heading).

## Quote Blocks

Quote blocks can be created by starting a line with a greater-than sign (>). They can have multiple levels if needed. If you wish to continue the quote in another line, finish the current line with two empty spaces.

> Quote blocks can be created by starting a line with a greater-than sign (>).
>> They can have multiple levels if needed.

> If you wish to continue the quote in another line,  
> finish the current line with two empty spaces.

## Extended Syntax

These allow us to tag any paragraph or heading with objects that are not usually able to be inserted by text.

The syntax works by either using an emphasis symbol (*) or heading symbol (#) followed by a colon (:) and the name of the effect. Emphasis symbols should be used for text and should be closed by another symbol. Header Symbol should only be used for headers and it's closed by a new line. Only use underscores or tildes for text decoration when using the extended syntax.

The list of available parameters is as follows:

- :! — *:! Spoiler Tag.*
- :r — *:r Red* Text.
- :g — *:g Green* Text.
- :b — *:b Blue* Text.
- :y — *:y Yellow* Text.
- :p — *:p Pink* Text.
- :t — *:t Teal* Text.
- :{ — Start of a custom directive.

Custom directives are tags to modify the behavior of pages. They are JSON objects that are injected as the parent of the current text.
Here is a simple example of a custom directive: {'versions' : 'TTE'}

By using the emphasis symbol, you can even use them without text to insert something in a line (for example, a video). For example, the custom direction above, when inserted in an empty line, becomes this:

*:{'versions' : 'TTE'}*

Most custom directives also work with headings. In these cases, the first colon should also have one space before it. An example: ### :{ 'versions' : 'TTE', 'todo' : true} Heading3.

For emphasis, you can also group a block of text within it, to tag a specific portion of your paragraph:

*:{'versions' : 'TTE', 'todo' : true} This is a test!*

Parameters should always be encapsulated in braces. The name of each parameter is set between single quotes ('); the same should be done for text values.

The following is a list of custom directives:

> **TODO**

Signifies something is being worked on or tested. It has a simple tooltip when hovered. When used, it will create an icon after the text content. Options for this directive are:

- 'todo' : true (if true, enables this directive)

Example: This is a TODO. *:{'todo' : true}*

> **Versions**

Shows a version-specific icon besides the text. It has a simple tooltip when hovered. Options for this directive are:

- 'version' : 'text' (text will be shown as a tooltip)

Example: This is a version icon. *:{'versions' : 'SNES'}*

> **Media**

Directive for images or videos. Should only be added in the middle of text or for fourth headings (####). They can be forced in the page, or hidden within an icon that needs to be clicked. Options for this directive are:

- 'media' : 'url' (url of video or image)
- 'forcedmedia' : false (optional; default is true; if false, the media hidden in a button)
- 'caption' : 'text' (optional; text will be added as a caption)

Example: This is an example video. *:{'media' : 'media/todps2/push.mp4', 'forcedmedia' : false, 'caption' : 'Example caption.' }*

> **Redirect**

Allows you to create a link to a heading of a tech page. Requires you to provide the link to the specific heading by using following syntax:  #name-of-the-heading. This can only be used in text, not for headings. Options for this directive are:

- 'redirect' : '#link' (id of heading)
- 'document' : 'text' (optional; use to redirect to different game pages; must be the acronym of the game title)

Example: This is an example redirect (will bring you to the Tales of Destiny PS2 page). *:{'redirect' : '#stagger-techniques', 'document' : 'TODPS2'} Stagger Techniques*

Additionally, you can also create redirects for references. When doing this, using the 'redirect' or 'document' options are not needed. Use the text content to signify the number of the reference, like for example this {'reference' : true}1* (this first emphasis symbol was removed to show this in raw text).

- 'reference' : true (if true, the icon will be ommited and the link will go to the references tab)

## Default Format for a Tech Page

TTE does not currently enforce a strict format. However, we do need some care when dealing with headings to keep a consistent feel for the site. The first heading (#) is only used for the game title. The second (##) is used for category definitions (Mechanics, Glitches...). The third (###) is used to start a subsection in that category (broad topic or for an important tech). Finally, the fourth heading (####) is used for glitches and tech definitions.

Every tech page starts with a heading (#) of the game name followed by a simple description of when the game was released. After that, every version (if needed) that will be used throughout the document is listed. A name for each version should also be given, and that name should be used in a custom directive for version-specific segments. The first heading ends with references and special thanks.

The second heading (##) is used for category definitions. While you can create categories as you see fit, the following is the default format:

- "Base Mechanics": This category is used for general game mechanics that are mostly explained in-game. It should not include any fourth headings. *:r __Mandatory.__*
- "Glitches": This category is used for glitches that are not related to the battle system (such as exploration). *:r __Mandatory.__*
- "Combat Techniques": This category is used for techniques and glitches that are related to the battle system. *:r __Mandatory.__*
- "Characters": This category is used for character-specific mechanics, glitches, and techniques.
- "Bosses": This category is used for boss analysis and oddities.
- "Misc": This category is used for any other information that does not fit in the previous categories. Minor techniques that don't affect the game as much (for example, an animation breaking) should also be placed here. When in doubt, check the Misc category of other pages.

As a general tip, use images, videos, tables, and formulas as much as you can to break the page flow and make things easier to read. A full view (1 screen on desktop and 2 screens on mobile) with only text can be tiring to read and can cause users to skip ahead.

## Other Resources

You probably can edit a page by simply following the syntax of other pages, but in case you want further definitions of GFM and Markdown syntax, you can follow these links: [GFM](https://github.github.com/gfm/), [Markdown](https://www.markdownguide.org/basic-syntax/).
