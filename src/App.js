import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebase';

import { useDispatch, useSelector } from 'react-redux';
import { setCategories, setUserData } from './reducer/actions';

import Login from './components/Login';
import OrviTasks from './components/OrviTasks';


const App = () => {
  const [tasks, setTasks] = useState([])
  const user = useSelector(state => state.user.user);

  const dispatch = useDispatch();


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      firestore.collection('allowedUsers').where('email', '==', user.email).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const mergedUserData = { ...user, ...doc.data(), 'id': doc.id }
            dispatch(setUserData(mergedUserData));
          } else {
            dispatch(setUserData(null))
          }
        });
      })
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    let unsubscribe;

    if (user) {
      const catRef = firestore.collection('categories');

      unsubscribe = catRef.onSnapshot((snapshot) => {
        const updatedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        dispatch(setCategories(updatedCategories));
      })
    }
  
    return () => unsubscribe && unsubscribe();
  }, [user])



  useEffect(() => {
    let unsubscribe;

    if (Object.keys(user).length > 0) {
      const tasksRef = firestore.collection('tasks').where('userId', '==', user.id);

      unsubscribe = tasksRef.onSnapshot((snapshot) => {
        const updatedTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setTasks(updatedTasks);
      })
    }
  
    return () => unsubscribe && unsubscribe();
  }, [user])

  return <div>{user ? <OrviTasks tasks={tasks} /> : <Login />}</div>;
};

export default App;
