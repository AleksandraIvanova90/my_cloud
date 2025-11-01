import { useEffect } from "react"

function UserList() {
    const fetchUsersList = async() => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/')
            const data = await response.json()
            console.log(data)
        } catch (error) {
            console.error('Error fatching users:', error)
        }
    }
    useEffect(() => {
        fetchUsersList()
    }, [])

    return(
        <table className="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Имя</th>
      <th scope="col">Фамилия</th>
      <th scope="col">Обращение</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
   
  </tbody>
</table>
    )
}

export default UserList