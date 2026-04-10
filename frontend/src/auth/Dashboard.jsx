
export default function Dashboard({user}) {
  return (
    <div>
        <p className="text-3xl md:text-4xl text-center">Dashboard</p>
        <p className="text-center">Name: {user}</p>
    </div>
  )
}
