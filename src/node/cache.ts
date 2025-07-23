// ---------
// cache.js is a node script used to generate HTML files and search results.
//  this is the main script for continuous integration when a user changes a markdown file

import { Parser } from "../shared/parser";
import { Compiler } from "../shared/compiler";
import { Helper } from "../shared/helper";
import * as fs from "fs/promises";
import * as path from "path";
import { fileList, FileEntry } from "../shared/globals";
import { minify as minifyHtml } from "@minify-html/node";
import { Stats } from "fs";
import { simpleGit, SimpleGit, DefaultLogFields, LogResult, ListLogLine } from "simple-git";

interface CommitLog extends DefaultLogFields {
  diff?: {
    insertions: number;
    deletions: number;
    files: {
      file: string;
      changes: number;
      insertions: number;
      deletions: number;
    }[];
  };
}

// ANSI color codes for console styling
const COLORS: {
  readonly RESET: string;
  readonly BOLD: string;
  readonly CYAN: string;
  readonly GREEN: string;
  readonly YELLOW: string;
  readonly MAGENTA: string;
  readonly BLUE: string;
  readonly RED: string;
} = {
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
  CYAN: "\x1b[36m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  MAGENTA: "\x1b[35m",
  BLUE: "\x1b[34m",
  RED: "\x1b[31m",
} as const;

// Define a minimal type for the KaTeX module
interface KatexRenderToString {
  renderToString: (input: string, options?: Record<string, unknown>) => string;
}

interface KatexModule {
  default: KatexRenderToString;
}

interface ProcessingResult {
  fileName: string;
  markdownSize: number;
  htmlSize: number;
  minifiedSize: number;
  success: boolean;
  errorMessage?: string;
}

class CacheBuilder {
  private readonly parserObj: Parser;
  private readonly helperObj: Helper;
  private readonly compilerObj: Compiler;
  private readonly buildStartTime: number;

  // Paths
  private readonly cacheDirectoryPath: string = "cache";
  private readonly docsDirectoryPath: string = "docs";
  private readonly srcDirectoryPath: string = "src";
  private readonly techSubdirectoryPath: string = "docs/tech";

  // For printing
  private static readonly BYTE_UNITS: readonly string[] = ["B", "KB", "MB", "GB"] as const;
  private static readonly BYTES_PER_UNIT: number = 1_024;

  constructor() {
    this.buildStartTime = performance.now();

    this.parserObj = new Parser(false);
    this.helperObj = new Helper(() => {}, fileList);
    this.compilerObj = new Compiler(false, this.parserObj, this.helperObj);
  }

  // --- Format bytes with appropriate units
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const sizeIndex: number = Math.floor(Math.log(bytes) / Math.log(CacheBuilder.BYTES_PER_UNIT));
    const formattedSize: number = parseFloat(
      (bytes / Math.pow(CacheBuilder.BYTES_PER_UNIT, sizeIndex)).toFixed(1),
    );

    return `${formattedSize} ${CacheBuilder.BYTE_UNITS[sizeIndex]}`;
  }

  // --- Format milliseconds to human-readable time
  private formatTime(milliseconds: number): string {
    if (milliseconds < 1_000) {
      return `${Math.round(milliseconds)}ms`;
    }
    return `${(milliseconds / 1_000).toFixed(2)}s`;
  }

  // --- Initialize KaTeX module for math rendering
  private async initializeKatex(): Promise<void> {
    try {
      const katexModule: KatexModule = (await import("../katex.min.js")) as KatexModule;
      this.compilerObj.setKatex(katexModule.default);
    } catch (katexError: unknown) {
      console.error(`${COLORS.RED}Failed to load KaTeX module:${COLORS.RESET}`, katexError);
      throw katexError;
    }
  }

  // --- Process a single file entry and return processing statistics
  private async processFile(fileEntry: FileEntry): Promise<ProcessingResult> {
    const fileName: string = fileEntry.document;

    try {
      // Homepage has no ref and is handled by the normal build script (together with index)
      if (fileEntry.ref === "") {
        return {
          fileName,
          markdownSize: 0,
          htmlSize: 0,
          minifiedSize: 0,
          success: true,
          errorMessage: "Handled externally",
        };
      }

      const isNonTechPage: boolean = fileEntry.dim === "N/A";
      const documentBaseName: string = fileEntry.document;

      // Solve path name for both techpages (TODPS2 --> docs/tech/todps2.html) and other files (./README --> docs/README.html)
      const {
        relativeSourcePath,
        htmlOutputPath,
      }: { relativeSourcePath: string; htmlOutputPath: string } = isNonTechPage
        ? {
            relativeSourcePath: `${this.docsDirectoryPath}/${documentBaseName}`,
            htmlOutputPath: `${this.docsDirectoryPath}/${documentBaseName}.html`,
          }
        : {
            relativeSourcePath: `${this.techSubdirectoryPath}/${documentBaseName.toLowerCase()}`,
            htmlOutputPath: `${this.techSubdirectoryPath}/${documentBaseName.toLowerCase()}.html`,
          };

      // Read markdown file to get size
      const markdownFilePath: string = `${relativeSourcePath}.md`;
      const markdownStats: Stats = await fs.stat(markdownFilePath);
      const markdownSize: number = markdownStats.size;

      // Ensure the output directory exists
      const outputDir: string = path.dirname(htmlOutputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Parse markdown to HTML
      const htmlContent: string = await this.compilerObj.parse(
        relativeSourcePath,
        fileEntry.document,
        fileEntry.section,
        !isNonTechPage,
      );
      const htmlSize: number = Buffer.byteLength(htmlContent, "utf8");

      // Minify HTML
      const minifiedHtml: Buffer = minifyHtml(Buffer.from(htmlContent), {
        minify_css: true,
        minify_js: true,
      });
      const minifiedSize: number = minifiedHtml.length;

      // Write minified HTML
      await fs.writeFile(htmlOutputPath, minifiedHtml);

      return {
        fileName,
        markdownSize,
        htmlSize,
        minifiedSize,
        success: true,
      };
    } catch (fileError: unknown) {
      const errorMessage: string = fileError instanceof Error ? fileError.message : "Unknown error";

      return {
        fileName,
        markdownSize: 0,
        htmlSize: 0,
        minifiedSize: 0,
        success: false,
        errorMessage,
      };
    }
  }

  // --- Log the processing result for a single file
  private logFileResult(result: ProcessingResult): void {
    if (!result.success) {
      console.log(
        `${COLORS.BOLD}${COLORS.CYAN}[${result.fileName}]${COLORS.RESET} ` +
          `${COLORS.RED}ERROR:${COLORS.RESET} ${result.errorMessage}`,
      );
      return;
    }

    // Handle files with empty ref (skipped files)
    const isSkippedFile: boolean =
      result.markdownSize === 0 && result.htmlSize === 0 && result.minifiedSize === 0;
    if (isSkippedFile) {
      console.log(
        `${COLORS.BOLD}${COLORS.CYAN}[${result.fileName}]${COLORS.RESET} ` +
          `${COLORS.YELLOW}SKIPPED:${COLORS.RESET} ${result.errorMessage}`,
      );
      return;
    }

    const compressionRatio: number =
      result.htmlSize > 0 ? ((result.htmlSize - result.minifiedSize) / result.htmlSize) * 100 : 0;

    console.log(
      `${COLORS.BOLD}${COLORS.CYAN}[${result.fileName}]${COLORS.RESET} ` +
        `${COLORS.GREEN}MD:${COLORS.RESET} ${this.formatBytes(result.markdownSize)} → ` +
        `${COLORS.BLUE}HTML:${COLORS.RESET} ${this.formatBytes(result.htmlSize)} → ` +
        `${COLORS.YELLOW}MIN:${COLORS.RESET} ${this.formatBytes(result.minifiedSize)} ` +
        `${COLORS.MAGENTA}(-${compressionRatio.toFixed(1)}%)${COLORS.RESET}`,
    );
  }

  // --- Generate search index from compiled results
  private async generateSearchIndex(): Promise<void> {
    try {
      const searchData: string = await this.compilerObj.exportSearchResultsToFile();
      const searchOutputPath: string = path.join(this.cacheDirectoryPath, "searchHTML.ts");

      // Ensure cache directory exists
      await fs.mkdir(this.cacheDirectoryPath, { recursive: true });
      await fs.writeFile(searchOutputPath, searchData);

      console.log(`${COLORS.GREEN}Generated search index${COLORS.RESET}`);
    } catch (searchError: unknown) {
      console.error(`${COLORS.RED}Error generating search index:${COLORS.RESET}`, searchError);
    }
  }

  // --- Main cache building process
  async buildCache(): Promise<void> {
    console.log(`${COLORS.BOLD}${COLORS.CYAN}Starting cache build process...${COLORS.RESET}\n`);

    // Initialize KaTeX
    await this.initializeKatex();

    // Ensure base cache directory exists
    await fs.mkdir(this.cacheDirectoryPath, { recursive: true });

    if (!fileList?.length) {
      console.warn(`${COLORS.YELLOW}fileList is empty. Nothing to process.${COLORS.RESET}`);
      await this.generateSearchIndex();
      return;
    }

    // Process all files concurrently for better performance
    const processingPromises: Promise<ProcessingResult>[] = fileList.map((fileEntry: FileEntry) =>
      fileEntry.document === "HOME" ? this.buildHomePage() : this.processFile(fileEntry),
    );

    const results: ProcessingResult[] = await Promise.all(processingPromises);

    // Log individual file results
    for (const result of results) {
      this.logFileResult(result);
    }

    // Generate search index
    await this.generateSearchIndex();

    const {
      processedResults,
      skippedResults,
      failedResults,
    }: {
      processedResults: ProcessingResult[];
      skippedResults: ProcessingResult[];
      failedResults: ProcessingResult[];
    } = this.categorizeResults(results);

    const totalFiles: number = results.length;
    const processedCount: number = processedResults.length;
    const skippedCount: number = skippedResults.length;
    const failedCount: number = failedResults.length;

    const totals: { markdown: number; html: number; minified: number } = processedResults.reduce(
      (
        accumulator: { markdown: number; html: number; minified: number },
        result: ProcessingResult,
      ) => ({
        markdown: accumulator.markdown + result.markdownSize,
        html: accumulator.html + result.htmlSize,
        minified: accumulator.minified + result.minifiedSize,
      }),
      { markdown: 0, html: 0, minified: 0 },
    );

    const totalCompressionRatio: number =
      totals.html > 0 ? ((totals.html - totals.minified) / totals.html) * 100 : 0;

    const totalBuildTime: number = performance.now() - this.buildStartTime;

    // Display final summary
    this.displayBuildSummary({
      totalFiles,
      processedCount,
      skippedCount,
      failedCount,
      totals,
      totalCompressionRatio,
      totalBuildTime,
    });
  }

  // --- Build the "Games" section for the homepage
  private async buildGamesSection(): Promise<string> {
    // Get only base game articles (all have an initialRelease field)
    const gameEntries: FileEntry[] = fileList.filter(
      (entry: FileEntry): entry is FileEntry & { initialRelease: number } => !!entry.initialRelease,
    );

    // How many will initially appear in the homepage
    const initialVisibleCount: number = 3;
    let cardIndex: number = 0;

    let gamesHtml: string = '<h2 class="content__home__showcase-text">Games</h2>';
    gamesHtml += '<div class="content__games-section-wrapper">';
    gamesHtml += '<section class="content__games-section">';
    gamesHtml += '<div class="content__games-grid">';

    for (const game of gameEntries) {
      const isHidden: boolean = cardIndex >= initialVisibleCount;
      // Platforms is various items that are displayed one on each line (on desktop view)
      const platformHtml: string = (game.platform ?? [])
        .map((p: string) => `<span class="content__games__game-card__">${p}</span>`)
        .join("");

      gamesHtml += `
            <div class="content__games__game-card${isHidden ? " hidden" : ""}">
                <div class="content__games__game-card__duo">
                    <img class="content__games__game-card__art" src="media/home/${game.ref}.webp" alt="${game.section} Art" ${isHidden ? ' loading="lazy"' : ""}>
                    <div class="content__games__game-card__details">
                        <div class="content__games__game-card__metadata">
                            <div class="content__games__game-card__meta-item">
                                <span class="material-symbols-rounded">event</span>
                                <div class="content__games__game-card__meta-text">
                                    <span class="content__games__game-card__meta-description">Release</span>
                                    <span class="content__games__game-card__meta-value">${game.initialRelease}</span>
                                </div>
                            </div>
                            <div class="content__games__game-card__meta-item">
                                <span class="material-symbols-rounded">swords</span>
                                <div class="content__games__game-card__meta-text">
                                    <span class="content__games__game-card__meta-description">Combat</span>
                                    <span class="content__games__game-card__meta-value">${game.dim}</span>
                                </div>
                            </div>
                            <div class="content__games__game-card__meta-item">
                                <span class="material-symbols-rounded">videogame_asset</span>
                                <div class="content__games__game-card__meta-text">
                                    <span class="content__games__game-card__meta-description">Platforms</span>
                                    <div class="content__games__game-card__meta-value content__games__game-card__platform-list">${platformHtml}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="content__games__game-card__title">${game.section}</p>
                <p class="content__games__game-card__description">${game.description}</p>
                <div class="content__games__game-card__article-list">
                    <div class="content__games__game-card__article-item" data-document="${game.document}" data-section="${game.section}">
                      <span class="material-symbols-rounded">settings</span>
                      <span class="content__games__game-card__article-item--label">Systems</span>
                    </div>
                    <div class="content__games__game-card__article-item" data-document="${game.document}-C" data-section="${game.section}">
                      <span class="material-symbols-rounded">group</span>
                      <span class="content__games__game-card__article-item--label">Characters</span>
                    </div>
                    <div class="content__games__game-card__article-item" data-document="${game.document}-B" data-section="${game.section}">
                      <span class="material-symbols-rounded">swords</span>
                      <span class="content__games__game-card__article-item--label">Bosses</span>
                    </div>
                </div> 
            </div>`;
      cardIndex++;
    }

    gamesHtml += "</div>"; // Close .content__games-grid
    gamesHtml += "</section>"; // Close .content__games-section
    gamesHtml += "</div>"; // Close .content__games-section-wrapper
    if (gameEntries.length > initialVisibleCount) {
      gamesHtml +=
        '<button id="content__games-section__show-more" class="button">Show More</button>';
    }

    return gamesHtml;
  }

  // --- Build the "Latest Changes" section from Git history
  private async buildLatestChangesSection(): Promise<string> {
    // How many commits to show initially
    const initialCommitLimit: number = 8;
    // Using simplegit to fetch the latest commits
    //   run from npm on root folder to be sure
    const git: SimpleGit = simpleGit();
    const log: LogResult<DefaultLogFields & CommitLog> = await git.log<
      DefaultLogFields & CommitLog
    >({
      maxCount: 50,
      "--stat": null,
    });
    const commits: readonly (DefaultLogFields & CommitLog & ListLogLine)[] = log.all;

    const documentRefs: Map<string, FileEntry> = new Map(
      fileList.map((entry: FileEntry) => [entry.ref.toUpperCase(), entry]),
    );

    // Split by month like Github
    const commitsByMonth: Map<string, (DefaultLogFields & CommitLog)[]> = new Map();
    for (const commit of commits) {
      const monthYear: string = new Date(commit.date).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!commitsByMonth.has(monthYear)) {
        commitsByMonth.set(monthYear, []);
      }
      commitsByMonth.get(monthYear)!.push(commit);
    }

    let latestChangesHtml: string = '<section class="content__latest-changes">';
    latestChangesHtml += '<h2 class="content__home__showcase-text">Latest Changes</h2>';

    let commitCounter: number = 0;
    let monthIndex: number = 0;
    const totalMonths: number = commitsByMonth.size;

    for (const [monthYear, monthCommits] of commitsByMonth.entries()) {
      const isLastMonthGroup: boolean = monthIndex === totalMonths - 1;
      const isGroupInitiallyHidden: boolean = commitCounter >= initialCommitLimit;

      latestChangesHtml += `<div class="content__latest-changes__timeline-group${isGroupInitiallyHidden ? " hidden" : ""}">`;

      latestChangesHtml += `<div class="content__latest-changes__timeline-row">`;
      latestChangesHtml += `
        <div class="content__latest-changes__timeline-marker-container">
          <div class="content__latest-changes__timeline-marker-icon material-symbols-rounded">commit</div>
          ${!isLastMonthGroup ? '<div class="content__latest-changes__timeline-marker-line"></div>' : ""}
        </div>`;

      latestChangesHtml += `<div class="content__latest-changes__timeline-content">`;
      latestChangesHtml += `<div class="content__latest-changes__timeline-month">${monthYear}</div>`;
      latestChangesHtml += `<ul class="content__latest-changes__commit-list">`;

      for (const commit of monthCommits) {
        let { message, author_name: author }: DefaultLogFields & CommitLog = commit;
        const { date, hash, diff }: DefaultLogFields & CommitLog = commit;

        const isCommitHidden: boolean = commitCounter >= initialCommitLimit;
        commitCounter++;

        // Extract author from message if following the presets:
        //   "{title} by author" or "{title} -- author"
        // These are currently the way they are generated by live edits. If changing there, add the style here too
        const authorRegex: RegExp = / (?:by|--) (.*)$/;
        const authorMatch: RegExpMatchArray | null = message.match(authorRegex);
        if (authorMatch?.[1]) {
          author = authorMatch[1].trim();
          message = message.replace(authorRegex, "").trim();
        }

        const docTagRegex: RegExp = /\[([A-Z0-9-]+)]/;
        const docTagMatch: RegExpMatchArray | null = message.match(docTagRegex);
        let pageRedirectHtml: string = "";
        if (docTagMatch?.[1] && documentRefs.has(docTagMatch[1])) {
          const fileEntry: FileEntry = documentRefs.get(docTagMatch[1])!;
          pageRedirectHtml = `
            <span class="content__latest-changes__commit-changes-link" data-document="${fileEntry.document}" data-section="${fileEntry.section}">
              <span class="material-symbols-rounded">link</span>
              <span class="content__latest-changes__commit-changes-link-text">See changes</span>
            </span>`;
        }

        // URL to see on Github
        //   change if switching to an organization
        const commitUrl: string = `https://github.com/V-Cent/TTE/commit/${hash}`;
        const formattedDate: string = new Date(date).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "UTC",
          timeZoneName: "short",
        });

        const insertions: number = diff?.insertions ?? 0;
        const deletions: number = diff?.deletions ?? 0;
        const diffHtml: string =
          insertions > 0 || deletions > 0
            ? `
            <span class="content__latest-changes__commit-stats">
              <span class="content__latest-changes__commit-stats-additions">+${insertions}</span>
              <span class="content__latest-changes__commit-stats-deletions">-${deletions}</span>
            </span>`
            : "";

        latestChangesHtml += `
          <li class="content__latest-changes__commit-item${isCommitHidden ? " hidden" : ""}">
            <div class="content__latest-changes__commit-content-wrapper">
              <div class="content__latest-changes__commit-header">
                <a href="${commitUrl}" target="_blank" rel="noopener noreferrer" class="content__latest-changes__commit-title-link">${message}</a>
                ${pageRedirectHtml}
              </div>
              <div class="content__latest-changes__commit-details">
                <div class="content__latest-changes__commit-meta">
                  <span class="content__latest-changes__commit-author">${author}</span>
                  <span class="content__latest-changes__commit-separator">•</span>
                  <span class="content__latest-changes__commit-date">${formattedDate}</span>
                </div>
                ${diffHtml}
              </div>
            </div>
          </li>`;
      }

      latestChangesHtml += `</ul></div></div></div>`;
      monthIndex++;
    }

    latestChangesHtml += "</section>";
    if (commits.length > initialCommitLimit) {
      latestChangesHtml +=
        '<button id="content__latest-changes__show-more" class="button">Show More</button>';
    }
    return latestChangesHtml;
  }

  // --- Build the final homepage by combining the template with generated sections
  private async buildHomePage(): Promise<ProcessingResult> {
    const sourcePath: string = path.join(this.srcDirectoryPath, "home.html");
    const outputPath: string = path.join(this.docsDirectoryPath, "home.html");

    try {
      const homeTemplate: string = await fs.readFile(sourcePath, "utf8");
      const gamesSectionHtml: string = await this.buildGamesSection();
      const latestChangesHtml: string = await this.buildLatestChangesSection();

      const finalHtml: string = homeTemplate + gamesSectionHtml + latestChangesHtml;
      const htmlSize: number = Buffer.byteLength(finalHtml, "utf8");

      const minifiedHtml: Buffer = minifyHtml(Buffer.from(finalHtml), {
        minify_css: true,
        minify_js: true,
      });
      const minifiedSize: number = minifiedHtml.length;
      await fs.writeFile(outputPath, minifiedHtml);

      return {
        fileName: "HOME",
        markdownSize: 0,
        htmlSize,
        minifiedSize,
        success: true,
      };
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : "Unknown error";
      return {
        fileName: "HOME",
        markdownSize: 0,
        htmlSize: 0,
        minifiedSize: 0,
        success: false,
        errorMessage,
      };
    }
  }

  // --- Categorize processing results for summary statistics
  private categorizeResults(results: ProcessingResult[]) {
    return results.reduce(
      (
        categories: {
          processedResults: ProcessingResult[];
          skippedResults: ProcessingResult[];
          failedResults: ProcessingResult[];
        },
        result: ProcessingResult,
      ) => {
        if (!result.success) {
          categories.failedResults.push(result);
        } else if (result.markdownSize === 0) {
          categories.skippedResults.push(result);
        } else {
          categories.processedResults.push(result);
        }
        return categories;
      },
      { processedResults: [], skippedResults: [], failedResults: [] },
    );
  }

  // --- Display comprehensive build summary
  private displayBuildSummary(summary: {
    totalFiles: number;
    processedCount: number;
    skippedCount: number;
    failedCount: number;
    totals: { markdown: number; html: number; minified: number };
    totalCompressionRatio: number;
    totalBuildTime: number;
  }): void {
    // TODO interface for this would be nice
    const {
      totalFiles,
      processedCount,
      skippedCount,
      failedCount,
      totals,
      totalCompressionRatio,
      totalBuildTime,
    }: {
      totalFiles: number;
      processedCount: number;
      skippedCount: number;
      failedCount: number;
      totals: { markdown: number; html: number; minified: number };
      totalCompressionRatio: number;
      totalBuildTime: number;
    } = summary;

    console.log(`\n${COLORS.BOLD}${COLORS.GREEN}Build Summary:${COLORS.RESET}`);

    const summaryParts: string[] = [
      `${processedCount}/${totalFiles}`,
      ...(skippedCount > 0 ? [`${COLORS.YELLOW}(${skippedCount} skipped)${COLORS.RESET}`] : []),
      ...(failedCount > 0 ? [`${COLORS.RED}(${failedCount} failed)${COLORS.RESET}`] : []),
    ];

    console.log(`${COLORS.CYAN}Files processed:${COLORS.RESET} ${summaryParts.join(" ")}`);

    if (totals.html > 0) {
      console.log(
        `${COLORS.CYAN}Total size reduction:${COLORS.RESET} ` +
          `${this.formatBytes(totals.html)} → ${this.formatBytes(totals.minified)} ` +
          `${COLORS.MAGENTA}(-${totalCompressionRatio.toFixed(1)}%)${COLORS.RESET}`,
      );
    }

    console.log(
      `${COLORS.BOLD}${COLORS.CYAN}Total build time:${COLORS.RESET} ${this.formatTime(totalBuildTime)}`,
    );
  }
}

// --- Execute the cache building process
async function main(): Promise<void> {
  try {
    const cacheBuilder: CacheBuilder = new CacheBuilder();
    await cacheBuilder.buildCache();
    process.exit(0);
  } catch (mainError: unknown) {
    const errorMessage: string =
      mainError instanceof Error ? mainError.message : "Unknown error occurred";
    console.error(`${COLORS.BOLD}${COLORS.RED}Build failed:${COLORS.RESET} ${errorMessage}`);
    process.exit(1);
  }
}

main().then();
