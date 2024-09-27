import { FC, useRef, type FormEvent, type KeyboardEvent } from 'react'
import './SingleCharInput.scss'

interface SingleCharInputProps {
   length: number
   value: string
   disabled?: boolean
   state?: 'error' | 'success'
   onInput?: (value: string) => void
}

export const SingleCharInput: FC<SingleCharInputProps> = ({
   length,
   value,
   disabled,
   state,
   onInput,
}) => {
   const input = useRef<HTMLDivElement>(null)

   const updateInputValue = () => {
      const value = Array.from(input.current?.children ?? [])
         .map((child) => (child as HTMLInputElement).value)
         .join('')

      onInput?.(value)
   }

   const onCharInput = (e: FormEvent<HTMLInputElement>) => {
      const char = e.target as HTMLInputElement
      const nextChar = char.nextElementSibling as HTMLInputElement

      if (char.value !== '' && nextChar) nextChar.focus()

      updateInputValue()
   }

   const onCharKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      const char = e.target as HTMLInputElement

      const nextChar = char.nextElementSibling as HTMLInputElement
      const prevChar = char.previousElementSibling as HTMLInputElement

      const emptyAndBackspace = e.key === 'Backspace' && char.value === ''
      const arrowLeft = e.key === 'ArrowLeft'

      if ((emptyAndBackspace || arrowLeft) && prevChar) {
         prevChar.focus()
         window.requestAnimationFrame(() => prevChar.setSelectionRange(1, 1))
      }

      if (e.key === 'ArrowRight' && nextChar) {
         nextChar.focus()
      }
   }

   return (
      <>
         <div className={'single-char-input ' + state ?? ''} ref={input}>
            {Array.from({ length }).map((_, index) => (
               <input
                  key={index}
                  type="text"
                  value={value[index] ?? ''}
                  disabled={disabled}
                  className="char"
                  maxLength={1}
                  onInput={onCharInput}
                  onKeyDown={onCharKeyDown}
               />
            ))}
         </div>
      </>
   )
}
