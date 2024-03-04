import React from 'react';
import Checkbox from '../elements/Checkbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

import { Draggable } from '@hello-pangea/dnd';


const Subtask = ({ subtask, toggleSubtask, removeSubtask, index }) => {
  return (
    <Draggable draggableId={subtask.id} index={index}>
        {(provided) => (
            <div 
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`subtask ${subtask.completed ? 'subtask--completed' : ''}`} >
                    <Checkbox size='s' checked={subtask.completed} />
                    <div className='subtask__title' onClick={() => toggleSubtask(subtask)}>{subtask.title}</div>
                    <FontAwesomeIcon icon={faTrashCan} className='subtask__delete' onClick={() => removeSubtask(subtask)} />
            </div>
        )}
    </Draggable>
  );
};

export default Subtask;