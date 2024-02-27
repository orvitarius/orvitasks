import React from 'react';
import Task from './Task';

const TaskListContent = ({ tasks, category=null }) => {

  return (
    <div className='tasks__list'>
        { 
            tasks.map((task, index) => (
                <Task key={index} task={task} hideCategory={category}/>
            ))
        }
    </div>
  );
};

export default TaskListContent;
