
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  username: string;
  email: string
}

const initialDragIndex = -1;

const Dnd = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [dragIndex, setDragIndex] = useState<number>(initialDragIndex);

  /**
   * @function
   * @param {number} index 
   * @returns {void}
   */
  const dragStart = (index: number): void => {
    console.log('drag start', index);
    setDragIndex(index);
  };


  /**
   * @function
   * @param {number} index 
   * @returns {void}
   */
  const dragEnter = (index: number): void => {
    if (index === dragIndex) return;

    const cloneUsers = [...users];
    [cloneUsers[index], cloneUsers[dragIndex]] = [users[dragIndex], users[index]];
    
    setUsers(cloneUsers);
    setDragIndex(index);
  };

  /**
   * @function
   * @returns {void}
   */
  const dragEnd = (): void => {
    setDragIndex(initialDragIndex)
  };
  


  useEffect(() => {
    (async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();
      setUsers(users);
    })();
  }, []);


  return (
    <div style={{ margin: '2em' }}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>ユーザ名</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users && users.map((user, index) => (
            <tr 
              key={user.id}
              draggable={true}
              onDragStart={() => dragStart(index)}
              onDragEnter={() => dragEnter(index)}
              onDragOver={(event) => event.preventDefault()}
              onDragEnd={dragEnd}
              className={index === dragIndex ? 'dragging' : ''}
            >
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Dnd