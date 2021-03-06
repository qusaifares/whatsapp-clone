import React, { useState, useEffect } from 'react';

import EditField from '../EditField/EditField';

import { Avatar } from '@material-ui/core';

import { useStateValue } from '../../store/StateProvider';
import { ActionType } from '../../store/reducer';

import db, { auth } from '../../firebase';

import './Profile.css';

import { DrawerType } from '../Sidebar/Sidebar';

interface Props {}

const Profile: React.FC<Props> = () => {
  const [{ user, sideDrawer }, dispatch] = useStateValue();
  const [nameString, setNameString] = useState<string>('');
  useEffect(() => {
    setNameString(user?.name || '');
  }, [user]);

  const submitName = (): void => {
    const userRef = db.collection('users').doc(user.google_uid);
    userRef.get().then((doc) => {
      let data = doc.data();

      if (!data) return;
      // if name is same as string
      if (nameString === data.name) return;

      // if string is too long or too short
      if (!nameString || nameString.length > 25)
        return setNameString(data.name);

      auth.currentUser?.updateProfile({ displayName: nameString }).then(() => {
        dispatch({
          type: ActionType.SET_GOOGLE_USER,
          value: auth.currentUser
        });
      });
      userRef.update({ name: nameString }).then(() => {
        if (!data) return;
        data.name = nameString;
        dispatch({ type: ActionType.SET_USER, value: data });
      });
    });
  };

  return (
    <div
      className={`profile ${
        sideDrawer === DrawerType.Profile && 'profile-open'
      }`}
    >
      <Avatar src={user?.photoURL} />
      <EditField
        label='Your Name'
        value={nameString}
        onChange={(e) => setNameString(e.target.value)}
        onSubmit={submitName}
      />
    </div>
  );
};

export default Profile;
