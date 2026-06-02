// Minimal, dependency-free markdown renderer for the Agents Hub artifact viewer.
// Covers exactly what the review artifacts use; not a general markdown engine.
function renderInline(text, keyBase) {
  const nodes = [];
  let rest = text;
  let n = 0;
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/;
  while (rest.length) {
    const m = rest.match(re);
    if (!m) { nodes.push(rest); break; }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const tok = m[0];
    const key = `${keyBase}-${n++}`;
    if (tok.startsWith('`')) nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('*')) nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    else { const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/); nodes.push(<a key={key} href={lm[2]} target="_blank" rel="noreferrer">{lm[1]}</a>); }
    rest = rest.slice(m.index + tok.length);
  }
  return nodes;
}

const splitRow = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const isTableSep = (line) => line.includes('-') && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line);
const BLOCK_START = /^(#{1,6}\s|```|>\s?|\s*[-*]\s+|\s*\d+\.\s+)/;

const Markdown = ({ children }) => {
  const lines = (children || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  const key = () => blocks.length;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; blocks.push(<pre key={key()}><code>{buf.join('\n')}</code></pre>); continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const Tag = `h${Math.min(h[1].length + 1, 6)}`; blocks.push(<Tag key={key()}>{renderInline(h[2], `h${key()}`)}</Tag>); i++; continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { blocks.push(<hr key={key()} />); i++; continue; }
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line); i += 2; const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) { rows.push(splitRow(lines[i])); i++; }
      blocks.push(
        <table key={key()}>
          <thead><tr>{header.map((c, j) => <th key={j}>{renderInline(c, `th${key()}-${j}`)}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{renderInline(c, `td${key()}-${ri}-${j}`)}</td>)}</tr>)}</tbody>
        </table>
      ); continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push(<blockquote key={key()}>{renderInline(buf.join(' '), `bq${key()}`)}</blockquote>); continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
      blocks.push(<ul key={key()}>{items.map((it, j) => <li key={j}>{renderInline(it, `li${key()}-${j}`)}</li>)}</ul>); continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      blocks.push(<ol key={key()}>{items.map((it, j) => <li key={j}>{renderInline(it, `ol${key()}-${j}`)}</li>)}</ol>); continue;
    }
    if (!line.trim()) { i++; continue; }
    const para = [line]; i++;
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) { para.push(lines[i]); i++; }
    blocks.push(<p key={key()}>{renderInline(para.join(' '), `p${key()}`)}</p>);
  }
  return <div className="hub-md">{blocks}</div>;
};

export default Markdown;
