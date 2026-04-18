// Simple markdown renderer for our AI-generated content
// Handles: **bold**, # h1, ## h2, - bullets, • bullets
export default function MarkdownBlock({ content, className = '' }: { content: string; className?: string }) {
  const lines = content.split('\n')

  const renderInline = (text: string) => {
    const parts: React.ReactNode[] = []
    const regex = /\*\*(.+?)\*\*/g
    let last = 0
    let match
    let i = 0
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index))
      parts.push(<strong key={i++} className="font-bold text-[#061B3B]">{match[1]}</strong>)
      last = match.index + match[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  const elements: React.ReactNode[] = []
  let bulletBuffer: string[] = []
  let key = 0

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return
    elements.push(
      <ul key={key++} className="space-y-1 my-2 pl-1">
        {bulletBuffer.map((b, i) => (
          <li key={i} className="flex gap-2 text-slate-600 text-sm leading-relaxed">
            <span className="text-[#F4C20D] font-black mt-0.5">•</span>
            <span>{renderInline(b)}</span>
          </li>
        ))}
      </ul>
    )
    bulletBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushBullets(); continue }

    if (line.startsWith('# ')) {
      flushBullets()
      elements.push(
        <h1 key={key++} className="text-lg font-black text-[#061B3B] mb-3 mt-1">
          {line.slice(2)}
        </h1>
      )
    } else if (line.startsWith('## ')) {
      flushBullets()
      elements.push(
        <h2 key={key++} className="text-sm font-black text-[#061B3B] uppercase tracking-wide border-l-4 border-[#F4C20D] pl-3 mt-5 mb-2">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      bulletBuffer.push(line.slice(2).trim())
    } else {
      flushBullets()
      elements.push(
        <p key={key++} className="text-sm text-slate-600 leading-relaxed my-1">
          {renderInline(line)}
        </p>
      )
    }
  }
  flushBullets()

  return <div className={className}>{elements}</div>
}
