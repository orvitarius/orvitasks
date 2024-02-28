import React, {useState, useEffect} from 'react';
import { auth, firestore } from './firebase';
import { useDispatch } from 'react-redux';
import { setUserData } from './reducer/actions';

import Login from './components/Login';
import OrviTasks from './components/OrviTasks';


const App = () => {
  // const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      console.log('Auth state change', user);
      if (!user) {
        setIsLogged(false);
        return
      }

      firestore.collection('allowedUsers').where('email', '==', user.email).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const mergedUserData = { ...user, ...doc.data(), 'id': doc.id }
            dispatch(setUserData(mergedUserData));
            setIsLogged(true)
          } else {
            dispatch(setUserData(null))
            setIsLogged(false);
          }
        });
      })
    });
  }, []);


  return <div>{isLogged ? <OrviTasks /> : <Login />}</div>;
};

export default App;
