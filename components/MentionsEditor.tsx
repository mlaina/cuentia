import React, { useEffect, useRef } from 'react'

type Protagonist = {
  id: string
  name: string
}

type MentionsEditorProps = {
  value: string
  onChange: (plainText: string) => void
  selectedProtagonists: Protagonist[]
  onSelectedProtagonistsChange?: (newSelected: Protagonist[]) => void
}

export function MentionsEditor ({
  value,
  onChange,
  selectedProtagonists,
  onSelectedProtagonistsChange
}: MentionsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Función que convierte el texto con menciones en HTML con "chips"
  function parseToHTML (text: string): string {
    let html = text
    selectedProtagonists.forEach((protagonist) => {
      const regex = new RegExp(`@${protagonist.name}`, 'g')
      html = html.replace(
        regex,
          `<span class="mention-chip bg-secondary-50 px-2 py-1 rounded-full text-sm border border-secondary-200 cursor-pointer">
          @${protagonist.name}
        </span>`
      )
    })
    return html
  }

  // Maneja la entrada del usuario extrayendo el texto plano
  function handleInput (e: React.FormEvent<HTMLDivElement>) {
    const plainText = e.currentTarget.innerText
    onChange(plainText)
    // Si se ha borrado parte de un nombre, filtramos los protagonistas que aún estén presentes
    const newSelected = selectedProtagonists.filter((protagonist) =>
      plainText.includes(`@${protagonist.name}`)
    )
    if (newSelected.length !== selectedProtagonists.length && onSelectedProtagonistsChange) {
      onSelectedProtagonistsChange(newSelected)
    }
  }

  // Coloca el cursor al final tras actualizar el contenido HTML
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = parseToHTML(value)
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [value, selectedProtagonists])

  // Event delegation: si se hace click en un chip, se elimina ese protagonista
  useEffect(() => {
    const handleChipClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('.mention-chip')
      if (target && editorRef.current && editorRef.current.contains(target)) {
        const name = target.innerText.trim().replace(/^@/, '')
        // Filtramos el protagonista de la lista
        const newSelected = selectedProtagonists.filter(
          (protagonist) => protagonist.name !== name
        )
        if (onSelectedProtagonistsChange) {
          onSelectedProtagonistsChange(newSelected)
        }
        // Actualizamos el contenido eliminando la mención
        const newValue = value.replace(new RegExp(`@${name}\\b`, 'g'), '').trim()
        onChange(newValue)
      }
    }
    const refCurrent = editorRef.current
    refCurrent?.addEventListener('click', handleChipClick)
    return () => {
      refCurrent?.removeEventListener('click', handleChipClick)
    }
  }, [value, selectedProtagonists, onSelectedProtagonistsChange, onChange])

  return (
      <div
        ref={editorRef}
        contentEditable
        className='w-full min-h-[150px] bg-white bg-opacity-80 border border-secondary-100 rounded-lg p-4 focus:outline-none resize-none'
        onInput={handleInput}
      />
  )
}
