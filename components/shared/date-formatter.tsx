import { parseISO, format as formatFn } from 'date-fns'

type Props = {
  dateString: string
  format?: string
}

const DateFormatter = ({ dateString, format = 'LLLL	d, yyyy' }: Props) => {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{formatFn(date, format)}</time>
}

export default DateFormatter
