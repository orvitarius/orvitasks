import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { setCategories } from '../reducer/actions';

import { firestore } from '../firebase';

import NewTask from './NewTask';
import TaskList from './TaskList';

const OrviTasks = () => {

  const user = useSelector(state => state.user.user);

  const [tasks, setTasks] = useState([])
  const dispatch = useDispatch();



  /**
   * Get categories
   */
  useEffect(() => {
    let unsubscribe;

    if (user) {
      const catRef = firestore.collection('categories').where('userId', '==', user.id);

      unsubscribe = catRef.onSnapshot((snapshot) => {
        const updatedCategories = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        dispatch(setCategories(updatedCategories));
      })
    }
  
    return () => unsubscribe && unsubscribe();
    // eslint-disable-next-line
  }, [user])


  /**
   * Get tasks
   */
  useEffect(() => {
    let unsubscribe;

    if (user) {
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

  const allPendingTasks = tasks
    .filter(task => (!task.completed && !task.archived))
    .sort((a, b) => {
      // Sort by > due_date ascending, and then by creation_date descending
      return a.due_date && b.due_date
        ? a.due_date.toDate().getTime() - b.due_date.toDate().getTime()
        : a.due_date
          ? -1
          : b.due_date
            ? 1
            : b.creation_date - a.creation_date;
    });

  const completedTasks = tasks.filter(task => {
    if (!task.completion_date) {
      return false;
    }
    const completionDate = task.completion_date.toDate();
    completionDate.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day
  
    return task.completed && completionDate.getTime() === today.getTime();
  });

  const archivedTasks = tasks
    .filter(task => task.archived && !task.completed)
    .sort((a, b) => (b.creation_date - a.creation_date));



  return (
    <div className='orvitasks'>

      <div className='main'>
        <TaskList
          tasks={allPendingTasks}
          customClass={'pending'}
          title={'Pending'}
          showOptions={true}
          allowChangeViews={true}
        />

        <TaskList
          tasks={completedTasks}
          customClass={'completed'}
          title={'Completed today'}
        />

        <TaskList
          tasks={archivedTasks}
          customClass={'archived'}
          title={'Archived'}
          defaultCollapsed={true}
        />
      </div>

      <NewTask />
    </div>
  );
};

export default OrviTasks;
