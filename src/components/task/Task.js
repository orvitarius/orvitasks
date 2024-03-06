import React, { useEffect, useState } from 'react';
import { todayDate, tomorrowDate } from '../../data/helpers';

import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTask } from '../../reducer/actions';
import firestoreHelpers from '../../data/firestore-helpers';

import TaskDetails from './TaskDetails';
import TaskSummary from './TaskSummary';


const Task = ({task, hideCategory=null}) => {

    const dispatch = useDispatch();
    const selectedTask = useSelector(state => state.selectedTask.selectedTask);

    const [showDetails, setShowDetails] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isHovered, setIsHovered] = useState(false)

    const [isSmallScreen, setIsSmallScreen] = useState(false)

    useEffect(() => {
        setIsSelected(selectedTask && selectedTask.id === task.id);
    }, [selectedTask, task])


    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 769);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])


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
            const dueDate = task.due_date instanceof Date ? task.due_date : task.due_date.toDate();
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

        // Update firestore element
        firestoreHelpers.updateTaskInDatabase(updatedTask)
            .then(() => {
                if (unselect && selectedTask) dispatch(setSelectedTask(null));
            })
            .catch((error) => {
                console.error('Update error:', error)
            });
    }


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
    }


	return (
		<div 
            className={getTaskClasses()}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(selectedTask && selectedTask.id === task.id)}
            data-taskid={task.id}>

            <TaskSummary 
                task={task} 
                toggleSelectTask={toggleSelectTask}
                isSelected={isSelected}
                isHovered={isHovered}
                hideCategory={hideCategory}
                isSmallScreen={isSmallScreen}
                updateTask={updateTask}
                deleteTask={deleteTask}
                showDetails={showDetails}
                setShowDetails={setShowDetails}
            />

            <TaskDetails task={task} updateTask={updateTask} />
        </div>
    );
};

export default Task;