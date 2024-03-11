import React, {useState, useEffect} from 'react';
import { auth, firestore } from './firebase';
import { useDispatch } from 'react-redux';
import { setUserData } from './reducer/actions';
import { getZeroTimeDate } from './data/helpers';

import Login from './components/Login';
import OrviTasks from './components/OrviTasks';


const App = () => {
  // const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  const [isLogged, setIsLogged] = useState(false)
  const [lastFocusDate, setLastFocusDate] = useState(new Date())


  useEffect(() => {
    /**
    * Checks the authentication state and sets the user data if authenticated
    * @param {Object} user - the user object
    * @returns {void}
    */
    auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsLogged(false);
        return
      }

      // Get user from authorized users database, and load their data.
      firestore.collection('allowedUsers').where('email', '==', user.email).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const mergedUserData = doc.exists ? { ...user, ...doc.data(), 'id': doc.id } : null;
          dispatch(setUserData(mergedUserData))
          setIsLogged(doc.exists)
        });
      })
    });


    
    /**
    * Handles the focus event and checks for a new day to reload the page if necessary
    * @returns {void}
    */
    const handleFocus = () => {
      console.log('Page focused. Check for new day');
      
      // If lastFocusDate day is not today, reload
      const currentDate = new Date();

      if (lastFocusDate && getZeroTimeDate(lastFocusDate).toISOString() !== getZeroTimeDate(currentDate).toISOString()) {
          console.log('New day. Reloading');
          window.location.reload();
      }
    }
  
    /**
    * Handles the blur event and sets the last focus date
    * @returns {void}
    */
    const handleBlur = () => {
      console.log('Page blurred. Setting last focus date');
      setLastFocusDate(new Date());
    }

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    }

    // eslint-disable-next-line
  }, []);



  return <div>{isLogged ? <OrviTasks /> : <Login />}</div>;
};

export default App;
