import DateFormatter from '#/components/shared/DateFormatter'

type Props = {
  dateRange: [string, string]
}

const DateRangeFormatter = ({ dateRange }: Props) => {
  const [startDate, endDate] = dateRange
  if (startDate.slice(0, 10) === endDate.slice(0, 10)) {
    // Same day
    return <DateFormatter dateString={startDate} />
  } else if (startDate.slice(0, 7) === endDate.slice(0, 7)) {
    // Same month
    return (
      <>
        <DateFormatter dateString={startDate} format="LLLL	d-" />
        <DateFormatter dateString={endDate} format="d, yyyy" />
      </>
    )
  } else if (startDate.slice(0, 4) === endDate.slice(0, 4)) {
    // Same year
    return (
      <>
        <DateFormatter dateString={startDate} format="LLLL	d – " />
        <DateFormatter dateString={endDate} format="LLLL d, yyyy" />
      </>
    )
  }
  return (
    <>
      <DateFormatter dateString={dateRange[0]} />
      <span> to </span>
      <DateFormatter dateString={dateRange[1]} />
    </>
  )
}

export default DateRangeFormatter
