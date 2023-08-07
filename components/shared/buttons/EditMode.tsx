import { EditIcon, CancelIcon, DeleteIcon } from '#/components/shared/icons'

const buttonCSS =
  'rounded pointer bg-primary text-sm text-black font-bold uppercase leading-normal shadow-md shadow-zinc-500/20 dark:shadow-slate-300/70 transition-all hover:shadow-md hover:shadow-zinc-500/40 dark:hover:shadow-slate-400/50 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:opacity-40 disabled:shadow-none'

function ReorderButton({ setReorderModeFn, reorderModeEnabled }) {
  return (
    <button
      className={`${buttonCSS} opacity-70 w-18 h-18 p-2`}
      type="button"
      title="Reorder Slides"
      onClick={() => setReorderModeFn(!reorderModeEnabled)}
    >
      Reorder Slides
    </button>
  )
}

function CancelButton({ cancelFn }) {
  return (
    <button
      className={`${buttonCSS} w-10 h-10 p-2`}
      title="Cancel"
      onClick={cancelFn}
      type="button"
    >
      <CancelIcon />
    </button>
  )
}

function SubmitReorderButton({ submitFn, disabled }) {
  return (
    <button
      className={`${buttonCSS} p-2`}
      title="Reorder Slides"
      onClick={submitFn}
      disabled={disabled}
      type="button"
    >
      Submit
    </button>
  )
}

function EditModeButton({ editModeEnabled, setEditModeFn }) {
  return (
    <button
      className={`${buttonCSS} opacity-70 w-10 h-10 p-2`}
      title={editModeEnabled ? 'Cancel' : 'Edit Post'}
      onClick={() => setEditModeFn(!editModeEnabled)}
      type="button"
    >
      {editModeEnabled ? <CancelIcon /> : <EditIcon />}
    </button>
  )
}

function SaveButton({ saveFn, disabled }) {
  return (
    <button
      className={`${buttonCSS} p-2`}
      title="Save changes"
      onClick={saveFn}
      disabled={disabled}
    >
      Save
    </button>
  )
}

function UndoButton({ undoFn, disabled }) {
  return (
    <button
      className={`${buttonCSS} p-2`}
      title="Undo changes"
      onClick={undoFn}
      disabled={disabled}
    >
      Undo
    </button>
  )
}

function DeleteButton({ deleteFn, disabled }) {
  return (
    <button
      className={`${buttonCSS} w-10 h-10 p-1 `}
      title="Delete slide"
      onClick={(e) => {
        e.stopPropagation()
        deleteFn()
      }}
      disabled={disabled}
    >
      <DeleteIcon />
    </button>
  )
}

export {
  ReorderButton,
  CancelButton,
  SubmitReorderButton,
  EditModeButton,
  SaveButton,
  UndoButton,
  DeleteButton,
}
