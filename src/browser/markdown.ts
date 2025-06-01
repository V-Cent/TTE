// ---------
// markdown.js contains all necessary imports and setup to use markdown when in edit mode
//   loaded dynamically to reduce initial page load

import { Parser } from "../shared/parser";
import { Compiler } from "../shared/compiler";
import { Helper } from "../shared/helper";
import _default from "../katex.min.js";

export { Compiler } from "../shared/compiler";

interface KatexRenderToString {
  renderToString: (input: string, options?: Record<string, unknown>) => string;
}

export async function initializeCompiler(helperObject: Helper): Promise<Compiler> {
  const katex: KatexRenderToString = _default;
  const parser: Parser = new Parser(true);
  const compiler: Compiler = new Compiler(true, parser, helperObject);
  compiler.setKatex(katex);
  return compiler;
}
