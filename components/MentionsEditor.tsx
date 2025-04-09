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
  onSelectedProtagonistsChange,
  protagonists
}: MentionsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Función que convierte el texto con menciones en HTML con "chips"
  function parseToHTML (text: string): string {
    let html = text
    selectedProtagonists.forEach((protagonist) => {
      const regex = new RegExp(`@${protagonist.name}`, 'gi')
      html = html.replace(
        regex,
          `<span class="mention-chip bg-secondary-50 px-2 py-1 rounded-full text-sm border border-secondary-200 cursor-pointer" contenteditable="false" data-name="${protagonist.name}">
          @${protagonist.name}
        </span>`
      )
    })
    return html
  }

  function handleInput (e: React.FormEvent<HTMLDivElement>) {
    const plainText = e.currentTarget.innerText
    onChange(plainText)

    const mentionedNames = Array.from(
      plainText.matchAll(/@([\p{L}\p{M}\d_]+)/giu),
      (m) => m[1].toLowerCase()
    )

    const newSelected = protagonists.filter((p) =>
      mentionedNames.includes(p.name.toLowerCase())
    )

    // Solo actualizamos si hay cambios
    const hasChanged =
        newSelected.length !== selectedProtagonists.length ||
        !newSelected.every((p) => selectedProtagonists.some((sp) => sp.name === p.name))

    if (hasChanged && onSelectedProtagonistsChange) {
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

  useEffect(() => {
    const handleChipClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('.mention-chip')
      if (target && editorRef.current?.contains(target)) {
        const name = target.getAttribute('data-name')
        if (!name) return

        // Filtramos el protagonista de la lista
        const newSelected = selectedProtagonists.filter(
          (protagonist) => protagonist.name !== name
        )
        onSelectedProtagonistsChange?.(newSelected)

        // Eliminamos la mención del contenido original
        const newValue = value.replace(new RegExp(`@${name}\\b`, 'g'), '').trim()
        onChange(newValue)
      }
    }

    const editor = editorRef.current
    editor?.addEventListener('click', handleChipClick)
    return () => {
      editor?.removeEventListener('click', handleChipClick)
    }
  }, [value, selectedProtagonists, onSelectedProtagonistsChange, onChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace') return
      const sel = window.getSelection()
      if (!sel || !sel.anchorNode || sel.rangeCount === 0) return

      const range = sel.getRangeAt(0)
      const { startContainer, startOffset } = range

      // Si estamos justo después de un nodo
      const container = startContainer as HTMLElement
      const isTextNode = container.nodeType === Node.TEXT_NODE

      const previousNode = isTextNode
        ? container.previousSibling
        : container.childNodes[startOffset - 1]

      if (
        previousNode instanceof HTMLElement &&
          previousNode.classList.contains('mention-chip')
      ) {
        const name = previousNode.getAttribute('data-name')

        const newSelected = selectedProtagonists.filter(
          (p) => p.name !== name
        )
        if (onSelectedProtagonistsChange) {
          onSelectedProtagonistsChange(newSelected)
        }

        // También eliminamos la mención del texto original
        const newValue = value.replace(new RegExp(`@${name}\\b`, 'g'), '').trim()
        onChange(newValue)

        // Prevenimos que Backspace borre otra cosa
        e.preventDefault()
      }
    }

    const editor = editorRef.current
    editor?.addEventListener('keydown', handleKeyDown)
    return () => {
      editor?.removeEventListener('keydown', handleKeyDown)
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
