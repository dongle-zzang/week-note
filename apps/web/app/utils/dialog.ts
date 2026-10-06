// Keep Tab within the modal, including at the browser's native dialog boundaries.
export function trapDialogFocus(event: KeyboardEvent) {
  const dialog = event.currentTarget as HTMLDialogElement
  const controls = [...dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')]
    .filter(element => !element.closest('[inert]') && element.getClientRects().length > 0)
  const first = controls[0]
  const last = controls.at(-1)
  if (!first || !last) return
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
    event.preventDefault()
    first.focus()
  }
}

export function restoreDialogFocus(event: FocusEvent) {
  const dialog = event.currentTarget as HTMLDialogElement
  queueMicrotask(() => {
    if (dialog.open && !dialog.contains(document.activeElement)) {
      dialog.querySelector<HTMLElement>('button:not(:disabled)')?.focus()
    }
  })
}
