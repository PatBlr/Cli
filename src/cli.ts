/**
 * Prompt to be used by the CLI\
 * Defines two states. `prompt_primary` state represents the active state of a prompt.\
 * `prompt_secondary` state represents the inactive or alternative state of a prompt.\
 * States should be of the same length
 *
 * Example:\
 * prompt_primary: `">"`\
 * prompt_secondary: `" "`
 */
export interface Prompt {
  prompt_primary: string;
  prompt_secondary: string;
}

export class Cli {
  private COLORS = {
    RESET: "\x1b[0m",
    BLACK: "\x1b[30m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    YELLOW: "\x1b[33m",
    BLUE: "\x1b[34m",
    MAGENTA: "\x1b[35m",
    CYAN: "\x1b[36m",
    WHITE: "\x1b[37m",
    GREY: "\x1b[90m",
  };

  private prompt: Prompt;
  private readline: any;

  constructor() {
    this.prompt = { prompt_primary: " > ", prompt_secondary: "   " };
    this.readline = require("readline");
    this.readline.emitKeypressEvents(process.stdin);
  }

  /**
   * The Prompt is the console-outputs prefix
   * @param _prompt `Prompt`\
   * new Prompt to be used in the console
   */
  public setPrompt(_prompt: Prompt): void {
    this.prompt = _prompt;
  }

  /**
   * @returns `string[]`\
   * Array with names of supported colors.
   */
  public getColors(): string[] {
    return Object.keys(this.COLORS);
  }

  /**
   * Writes to console
   * @param phrase `string`\
   * phrase to be written to the console
   * @param color `string`\
   * name of the color, the phrase will be written in (case-insensitive)\
   * If left empty, console-default is applied\
   * For a full list of colors, refer to `getColors()`
   */
  public write(phrase: string, color?: string): void {
    color = this.evalColor(color);
    process.stdout.write(`${color}${phrase}${this.COLORS.RESET}`);
  }

  /**
   * Writes to console with newline
   * @param phrase `string`\
   * phrase to be written to the console
   * @param color `string`\
   * name of the color, the phrase will be written in (case-insensitive)\
   * If left empty, console-default is applied\
   * For a full list of colors, refer to `getColors()`
   */
  public writeln(phrase: string = "", color?: string): void {
    this.write(phrase, color);
    process.stdout.write("\n");
  }

  /**
   * Prompts the user to answer a question
   * @param question `string`\
   *  Question to ask a user
   * @returns `string`\
   * given response
   */
  public async ask(question: string, allowAbort?: boolean): Promise<string> {
    process.stdin.setRawMode(true);
    const rl = this.readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    let p_response: Promise<string> = new Promise((res, rej) => {
      rl.question(question, (response: string) => {
        process.stdin.on("keypress", (_, key) => {
          if (key.sequence === "\x03") {
            console.log("abort");
          }
        });
        res(response);
      });
    });
    return p_response;
  }

  /**
   * Prompts the user to choose one option of a given array of strings
   * @param opts `string[]`\
   * Array of options, the user can choose from.
   * @param highlight_color `string`\
   * [optional - default: `"cyan"`]\
   * color in which the currently highlighted option will be displayed.
   * @param allowAbort `boolean`\
   * [optional - default: `true`]\
   * determines whether an abort-event (Ctrl + C) will terminate the entire process.\
   * If true - process will be terminated when abort-event happens.\
   * If false - method will throw an exception when abort-event happens. Process will remain running.
   * @returns `Promise<number>`\
   * Promise with chosen options index
   */
  public async choose(
    opts: string[],
    highlight_color: string = "CYAN",
    allowAbort: boolean = true
  ): Promise<number> {
    highlight_color = this.evalColor(highlight_color);
    let choice: any;
    let active = 0;
    let aborted = false;

    this.printChoose(opts, active, highlight_color, this.prompt);
    this.hideCursor();
    while (choice != "return") {
      try {
        choice = await this.keyPressed(["up", "down", "return"]);
      } catch {
        aborted = true;
        break;
      }
      if (choice === "return") break;
      if (choice === "up") active -= 1;
      if (choice === "down") active += 1;

      // circle
      if (active < 0) active = opts.length - 1;
      if (active === opts.length) active = 0;
      this.printChoose(opts, active, highlight_color, this.prompt);
    }
    // resetting cursor position
    process.stdout.moveCursor(0, opts.length - 1);
    process.stdout.cursorTo(
      opts[opts.length - 1].length + this.prompt.prompt_primary.length
    );
    this.showCursor();
    this.writeln();
    if (aborted) {
      if (allowAbort) this.end();
      else throw Error("aborted (Ctrl + C)");
    }
    return active;
  }

  /**
   * Prompts the user to select options of a given array of tuples
   * @param opts `[string, boolean][]`\
   * First element of the tuple is the Option as a `string`. Second entry is a `boolean` whether the option is pre-selected.
   * @param highlight_color `string`\
   * [optional - default: `"cyan"`]\
   * color in which the currently highlighted option will be displayed.
   * @param allowAbort `boolean`\
   * [optional - default: `true`]\
   * determines whether an abort-event (Ctrl + C) will terminate the entire process.\
   * If true - process will be terminated when abort-event happens.\
   * If false - method will throw an exception when abort-event happens. Process will remain running.
   * @returns `[string, boolean][]`\
   * Altered array of tuples.\
   * Selected options will be marked with `true`, unselected ones with `false`.
   */
  public async select(
    opts: [string, boolean][],
    highlight_color: string = "CYAN",
    allowAbort: boolean = true
  ): Promise<[string, boolean][]> {
    highlight_color = this.evalColor(highlight_color);
    const select_prompt: Prompt = {
      prompt_primary: "(*) ",
      prompt_secondary: "( ) ",
    };
    let choice: any;
    let active = 0;
    let aborted = false;

    this.printSelect(opts, active, highlight_color, select_prompt);

    this.hideCursor();
    while (choice != "return") {
      try {
        choice = await this.keyPressed(["up", "down", "space", "return"]);
      } catch {
        aborted = true;
        break;
      }
      if (choice === "return") break;
      if (choice === "up") active -= 1;
      if (choice === "down") active += 1;
      if (choice === "space") opts[active][1] = !opts[active][1];

      // circle
      if (active < 0) active = opts.length - 1;
      if (active === opts.length) active = 0;
      this.printSelect(opts, active, highlight_color, select_prompt);
    }
    // resetting cursor position
    process.stdout.moveCursor(0, opts.length - 1);
    process.stdout.cursorTo(
      opts[opts.length - 1].length + this.prompt.prompt_primary.length
    );
    this.showCursor();
    this.writeln();
    if (aborted) {
      if (allowAbort) this.end();
      else throw Error("aborted (Ctrl + C)");
    }
    return opts;
  }

  /** TODO: Auto on lifecycle end */
  public end() {
    this.showCursor();
    process.exit();
  }

  private async keyPressed(keys: string[]) {
    process.stdin.setRawMode(true);
    const promise: Promise<string> = new Promise((res, rej) => {
      process.stdin.on("keypress", (_, key) => {
        for (const k of keys) {
          if (key.name === k) {
            process.stdin.removeAllListeners("keypress");
            res(k);
          }
        }
        if (key.sequence === "\x03") {
          // Ctrl + C
          process.stdin.removeAllListeners("keypress");
          rej();
        }
      });
    });
    return promise;
  }

  private printChoose(
    opts: string[],
    active: number,
    color: string,
    prompt: Prompt
  ) {
    let str: string = "";
    for (let i = 0; i < opts.length; i++) {
      if (i === active) {
        str += color + prompt.prompt_primary + opts[i] + this.COLORS.RESET;
      } else {
        str += prompt.prompt_secondary + opts[i];
      }
      if (i < opts.length - 1) str += "\n";
    }
    process.stdout.write(str);
    process.stdout.cursorTo(0);
    process.stdout.moveCursor(0, -(opts.length - 1));
  }

  private printSelect(
    opts: [string, boolean][],
    active: number,
    color: string,
    prompt: Prompt
  ) {
    let str: string = "";
    for (let i = 0; i < opts.length; i++) {
      let _prompt: string;
      if (opts[i][1]) _prompt = prompt.prompt_primary;
      else _prompt = prompt.prompt_secondary;
      if (i === active) {
        str += color + _prompt + opts[i][0] + this.COLORS.RESET;
      } else {
        str += _prompt + opts[i][0];
      }
      if (i < opts.length - 1) str += "\n";
    }
    process.stdout.write(str);
    process.stdout.cursorTo(0);
    process.stdout.moveCursor(0, -(opts.length - 1));
  }

  private hideCursor(): void {
    process.stdout.write("\u001B[?25l");
  }

  private showCursor(): void {
    process.stdout.write("\u001B[?25h");
  }

  private evalColor(color?: string): string {
    if (color && color.toUpperCase() in this.COLORS) {
      color = this.COLORS[color.toUpperCase() as keyof typeof this.COLORS];
    } else {
      color = this.COLORS.RESET;
    }
    return color;
  }
}
