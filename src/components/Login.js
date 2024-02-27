import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import { GoogleAuthProvider, signOut } from 'firebase/auth';

const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
      const allowedUsersRef = firestore.collection('allowedUsers');
      const allowedUsersSnapshot = await allowedUsersRef.get();
      const allowedEmails = allowedUsersSnapshot.docs.map(doc => doc.data().email);
      console.log(allowedEmails);
      console.log(user.email);
      if (allowedEmails.includes(user.email)) {
        // User is allowed, proceed with login
        // Add your logic here, e.g., redirect to a protected page
      } else {
        // User is not allowed, show error message
        signOut(auth);
        setErrorMessage('You are not allowed to sign in.');
      }
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Please sign in with Google:</h2>
      <button onClick={handleLogin}>Sign In</button>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default Login;