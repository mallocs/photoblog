export default function LocationDetails({ geodata }) {
  if (!Boolean(geodata)) {
    return null
  }

  const { name, admin1Code, admin2Code, distance } = geodata

  if (admin1Code?.name == undefined && admin2Code?.name == undefined) {
    return <span>{name}</span>
  } else if (admin2Code?.name == undefined) {
    return (
      <span>
        {distance < 10 ? `${name}, ${admin1Code.name}` : `${admin1Code.name}`}
      </span>
    )
  }
  return (
    <span>
      {distance < 10
        ? `${name}, ${admin1Code.name}`
        : `${admin2Code.name}, ${admin1Code.name}`}
    </span>
  )
}
