import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import Subtask from './Subtask';



const TaskDetails = ({ task, updateTask }) => {

    const [comment, setComment] = useState(task.comment || '')
    const [subtasks, setSubtasks] = useState(task.subtasks || [])
    const [newSubtask, setNewSubtask] = useState('');
    const [timeoutId, setTimeoutId] = useState(null)


    /**
    * Toggles the completion status of a subtask and updates the task properties
    * @param {Object} subtask - the subtask object to be toggled
    * @returns {void}
    */
    const toggleSubtask = (subtask) => {
        const updatedSubtasks = subtasks.map((st) => {
            return (st === subtask) ? {...st, completed: !st.completed } : st;
        });
    
        setSubtasks(updatedSubtasks);
        updateTask({ subtasks: updatedSubtasks }, false);
    }

    
    /**
    * Adds a new subtask to the task and updates the task with the new subtask
    * @returns {void}
    */
    const addSubtask = () => {
        if (!newSubtask.length) return;
        const updatedSubtasks = [
            ...subtasks,
            {
                id: uuidv4(),
                title: newSubtask,
                completed: false
            }
        ];
        setNewSubtask('');
        setSubtasks(updatedSubtasks);
        updateTask({ subtasks : updatedSubtasks }, false);
    }

    
    /**
    * Removes a subtask from the list of subtasks and updates the task
    * @param {Object} subtask - the subtask to be removed
    * @returns {void}
    */
    const removeSubtask = (subtask) => {
        const updatedSubtasks = subtasks.filter((st) => (st !== subtask));
        setSubtasks(updatedSubtasks)
        updateTask({ subtasks : updatedSubtasks }, false);
    }
    
    
    /**
    * Handles the drag end event for reordering subtasks
    * @param {Object} result - the result object from the drag end event
    * @param {Object} result.destination - the destination object of the drag end event
    * @param {number} result.destination.index - the index of the destination
    * @param {Array} subtasks - the array of subtasks
    * @param {Function} setSubtasks - a function to update the subtasks state with the new order
    * @param {Function} updateTask - a function to update the task with the new subtasks order
    * @returns {void}
    */
    const handleDragEnd = (result) => {
        if (!result.destination) return;
      
        const items = Array.from(subtasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
      
        // Update the subtasks state with the new order
        setSubtasks(items);
        updateTask({ subtasks : items }, false);
    };


    /**
     * Update the comment field in the tasks
     */
    const saveComment = (updatedComment) => {
        const updatedProperties = {
            comment : updatedComment.trim()
        }
        updateTask(updatedProperties, false);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className='task__details'>
                {/* -------- TASK SUBTASKS -------- */}
                <div className='subtasks'>
                    <Droppable droppableId='subtasks'>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className='subtasks__list'>
                                {subtasks.map((subtask, index) => (
                                    <Subtask 
                                        index={index} 
                                        key={index} 
                                        subtask={subtask} 
                                        toggleSubtask={toggleSubtask} 
                                        removeSubtask={removeSubtask} 
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <div className='addSubtask' onKeyDown={(e) => { if (e.keyCode === 13) addSubtask() } }>
                        <FontAwesomeIcon icon={faCirclePlus} onClick={() => addSubtask()}/>
                        <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
                    </div>
                </div>

                {/* -------- TASK COMMENT -------- */}
                <textarea value={comment} onChange={(e) => {
                    setComment(e.target.value);
                    clearTimeout(timeoutId);
                    const newTimeout = setTimeout(() => saveComment(e.target.value), 1500);
                    setTimeoutId(newTimeout)
                }} />
            </div>
        </DragDropContext>
    );
};

export default TaskDetails;