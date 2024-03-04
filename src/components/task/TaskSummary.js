import React from 'react';
import Checkbox from './elements/Checkbox';
import CategoryBadge from './elements/CategoryBadge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faBoxArchive, faTrashCan, faCalendarPlus, faCalendarDay, faWarning, faCheck, faXmark, faBoxOpen, faCirclePlus, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const TaskSummary = ({ task, isSelected, isHovered, toggleCompleted, toggleArchived, deleteTask, postponeTask, setShowDetails }) => {
  const getTaskClasses = () => {
    let classes = ['task'];

    classes.push(task.completed ? 'task--completed' : '');
    classes.push(isSelected ? 'task--selected' : '');
    classes.push(isHovered ? 'task--opened' : '');

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
  };

  return (
    <div className={getTaskClasses()} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(selectedTask && selectedTask.id === task.id)} data-taskid={task.id}>
      <div className='task__summary'>
        <div className='checkbox'>
          <Checkbox checked={task.completed} clickAction={toggleCompleted} />
        </div>

        <div className='content'>
          <div className='title' onDoubleClick={() => toggleSelectTask()}>
            {task.title}
          </div>
          <div className='categories'>
            {task.categories
              .filter((cat) => !hideCategory || cat !== hideCategory)
              .sort((a, b) => a.localeCompare(b))
              .map((cat, catIndex) => {
                let catObj = cats.filter((dbCat, _) => dbCat.key === cat)[0];

                return <CategoryBadge key={catIndex} categoryObj={catObj} size='s' />;
              })}
          </div>
        </div>

        <div className='options'>
          {!isSelected && !!subtasks.length && (
            <span className='subtaskCounter'>
              <FontAwesomeIcon icon={faCheckCircle} />
              {`${subtasks.filter((st) => st.completed).length}/${subtasks.length}`}
            </span>
          )}
          {!isSelected && comment && <FontAwesomeIcon className='hasComment' icon={faMessage} />}

          {(isSelected || isHovered) && (
            <div className='actions'>
              {/* POSTPONE */}
              {!task.archived && !task.completed && (
                <button className='taskAction' onClick={postponeTask}>
                  <FontAwesomeIcon icon={faCalendarPlus} />
                </button>
              )}

              {/* ADD COMMENT */}
              {!task.completed && (
                <button className='taskAction' onClick={() => setShowDetails(!showDetails)}>
                  <div className='iconPair'>
                    <FontAwesomeIcon icon={faCheck} className='icon-front' />
                    <FontAwesomeIcon icon={faMessage} className='icon-back' />
                  </div>
                </button>
              )}

              {/* ARCHIVE */}
              {!task.completed && (
                <button className='taskAction' onClick={toggleArchived}>
                  {!task.archived ? <FontAwesomeIcon icon={faBoxArchive} /> : <FontAwesomeIcon icon={faBoxOpen} />}
                </button>
              )}

              {/* DELETE BUTTON */}
              <button className={`taskAction ${confirmDelete && 'taskAction--doubleButton'}`}>
                {!confirmDelete ? (
                  <FontAwesomeIcon icon={faTrashCan} onClick={() => setConfirmDelete(true)} />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} onClick={deleteTask} />
                    <FontAwesomeIcon icon={faXmark} onClick={() => setConfirmDelete(false)} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* DUE DATE */}
          {!isSelected && !isHovered && task.due_date && (
            <div className='dueDate'>
              {isOverdue ? <FontAwesomeIcon icon={faWarning} /> : <FontAwesomeIcon icon={faCalendarDay} />} {getDueDateString(task.due_date)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSummary;