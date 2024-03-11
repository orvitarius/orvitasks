import React, { useState, useEffect } from 'react';
import Checkbox from '../elements/Checkbox';
import CategoryBadge from '../elements/CategoryBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faBoxArchive, faTrashCan, faCalendarPlus, faCalendarDay, faWarning, faCheck, faXmark, faBoxOpen, faEllipsisVertical, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { todayDate, getDueDateString, getZeroTimeDate } from '../../data/helpers';

import { useSelector } from 'react-redux';
import { Howl } from 'howler';


const TaskSummary = ({ task, isSelected, isHovered, updateTask, hideCategory, isSmallScreen, deleteTask, toggleSelectTask, showDetails, setShowDetails }) => {
  
  const cats = useSelector(state => state.categories.categories);
  
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [comment, setComment] = useState(task.comment)
  const [subtasks, setSubtasks] = useState(task.subtasks || [])

  const userData = useSelector(state => state.user.user);

  const isOverdue = task.due_date && getZeroTimeDate(task.due_date.toDate()) < getZeroTimeDate(todayDate);

  const successSound = new Howl({
      src: ['./sounds/success_sound.wav'],
      volume: 0.5,
      rate: 2
  });

  useEffect(() => {
    setSubtasks(task.subtasks || []);
    setComment(task.comment || '');
}, [isSelected, task])

  
  /**
  * Toggles the completed status of a task and updates the task properties
  */
  const toggleCompleted = () => {
      const updatedProperties = {
          completed : !task.completed,
          'completion_date' : !task.completed ? new Date() : null,
      };
      updateTask(updatedProperties);
      if (updatedProperties.completed) {
          successSound.play();
      }
  }

  /**
  * Toggles the archived status of a task and updates the task properties
  */
  const toggleArchived = () => {
      const updatedProperties = {
          archived : !task.archived,
      };
      updateTask(updatedProperties);
  }

  /**
   * If task has due date, postpone it by one day
   * Else, add duedate to today
   */
  const postponeTask = () => {
      const updatedProperties = {
          due_date : task.due_date ? new Date(task.due_date.toDate().setDate(task.due_date.toDate().getDate() + 1)) : new Date(),
      };
      updateTask(updatedProperties);
  }




  return (
    <div className='task__summary'>
        <div className='checkbox'>
            <Checkbox checked={task.completed} clickAction={toggleCompleted} />
        </div>

        {/* -------- TASK CONTENT -------- */}

        <div className='content'>
            <div className='title' onDoubleClick={toggleSelectTask}>{task.title}</div>
            { isOverdue }
            <div className='categories'>
                {
                    task.categories
                        .filter(cat => (!hideCategory || cat !== hideCategory))
                        .sort((a, b) => a.localeCompare(b))
                        .map((cat, catIndex) => {
                          let catObj = cats.filter((dbCat, _) => (dbCat.key === cat))[0];
                          return (<CategoryBadge key={catIndex} categoryObj={catObj} size='s'/>)
                        }
                    )
                }
            </div>
        </div>

        {/* -------- TASK ACTIONS -------- */}

        <div className='options'>
            {/* COMMENT INDICATOR */}
            {comment && <FontAwesomeIcon className='hasComment' icon={faMessage} />}

            {/* SUBTASKS */}
            {!!subtasks.length && 
                <span className='subtaskCounter'>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {`${subtasks.filter((st) => (st.completed)).length}/${subtasks.length}`}
                </span>
            }

            { (isSelected || isHovered) && 
            <div className='actions'>
                {/* POSTPONE */}
                { !task.archived && !task.completed && 
                <button className='taskAction' onClick={postponeTask}>
                    <FontAwesomeIcon icon={faCalendarPlus} />
                </button> }

                {/* TOGGLE DETAILS */}
                { !task.completed && 
                <button className='taskAction' onClick={() => setShowDetails(!showDetails)}>
                    <div className='iconPair'>
                        <FontAwesomeIcon icon={faCheck} className='icon-front'/>
                        <FontAwesomeIcon icon={faMessage} className='icon-back'/>
                    </div>
                </button> }

                { (!isSmallScreen || showMoreActions) && 
                <div className='extraActions'>
                    {/* ARCHIVE */}
                    { !task.completed &&
                    <button className='taskAction' onClick={toggleArchived}>
                        { !task.archived && <FontAwesomeIcon icon={faBoxArchive} /> }
                        { task.archived && <FontAwesomeIcon icon={faBoxOpen} /> }
                    </button> }
                    
                    {/* DELETE BUTTON */}
                    <button className={`taskAction ${confirmDelete && 'taskAction--doubleButton'}`} >
                        { !confirmDelete && <FontAwesomeIcon icon={faTrashCan} onClick={() => setConfirmDelete(true)} /> }
                        { confirmDelete && <FontAwesomeIcon icon={faCheck} onClick={deleteTask} /> }
                        { confirmDelete && <FontAwesomeIcon icon={faXmark} onClick={() => setConfirmDelete(false)}/> }
                    </button>
                </div> }

                {/* ON MOBILE, TOGGLE EXTRA DETAILS */}
                { isSmallScreen && 
                <button className='taskAction mobileToggle' onClick={() => setShowMoreActions(!showMoreActions)}>
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>}
            </div> }

            {/* DUE DATE */}
            { (!isSelected && !isHovered && userData.selectedViewType !== 'dates') && task.due_date && 
            <div className='dueDate'>
                { isOverdue && <FontAwesomeIcon icon={faWarning} /> }
                { !isOverdue && <FontAwesomeIcon icon={faCalendarDay} /> } 
                { getDueDateString(task.due_date) }
            </div> }
        </div>
    </div>
  );
};

export default TaskSummary;