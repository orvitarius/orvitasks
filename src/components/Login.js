import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import { GoogleAuthProvider, signOut } from 'firebase/auth';
import { GoogleButton } from 'react-google-button'

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      console.log(user)
      const allowedUsersRef = firestore.collection('allowedUsers');
      const allowedUsersSnapshot = await allowedUsersRef.get();
      const allowedEmails = allowedUsersSnapshot.docs.map(doc => doc.data().email);
      if (!allowedEmails.includes(user.email)) {
        setErrorMessage('You are not allowed to sign in.');
        signOut(auth);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='loginPage'>
      <img className='mainLogo' src='./orvitasks_desktop.png' />
      
      <GoogleButton 
        onClick={handleLogin}
        label='Sign in with Google'
        type='light'
      />

      {/* <button onClick={handleLogin}>Sign In</button>
      {errorMessage && <p>{errorMessage}</p>} */}
    </div>
  );
};

export default Login;