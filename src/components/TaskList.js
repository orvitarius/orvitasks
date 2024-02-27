import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSearch, faLayerGroup, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { formatDate, todayDate, tomorrowDate } from '../data/helpers';
import TaskListContent from './TaskListContent';
import Logout from './Logout';

const TaskList = ({ tasks, customClass, title, showOptions=false, allowChangeViews=false, defaultViewType='list', defaultCollapsed=false }) => {

  const [titleFilter, setTitleFilter] = useState('');
  const [viewType, setViewType] = useState(defaultViewType);
  const [visibleTasks, setVisibleTasks] = useState(tasks)

  const cats = useSelector(state => state.categories.categories);
  const userData = useSelector(state => state.user.user);


  const sortingOptions = [
    {
        'viewType': 'list',
        'icon': faList,
    },
    {
         'viewType': 'category',
         'icon': faLayerGroup,
    },
    {
        'viewType': 'dates',
        'icon': faCalendarDay
    }
  ]



  useEffect(() => {
    if (titleFilter.length < 3) setVisibleTasks(tasks);

    setVisibleTasks((prev) => {
        return prev.filter((t) => t.title.toLowerCase().indexOf(titleFilter.toLowerCase()) !== -1)
    })
  }, [titleFilter, tasks])


  useEffect(() => {
    if (userData && allowChangeViews) {
      setViewType(userData.default_view);
    }
  }, [userData])
  


  /**
   * METHODS
   * 
   */

  const handleTitleFilter = (event) => {
    let text = event.target.value;
    setTitleFilter(text);
  }

  const toggleTaskList = (event) => {
    const tasksDiv = event.target.parentNode.parentNode;
    tasksDiv.classList.toggle('tasks--collapsed');
  }

  
  /**
  * Counts the number of pending tasks for each unique due date and sorts the result
  * @param {Array} allPendingTasks - Array of pending task objects
  * @returns {Array} Array of objects containing timestamp and count of pending tasks for each unique due date, sorted by count in descending order
  */
  const dateCounter = tasks.reduce((accumulator, task) => {
    if (task.due_date) {
      let date = new Date(task.due_date.toDate().setHours(0, 0, 0, 0));
      accumulator[date] = (accumulator[date] || 0) + 1;
    }
    return accumulator
  }, {});

  const dateCounterArray = Object.entries(dateCounter)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (b.date - a.date));

    /**
    * Returns the title for the given date
    * @param {Date} date - the input date
    * @returns {string} - the title for the given date ('Today', 'Tomorrow', or formatted date)
    */
  const getDateTitle = (date) => {
    if (new Date(date).toDateString() === todayDate.toDateString()) {
        return 'TODAY';
    } else if (new Date(date).toDateString() === tomorrowDate.toDateString()) {
        return 'TOMORROW';
    } else {
        return formatDate(date);
    }
  }


  /**
  * Counts the occurrences of each category in the tasks array and returns an array of category counts
  * @param {Array} tasks - Array of tasks containing categories
  * @returns {Array} An array of objects with category and count properties, sorted by count in descending order
  */
  const catCounter = tasks.reduce((accumulator, task) => {
    task.categories.forEach(cat => {
      accumulator[cat] = (accumulator[cat] || 0) + 1;
    })
    return accumulator;
  }, {})

  const catCounterArray = Object.entries(catCounter)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => (b.count - a.count))



  return (
    <div className={`tasks tasks--${customClass} ${defaultCollapsed ? 'tasks--collapsed' : ''}`}>
        <div className='tasks__title'>

            <h3 onClick={toggleTaskList}>{ title } ({visibleTasks.length})</h3>

            { showOptions && <div className='searchBox'>
                <FontAwesomeIcon icon={faSearch} />
                <input value={titleFilter} onChange={handleTitleFilter} />
            </div> }

            { showOptions && <div className='sortingOptions'>
                { sortingOptions.map((option, i) => (
                    <button key={i} className={`${viewType === option.viewType ? 'active' : ''}`} onClick={() => setViewType(option.viewType)}>
                        <FontAwesomeIcon icon={option.icon} />
                    </button>
                )) }

            </div>}

            { showOptions && <div className='userOptions'>
                <Logout/>
            </div>}
        </div>


        {/**
         * View by list
         * 
         */
        viewType === 'list' && <TaskListContent tasks={visibleTasks} /> }


        {/**
         * View by categories
         * 
         */
        viewType === 'category' && catCounterArray.map((dbCat, dbCatIndex) => (
        <div key={dbCatIndex} className={`categoryTasks categoryTasks--${dbCatIndex}`}>
            {
                // Get category from cats matching dbCat
                cats.filter((cat) => cat.key === dbCat.category).map((cat, catIndex) => (
                    <div key={catIndex} className='categoryTasks__title' style={{ borderColor: cat.color }}>
                        {/* <div className='background' style={{ backgroundColor: cat.color }}></div> */}
                        <div className='label'>{cat.key} ({dbCat.count})</div>
                    </div>
                    
                ))
            }

            <TaskListContent tasks={visibleTasks.filter((task) => task.categories.indexOf(dbCat.category) !== -1)} category={dbCat.category} />
        </div>)) }

        {(viewType === 'category' && (visibleTasks.filter((task) => task.categories.length === 0).length > 0)) &&
        <div className='categoryTasks categoryTasks--other'>
            <div className='categoryTasks__title'>
              <div className='label'>UNCATEGORIZED ({visibleTasks.filter((task) => task.categories.length === 0).length})</div>
            </div>

            <TaskListContent tasks={visibleTasks.filter((task) => task.categories.length === 0)} />
        </div>}


        {/**
         * View by dates
         * 
         **/ 
         viewType === 'dates' && dateCounterArray.map((date, dateIndex) => (
        <div key={dateIndex} className={`dateTasks dateTasks--${dateIndex}`}>
            <div className='dateTasks__title'>
              <div className='label'>{getDateTitle(date.date)} ({date.count})</div>
            </div>

            <TaskListContent tasks={visibleTasks
                    .filter((task) => {
                        if (!task.due_date) return false;
                        const dueDate = task.due_date.toDate();
                        return (dueDate.toDateString() === new Date(date.date).toDateString());
                    })
            } />
        </div>)) }

        {viewType === 'dates' &&
        <div className='dateTasks dateTasks--other'>
            <div className='dateTasks__title'>
              <div className='label'>NO DUE DATE ({visibleTasks.filter((task) => (!task.due_date)).length})</div>
            </div>
            
            <TaskListContent tasks={visibleTasks.filter((task) => (!task.due_date))} />
        </div> }
    </div>
  );
};

export default TaskList;
