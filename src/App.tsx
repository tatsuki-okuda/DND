import React, {useState, useEffect} from 'react';

import './App.css';
// import Dnd from './comp/Dnd'
import Dnd2 from './comp/Dnd2'


interface TableHeader {
  key: string;
  no: number;
  title: string | JSX.Element;
}

const initialHeader : TableHeader[]= [{
  key: '0',
  no: 0,
  title: 'id'
}, {
  key: '1',
  no: 1,
  title: 'name'
}, {
  key: '2',
  no: 2,
  title: 'username'
}, {
  key: '3',
  no: 3,
  title: 'email'
}, {
  key: 'customKey',
  no: 4,
  title: <>aaa</>
}]

type User = {
  id: string;
  name: string;
  username?: string;
  email?: string;
  
};

interface CustomUser extends User {
  customKey: JSX.Element | null
}

const CustomUserComp = () => {
  return (
    <>
      <p>custom</p>
    </>
  )
}



function App() {

  const [header, setHeader] = useState<TableHeader[]>(initialHeader);
  const [originUsers, setOriginUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<CustomUser[]>([]);


  useEffect(() => {
    (async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const users: User[] = await response.json();

      const customUsers: CustomUser[] = users.map(v => ({
        ...v,
        customKey: <CustomUserComp />
      }));

      setOriginUsers(users)
      setUsers(customUsers);
    })();
  }, []);


  return (
    <div className="App">
      {/* <Dnd /> */}

      <div style={{ margin: '2em' }}>
        <table>
          <thead>
            <tr>
              <Dnd2<TableHeader> 
                initItems={header}
                primaryKey='key'
                onChange={(newHeader) => setHeader(newHeader)}
                direction="horizontal"
                ghost={({ item, ghostProps }) => (
                  <th className="item ghost" {...ghostProps}>{item.title}</th>
                )}
              >
                {({ item, handleProps, itemProps }) => (
                    <th className="item" {...handleProps} {...itemProps}>{item.title}</th>
                )}
              </Dnd2>
            </tr>
          </thead>
          <tbody>
            <Dnd2<CustomUser>
              initItems={users}
              primaryKey='id'
              onChange={(newUsers) => setUsers(newUsers)}
              direction="vertical"
              ghost={({ item,ghostProps }) => (
                <tr className="ghost" {...ghostProps}>
                  {
                      header.map((header,index) => (
                        <td key={header.title+index.toString()}>{item[header.title as keyof CustomUser]}</td>
                    ))
                  }
                </tr>
              )}
            >
              {({ item, handleProps, itemProps }) => (
                <tr className="item" {...handleProps} {...itemProps}>
                {
                  header.map((header, index) => {
                    if(typeof header.title === 'string'){
                      return <td key={header.title+index.toString()}>{item[header.title as keyof CustomUser]}</td>
                    } else {
                      return <td key={header.title+index.toString()}>{item.customKey}</td>
                    }
                  })
                }
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
