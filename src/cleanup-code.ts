export function cleanupCode(code: string, tabSize: number) {
  let lines = code.split("\n");

  // Remove leading and trailing empty lines
  let leadingEmptyLines = 0;
  for (let line of lines) {
    if (line.match(/^\s*$/)) {
      ++leadingEmptyLines;
    } else {
      break;
    }
  }

  let trailingEmptyLines = 0;
  for (let line of [...lines].reverse()) {
    if (line.match(/^\s*$/)) {
      ++trailingEmptyLines;
    } else {
      break;
    }
  }

  if (leadingEmptyLines == lines.length) {
    trailingEmptyLines = 0;
  }

  lines = lines.slice(leadingEmptyLines, lines.length - trailingEmptyLines);

  // Tabs to N spaces
  lines = lines.map((line) => line.replace(/\t/g, " ".repeat(tabSize)));

  // Remove trailing whitespace
  lines = lines.map((line) => line.replace(/ +$/g, ""));

  // Remove common indent
  let commonIndent = -1;
  for (let line of lines) {
    if (!line.trim()) {
      continue;
    }

    let indent = (line.match(/^\s*/) || [''])[0].length;
    if (indent < commonIndent || commonIndent === -1) {
      commonIndent = indent;
    }
  }

  if (commonIndent > 0) {
    lines = lines.map((line) => line.substring(commonIndent));
  }

  code = lines.join("\n");
  return { code, commonIndent, leadingEmptyLines, trailingEmptyLines };
}
