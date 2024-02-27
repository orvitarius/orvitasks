import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

import { useSelector } from 'react-redux';

const Logout = () => {

  const userData = useSelector(state => state.user.user);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <div>
        <button className='logoutButton' onClick={handleLogout}>
            <img src={userData?._delegate?.photoURL} />
            <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
    </div>
  );
};

export default Logout;