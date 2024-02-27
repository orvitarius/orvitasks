import React from 'react';

import NewTask from './NewTask';
import TaskList from './TaskList';

const OrviTasks = ({ tasks }) => {

  /**
   * Get task lists
   */

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
