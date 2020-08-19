import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Avatar } from '@material-ui/core';

import './SidebarChat.css';

import { useStateValue } from '../../store/StateProvider';

import db from '../../firebase';
import firebase from 'firebase';

interface Props {
  addNewChat?: boolean;
  room?: any;
  id?: string;
}

const SidebarChat: React.FC<Props> = ({ addNewChat, room, id }) => {
  let history = useHistory();
  const [{ user }, dispatch] = useStateValue();
  const [lastMessage, setLastMessage] = useState<
    firebase.firestore.DocumentData
  >();

  const createChat = (): void => {
    if (!user) return;
    const roomName = prompt('Please enter a name for the chat.');
    if (!roomName) return;

    const userRef = db.collection('users').doc(user.google_uid);

    db.collection('rooms')
      .add({ name: roomName, members: [userRef] })
      .then((roomRef) => {
        userRef
          .update({
            rooms: firebase.firestore.FieldValue.arrayUnion(roomRef)
          })
          .then(() => history.push(`/rooms/${roomRef.id}`))
          .catch((err) => console.log(err));
      });
  };

  useEffect(() => {
    if (!id) return;
    db.collection('rooms')
      .doc(id)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) =>
        setLastMessage(snapshot.docs.map((doc) => doc.data())[0])
      );
  });

  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
      <div className='sidebarChat'>
        <Avatar />
        <div className='sidebarChat__info'>
          <h2>{room.name}</h2>
          <p>
            {lastMessage?.content &&
              `${lastMessage?.name}: ${lastMessage?.content}`}
          </p>
        </div>
      </div>
    </Link>
  ) : (
    <div className='sidebarChat' onClick={createChat}>
      <h2>Add New Chat</h2>
    </div>
  );
};

export default SidebarChat;