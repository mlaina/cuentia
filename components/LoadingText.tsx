'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'

const words = [
  'imaginación', 'creatividad', 'fantasía', 'sueños', 'magia', 'aventura', 'cuento', 'fábula',
  'leyenda', 'mito', 'héroe', 'dragón', 'hada', 'duende', 'unicornio', 'castillo', 'bosque',
  'océano', 'estrella', 'luna', 'sol', 'viaje', 'descubrimiento', 'misterio', 'enigma',
  'portal', 'dimensión', 'universo', 'galaxia', 'tiempo', 'espacio', 'poder', 'maravilla',
  'asombro', 'inspiración', 'creación', 'invención', 'innovación', 'transformación', 'evolución',
  'revolución', 'visión', 'idea', 'concepto', 'pensamiento', 'mente', 'conciencia', 'alma',
  'espíritu', 'corazón', 'pasión', 'emoción', 'sentimiento', 'amor', 'amistad', 'valentía',
  'coraje', 'determinación', 'perseverancia', 'esperanza', 'cariño', 'confianza', 'sabiduría',
  'conocimiento', 'aprendizaje', 'crecimiento', 'desarrollo', 'progreso', 'éxito', 'logro',
  'triunfo', 'victoria', 'conquista', 'exploración', 'descubrimiento', 'invención', 'creación',
  'imaginario', 'fantástico', 'mágico', 'místico', 'encantado', 'sobrenatural', 'extraordinario',
  'increíble', 'asombroso', 'maravilloso', 'fascinante', 'cautivador', 'inspirador', 'motivador',
  'estimulante', 'emocionante', 'apasionante', 'intrigante', 'misterioso', 'enigmático',
  'legendario', 'mítico', 'épico', 'heroico', 'valiente', 'audaz', 'intrépido', 'aventurero',
  'soñador', 'visionario', 'creativo', 'innovador', 'original', 'único', 'especial', 'mágico'
]

export default function LoadingText ({ finalText = null }: { finalText?: string | null }) {
  const defaultFinalText = '"La imaginación es el puente hacia lo desconocido, el lugar donde lo que no existe cobra vida. Con cada idea que soñamos, expandimos los límites de lo posible y construimos un futuro que aún no podemos ver, pero que ya late en nuestras mentes. Es la fuerza que impulsa la innovación, el motor del progreso y la semilla de toda gran realización. Cuando dejamos volar nuestra imaginación, rompemos las cadenas de lo convencional y nos aventuramos en territorios inexplorados. Es en estos espacios de creatividad ilimitada donde nacen las soluciones a los desafíos más complejos y donde se gestan las visiones que transformarán el mundo. La imaginación nos permite ver más allá de lo que es, para crear lo que podría ser. Es el lienzo en blanco sobre el cual pintamos nuestros sueños y aspiraciones, dando forma a un mañana lleno de posibilidades infinitas." - CuentIA'

  const [currentText, setCurrentText] = useState<string[][]>([])
  const [highlightedIndices, setHighlightedIndices] = useState<Array<{ line: number, word: number, phase: number }>>([])
  const [isComplete, setIsComplete] = useState(false)
  const [finalizedWords, setFinalizedWords] = useState<Set<string>>(new Set())

  const wordsPerLine = 6
  const totalLines = 16
  const totalPhases = 8

  console.log('isComplete', isComplete)
  console.log('finalizedWords', finalizedWords)
  const cleanFinalText = useCallback((text: string) => {
    return text.replace(/[*_]/g, '')
  }, [])

  const finalLines = useMemo(() => {
    if (finalText === null) return null

    const words = cleanFinalText(finalText).split(' ')
    const lines: string[][] = []

    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine))
    }

    while (lines.length < totalLines) {
      lines.push(Array(wordsPerLine).fill(''))
    }

    return lines
  }, [finalText, cleanFinalText])

  const generateRandomText = useCallback((): string[][] => {
    return Array(totalLines).fill(0).map(() =>
      Array(wordsPerLine).fill('').map(() => {
        let word
        do {
          word = words[Math.floor(Math.random() * words.length)]
        } while (word.includes('*') || word.includes('_'))
        return word
      })
    )
  }, [])

  const getRandomIndex = useCallback((): { line: number, word: number } => {
    const line = Math.floor(Math.random() * totalLines)
    const word = Math.floor(Math.random() * wordsPerLine)
    return { line, word }
  }, [totalLines, wordsPerLine])

  useEffect(() => {
    setCurrentText(generateRandomText())
    setHighlightedIndices([
      { ...getRandomIndex(), phase: 0 },
      { ...getRandomIndex(), phase: Math.floor(totalPhases / 3) },
      { ...getRandomIndex(), phase: Math.floor(2 * totalPhases / 3) }
    ])

    const animationInterval = 300
    let timer

    const animateText = () => {
      setCurrentText(prevText => {
        return prevText.map((line, lineIndex) =>
          line.map((word, wordIndex) => {
            const highlightedWord = highlightedIndices.find(
              index => index.line === lineIndex && index.word === wordIndex && index.phase === totalPhases - 1
            )
            if (highlightedWord) {
              let newWord
              do {
                newWord = words[Math.floor(Math.random() * words.length)]
              } while (newWord.includes('*') || newWord.includes('_'))
              return newWord
            }
            return word
          })
        )
      })

      setHighlightedIndices(prevIndices => {
        return prevIndices.map(index => {
          if (index.phase === totalPhases - 1) {
            return { ...getRandomIndex(), phase: 0 }
          } else {
            return { ...index, phase: index.phase + 1 }
          }
        })
      })

      timer = setTimeout(animateText, animationInterval)
    }

    animateText()

    return () => clearTimeout(timer)
  }, [generateRandomText, getRandomIndex, totalPhases])

  useEffect(() => {
    if (finalText !== null && finalLines !== null) {
      let wordIndex = 0
      const totalWords = finalLines.reduce((sum, line) => sum + line.length, 0)

      const updateWord = () => {
        if (wordIndex >= totalWords) {
          setIsComplete(true)
          setHighlightedIndices([])
          return
        }

        const lineIndex = Math.floor(wordIndex / wordsPerLine)
        const wordIndexInLine = wordIndex % wordsPerLine

        setCurrentText(prevText => {
          const newText = prevText.map((l, i) => {
            if (i !== lineIndex) return l
            const newLine = [...l]
            if (wordIndexInLine < finalLines[lineIndex].length) {
              newLine[wordIndexInLine] = finalLines[lineIndex][wordIndexInLine]
              setFinalizedWords(prev => new Set(prev).add(`${lineIndex}-${wordIndexInLine}`))
            }
            return newLine
          })
          return newText
        })

        wordIndex++
        setTimeout(updateWord, 100)
      }

      updateWord()
    }
  }, [finalLines, finalText])

  const lineHeight = 1.6
  const containerHeight = `${lineHeight * totalLines}em`

  return (
        <div className='min-h-screen flex flex-col  justify-center'>
            <p className='w-full justify-start font-bold text-transparent bg-clip-text animate-gradient'>
                Tejiendo sueños... Estamos creando tu cuento.
            </p>
            <hr className='w-[85%] border-t border-gray-100 my-4' />
            <style jsx>{`
        .animate-gradient {
          background-image: linear-gradient(to right, #0ea5e9, #6B21A8, #0ea5e9);
          background-size: 200% auto;
          animation: gradient-move 6s linear infinite;
        }

        @keyframes gradient-move {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
            <div
              className='w-full max-w-4xl text-md whitespace-pre-wrap overflow-hidden'
              style={{ height: containerHeight }}
            >
                {currentText.map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className='flex flex-wrap transition-all duration-1000 ease-in-out'
                    >
                        {line.map((word, wordIndex) => {
                          const isHighlighted = highlightedIndices.some(index => index.line === lineIndex && index.word === wordIndex)
                          const isFinal = finalText !== null && finalLines !== null && word === finalLines[lineIndex][wordIndex]
                          const cleanWord = cleanFinalText(word)

                          return (
                                <span
                                  key={wordIndex}
                                  className={`transition-all duration-500 ease-in-out
                        ${isHighlighted ? 'text-sky-500 scale-110' : ''}
                        ${isFinal ? 'text-black' : ''}
                        ${!isHighlighted && !isFinal ? 'text-gray-300' : ''}`}
                                  style={{
                                    marginRight: '0.4em',
                                    transform: `translateY(${isHighlighted ? '-2px' : '0'})`,
                                    zIndex: 10
                                  }}
                                  aria-hidden={!isFinal}
                                >
                        {cleanWord}
                    </span>
                          )
                        })}
                    </div>
                ))}
            </div>
            <span className='sr-only'>{finalText || defaultFinalText}</span>
        </div>
  )
}
