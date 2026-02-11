import { Fragment, ReactElement, ReactNode } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

type Block = { type: "code"; language: string; content: string } | { type: "text"; content: string };

function splitBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const codeFenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null = codeFenceRegex.exec(markdown);

  while (match) {
    const [fullMatch, language, codeContent] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      blocks.push({ type: "text", content: markdown.slice(lastIndex, matchIndex) });
    }

    blocks.push({ type: "code", language: language || "text", content: codeContent.trimEnd() });
    lastIndex = matchIndex + fullMatch.length;
    match = codeFenceRegex.exec(markdown);
  }

  if (lastIndex < markdown.length) {
    blocks.push({ type: "text", content: markdown.slice(lastIndex) });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = tokenRegex.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-sky-600 underline underline-offset-2 hover:text-sky-500"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
      nodes.push(
        <code key={`inline-code-${match.index}`} className="rounded bg-slate-900/90 px-1 py-0.5 font-mono text-[0.85em] text-slate-100">
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      nodes.push(
        <strong key={`strong-${match.index}`} className="font-semibold">
          {match[5]}
        </strong>
      );
    } else if (match[6]) {
      nodes.push(
        <em key={`em-${match.index}`} className="italic">
          {match[6]}
        </em>
      );
    } else {
      nodes.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
    match = tokenRegex.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderTextBlock(content: string, blockIndex: number): ReactElement[] {
  const lines = content.split("\n");
  const rendered: ReactElement[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const sizeClass =
        level === 1
          ? "text-xl font-bold"
          : level === 2
          ? "text-lg font-semibold"
          : level === 3
          ? "text-base font-semibold"
          : "text-sm font-semibold";
      const headingKey = `heading-${blockIndex}-${index}`;
      const headingChildren = renderInline(text);
      if (level === 1) {
        rendered.push(
          <h1 key={headingKey} className={`mt-3 mb-2 ${sizeClass}`}>
            {headingChildren}
          </h1>
        );
      } else if (level === 2) {
        rendered.push(
          <h2 key={headingKey} className={`mt-3 mb-2 ${sizeClass}`}>
            {headingChildren}
          </h2>
        );
      } else if (level === 3) {
        rendered.push(
          <h3 key={headingKey} className={`mt-3 mb-2 ${sizeClass}`}>
            {headingChildren}
          </h3>
        );
      } else if (level === 4) {
        rendered.push(
          <h4 key={headingKey} className={`mt-3 mb-2 ${sizeClass}`}>
            {headingChildren}
          </h4>
        );
      } else if (level === 5) {
        rendered.push(
          <h5 key={headingKey} className={`mt-3 mb-2 ${sizeClass}`}>
            {headingChildren}
          </h5>
        );
      } else {
        rendered.push(
          <h6 key={headingKey} className={`mt-3 mb-2 ${sizeClass}`}>
            {headingChildren}
          </h6>
        );
      }
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: ReactElement[] = [];
      let listIndex = index;
      while (listIndex < lines.length && /^[-*]\s+/.test(lines[listIndex].trim())) {
        const itemText = lines[listIndex].trim().replace(/^[-*]\s+/, "");
        items.push(
          <li key={`ul-item-${blockIndex}-${listIndex}`} className="ml-5 list-disc">
            {renderInline(itemText)}
          </li>
        );
        listIndex += 1;
      }
      rendered.push(
        <ul key={`ul-${blockIndex}-${index}`} className="my-2 space-y-1 text-sm leading-6">
          {items}
        </ul>
      );
      index = listIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: ReactElement[] = [];
      let listIndex = index;
      while (listIndex < lines.length && /^\d+\.\s+/.test(lines[listIndex].trim())) {
        const itemText = lines[listIndex].trim().replace(/^\d+\.\s+/, "");
        items.push(
          <li key={`ol-item-${blockIndex}-${listIndex}`} className="ml-5 list-decimal">
            {renderInline(itemText)}
          </li>
        );
        listIndex += 1;
      }
      rendered.push(
        <ol key={`ol-${blockIndex}-${index}`} className="my-2 space-y-1 text-sm leading-6">
          {items}
        </ol>
      );
      index = listIndex;
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      rendered.push(
        <blockquote
          key={`quote-${blockIndex}-${index}`}
          className="my-2 border-l-2 border-slate-300 pl-3 text-sm italic text-muted-foreground"
        >
          {renderInline(trimmed.replace(/^>\s+/, ""))}
        </blockquote>
      );
      index += 1;
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    let paragraphIndex = index + 1;
    while (paragraphIndex < lines.length) {
      const nextLine = lines[paragraphIndex].trim();
      if (!nextLine) break;
      if (
        /^(#{1,6})\s+/.test(nextLine) ||
        /^[-*]\s+/.test(nextLine) ||
        /^\d+\.\s+/.test(nextLine) ||
        /^>\s+/.test(nextLine)
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      paragraphIndex += 1;
    }

    rendered.push(
      <p key={`paragraph-${blockIndex}-${index}`} className="my-2 text-sm leading-6 text-foreground">
        {renderInline(paragraphLines.join(" "))}
      </p>
    );
    index = paragraphIndex;
  }

  return rendered;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = splitBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <div key={`code-${index}`} className="my-3 overflow-hidden rounded-md border border-slate-700 bg-slate-950">
              <div className="border-b border-slate-800 px-3 py-1.5 text-[11px] uppercase tracking-wide text-slate-400">
                {block.language}
              </div>
              <pre className="overflow-x-auto p-3 text-xs leading-5 text-slate-100">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        return <Fragment key={`text-${index}`}>{renderTextBlock(block.content, index)}</Fragment>;
      })}
    </div>
  );
}
