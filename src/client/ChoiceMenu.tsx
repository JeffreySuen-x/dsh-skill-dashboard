import { useState } from 'react'
import { Button, Menu, IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './Panel.module.css'

/** Selection wiring only; DSH owns menu appearance, keyboard movement and focus return. */
export function ChoiceMenu({
  label,
  value,
  options,
  onChange,
  disabled = false,
  size = 'md',
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)?.label ?? '尚未添加'
  return (
    <Menu
      open={open}
      onClose={() => setOpen(false)}
      portal
      minWidthFromAnchor
      selectedId={value}
      items={options.map((option) => ({ id: option.value, label: option.label }))}
      onSelect={(next) => {
        setOpen(false)
        onChange(next)
      }}
      anchor={
        <Button
          variant="outline"
          size={size}
          className={css.choice}
          aria-label={`${label}：${selected}`}
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={disabled || options.length === 0}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{selected}</span>
          <IconChevronDownOutlineRegular />
        </Button>
      }
    />
  )
}
