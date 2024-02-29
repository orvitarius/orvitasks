import React, { useEffect, useState } from 'react';
import CategoryBadge from './elements/CategoryBadge';
import Checkbox from './elements/Checkbox';
import { getDueDateString, todayDate, tomorrowDate } from '../data/helpers';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faBoxArchive, faTrashCan, faCalendarPlus, faCalendarDay, faWarning, faCheck, faXmark, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTask } from '../reducer/actions';
import firestoreHelpers from '../data/firestore-helpers';

import { Howl } from 'howler';



const Task = ({task, hideCategory=null}) => {

    const dispatch = useDispatch();
    const selectedTask = useSelector(state => state.selectedTask.selectedTask);
    const cats = useSelector(state => state.categories.categories);

    const [showDetails, setShowDetails] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [comment, setComment] = useState(task.comment)
    const [timeoutId, setTimeoutId] = useState(null)
    const [isHovered, setIsHovered] = useState(false)

    const isOverdue = (task.due_date && (task.due_date.toDate() < todayDate));

    useEffect(() => {
        setConfirmDelete(false);
        setIsSelected(selectedTask && selectedTask.id === task.id)
        setShowDetails(selectedTask && selectedTask.id === task.id && !!task.comment && task.comment !== '');
    }, [selectedTask, task])

    const successSound = new Howl({
        src: ['./sounds/success_sound.wav'],
        volume: 0.5,
        rate: 2
    });


    /**
    * Returns an array of CSS classes for a task based on its properties
    * @returns {string} a space-separated string of CSS classes for the task
    */
    const getTaskClasses = () => {
        let classes = ['task'];

        classes.push(task.completed ? 'task--completed' : '');
        classes.push(showDetails ? 'task--opened' : '');
        classes.push(isSelected ? 'task--selected' : '');

        if (task.due_date) {
            classes.push('task--due');
            const dueDate = task.due_date.toDate();
            if (dueDate.toDateString() === todayDate.toDateString()) {
                classes.push('task--due-today');
            } else if (dueDate.toDateString() === tomorrowDate.toDateString()) {
                classes.push('task--due-tomorrow');
            } else if (dueDate < todayDate) {
                classes.push('task--overdue');
            }
        }

        return classes.join(' ');
    }

    
    /**
    * Updates a task with the given properties and updates it in the database
    * @param {Object} updatedProperties - the properties to update the task with
    * @returns {void}
    */
    const updateTask = (updatedProperties, unselect=true) => {
        const updatedTask = {
            ...task,
            ...updatedProperties,
            edit: task.id
        };
        console.log('okokoko')

        // Update firestore element
        firestoreHelpers.updateTaskInDatabase(updatedTask)
            .then(() => {
                if (unselect) dispatch(setSelectedTask(null));
            })
            .catch((error) => {
                console.error('Update error:', error)
            });
    }

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

    /**
     * Update the comment field in the tasks
     */
    const saveComment = (updatedComment) => {
        const updatedProperties = {
            comment : updatedComment.trim()
        }
        updateTask(updatedProperties, false);
    };

    /**
    * Deletes a task from the database and updates the state
    */
    const deleteTask = () => {
        firestoreHelpers.deleteTaskFromDatabase(task)
            .then(() => {
                console.log('delete ok')
                dispatch(setSelectedTask(null));
            })
            .catch((error) => {
                console.error('Update error:', error)
            });
    }

    /**
    * Toggles the selection of a task and shows/hides its details
    */
    const toggleSelectTask = () => {
        dispatch(setSelectedTask(selectedTask === task ? null : task));
        setShowDetails(selectedTask !== task);
    }
    

	return (
		<div 
            className={getTaskClasses()}
            onDoubleClick={() => toggleSelectTask()}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(selectedTask && selectedTask.id === task.id)}
            data-taskid={task.id}>
            
            <div className='task__summary'>
                <div className='checkbox'>
                    <Checkbox checked={task.completed} clickAction={toggleCompleted} />
                </div>

                <div className='content'>
                    <div className='title'>{task.title}</div>
                    <div className='categories'>
                        {
                            task.categories
                                .filter(cat => (!hideCategory || cat !== hideCategory))
                                .sort((a, b) => a.localeCompare(b))
                                .map((cat, catIndex) => {
                                let catObj = cats.filter((dbCat, _) => (dbCat.key === cat))[0];
                                
                                return (
                                    <CategoryBadge key={catIndex} categoryObj={catObj} size='s'/>
                                    )
                                }
                            )
                        }
                    </div>
                </div>

                <div className='options'>
                    {!isSelected && comment && <FontAwesomeIcon className='hasComment' icon={faMessage} />}

                    { (isSelected || isHovered) && <div className='actions'>
                        {/* POSTPONE */}
                        { !task.archived && !task.completed && <button className='taskAction' onClick={postponeTask}>
                            <FontAwesomeIcon icon={faCalendarPlus} />
                        </button>}

                        {/* ADD COMMENT */}
                        { !task.completed && <button className='taskAction' onClick={() => setShowDetails(!showDetails)}>
                            <FontAwesomeIcon icon={faMessage} />
                        </button>}
                        
                        {/* ARCHIVE */}
                        { !task.completed && <button className='taskAction' onClick={toggleArchived}>
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

                    {/* DUE DATE */}
                    {(!isSelected && !isHovered) && task.due_date && <div className='dueDate'>
                        { isOverdue && <FontAwesomeIcon icon={faWarning} /> }
                        { !isOverdue && <FontAwesomeIcon icon={faCalendarDay} /> } { getDueDateString(task.due_date) }
                    </div>}
                </div>
            </div>

            <div className='task__details'>
                <textarea value={comment} onChange={(e) => {
                    setComment(e.target.value);
                    clearTimeout(timeoutId);
                    const newTimeout = setTimeout(() => saveComment(e.target.value), 1500);
                    setTimeoutId(newTimeout)
                }} />
            </div>
        </div>
    );
};

export default Task;