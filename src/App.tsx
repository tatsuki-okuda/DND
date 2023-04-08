import React, {useState, useEffect} from 'react';

import './App.css';
// import Dnd from './comp/Dnd'
import Dnd2, { Item } from './comp/Dnd2'


function App() {

  const [users, setUsers] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users = await response.json();
      setUsers(users);
    })();
  }, []);

  const header = [{
    id: 'id',
    name: 'ID'
  }, {
    id: 'name',
    name: '名前'
  }, {
    id: 'username',
    name: 'ユーザ名'
  }, {
    id: 'email',
    name: 'Email'
  }]


  return (
    <div className="App">
      {/* <Dnd /> */}

      <div style={{ margin: '2em' }}>
        <table>
          <thead>
            <tr>
              <Dnd2 
                initItems={header}
                onChange={(newUsers) => setUsers(newUsers)}
                direction="horizontal"
                ghost={({ item, ghostProps }) => (
                  <tr className="caret-y" {...ghostProps}>{item.name}</tr>
                )}
              >
                {({ item, handleProps, itemProps }) => (
                    <th className="item" {...handleProps} {...itemProps}>{item.name}</th>
                )}
              </Dnd2>
            </tr>
              
          </thead>
          <tbody>
            <Dnd2 
              initItems={users}
              onChange={(newUsers) => setUsers(newUsers)}
              direction="vertical"
              ghost={({ item,ghostProps }) => (
                <tr className="caret-y" {...ghostProps}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                </tr>
              )}
            >
              {({ item, handleProps, itemProps }) => (
                <tr className="item" {...handleProps} {...itemProps}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                </tr>
              )}
            </Dnd2>
          </tbody>
        </table>
      </div>
      
    </div>
  );
}

export default App;
