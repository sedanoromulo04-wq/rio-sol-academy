import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react'

type Question = {
  question: string
  options: { letter: string; text: string }[]
  answer: string
}

function parseQuestion(raw: string): Question | null {
  try {
    const qMatch = raw.match(/Pergunta:\s*(.+?)(?=\nA\))/s)
    const aMatch = raw.match(/A\)\s*(.+?)(?=\nB\))/s)
    const bMatch = raw.match(/B\)\s*(.+?)(?=\nC\))/s)
    const cMatch = raw.match(/C\)\s*(.+?)(?=\nD\))/s)
    const dMatch = raw.match(/D\)\s*(.+?)(?=\nResposta:)/s)
    const rMatch = raw.match(/Resposta:\s*([A-D])/i)

    if (!qMatch || !aMatch || !bMatch || !cMatch || !dMatch || !rMatch) return null

    return {
      question: qMatch[1].trim(),
      options: [
        { letter: 'A', text: aMatch[1].trim() },
        { letter: 'B', text: bMatch[1].trim() },
        { letter: 'C', text: cMatch[1].trim() },
        { letter: 'D', text: dMatch[1].trim() },
      ],
      answer: rMatch[1].toUpperCase(),
    }
  } catch {
    return null
  }
}

export default function QuizPlayer({
  suggestions,
  onFinish,
}: {
  suggestions: string[]
  onFinish?: (score: number, total: number) => void
}) {
  const questions = suggestions.map(parseQuestion).filter(Boolean) as Question[]
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) return null

  const q = questions[current]
  const isCorrect = selected === q.answer
  const answered = selected !== null

  const handleSelect = (letter: string) => {
    if (answered) return
    setSelected(letter)
    if (letter === q.answer) setScore((s) => s + 1)
  }

  const handleNext = () => {
    const finalScore = score
    if (current + 1 >= questions.length) {
      setFinished(true)
      onFinish?.(finalScore, questions.length)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    const passed = pct >= 70
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center',
          passed ? 'bg-emerald-50' : 'bg-rose-50'
        )}>
          <Trophy className={cn('w-9 h-9', passed ? 'text-emerald-500' : 'text-rose-400')} />
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-black text-[#061B3B]">{score}/{questions.length}</p>
          <p className="text-slate-500 text-sm">{pct}% de aproveitamento</p>
          <p className={cn('text-sm font-bold mt-1', passed ? 'text-emerald-600' : 'text-rose-500')}>
            {passed ? '✅ Parabéns, você foi aprovado!' : '❌ Revise o conteúdo e tente novamente'}
          </p>
        </div>
        <Button onClick={handleRestart} variant="outline" className="rounded-xl border-slate-200 gap-2">
          <RotateCcw className="w-4 h-4" /> Refazer quiz
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Questão {current + 1} de {questions.length}</span>
        <span>{score} acerto{score !== 1 ? 's' : ''}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#061B3B] rounded-full transition-all duration-500"
          style={{ width: `${((current) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-base font-bold text-[#061B3B] leading-snug">{q.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map(({ letter, text }) => {
          const isSelected = selected === letter
          const isRight = letter === q.answer

          let style = 'border-slate-200 bg-white text-slate-700 hover:border-[#061B3B] hover:bg-slate-50'
          if (answered) {
            if (isRight) style = 'border-emerald-400 bg-emerald-50 text-emerald-800'
            else if (isSelected && !isRight) style = 'border-rose-400 bg-rose-50 text-rose-800'
            else style = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60'
          }

          return (
            <button
              key={letter}
              onClick={() => handleSelect(letter)}
              disabled={answered}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm text-left transition-all duration-200',
                style,
                !answered && 'cursor-pointer'
              )}
            >
              <span className={cn(
                'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black',
                answered && isRight ? 'border-emerald-500 bg-emerald-500 text-white' :
                answered && isSelected ? 'border-rose-500 bg-rose-500 text-white' :
                'border-current'
              )}>
                {letter}
              </span>
              <span className="flex-1">{text}</span>
              {answered && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              {answered && isSelected && !isRight && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Feedback + Next */}
      {answered && (
        <div className="space-y-3">
          <div className={cn(
            'rounded-xl px-4 py-3 text-sm font-medium',
            isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          )}>
            {isCorrect
              ? '✅ Correto! Continue assim.'
              : `❌ Resposta correta: alternativa ${q.answer}`}
          </div>
          <Button
            onClick={handleNext}
            className="w-full rounded-xl bg-[#061B3B] hover:bg-[#0a2955] text-white gap-2"
          >
            {current + 1 >= questions.length ? '🏁 Ver resultado' : 'Próxima questão'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
