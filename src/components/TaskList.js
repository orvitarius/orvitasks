import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSearch, faLayerGroup, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { formatDate, todayDate, tomorrowDate, getZeroTimeDate } from '../data/helpers';
import TaskListContent from './TaskListContent';
import Logout from './Logout';

import { setUserData } from '../reducer/actions';

const TaskList = ({ tasks, customClass, title, showOptions=false, allowChangeViews=false, defaultViewType='dates', defaultCollapsed=false }) => {

  const [titleFilter, setTitleFilter] = useState('');
  const [viewType, setViewType] = useState(allowChangeViews ? defaultViewType : 'list');
  const [visibleTasks, setVisibleTasks] = useState(tasks)

  const cats = useSelector(state => state.categories.categories);
  const userData = useSelector(state => state.user.user);
  const dispatch = useDispatch();


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


  // On viewType change, update userData with selected view
  useEffect(() => {
    const newUserData = {
      ...userData,
      'selectedViewType': viewType
    };
    
    if (allowChangeViews) {
      dispatch(setUserData(newUserData));
    }
    //eslint-disable-next-line
  }, [viewType, allowChangeViews])



  /**
   * Handle scrolling to update title background color
   */
  const [scrollPosition, setScrollPosition] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const mainElement = document.querySelector('.main');

    const handleScroll = () => {
      const currentPosition = mainElement.scrollTop;
      const newOpacity = Math.min(currentPosition / 100, 1);
      setScrollPosition(currentPosition);
      setOpacity(newOpacity);
    };

    mainElement.addEventListener('scroll', handleScroll);

    return () => {
      mainElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollPosition]);



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
  const dateCounter = visibleTasks.reduce((accumulator, task) => {
    if (task.due_date) {
      let date = new Date(getZeroTimeDate(task.due_date.toDate()));
      accumulator[date] = (accumulator[date] || 0) + 1;
    }
    return accumulator
  }, {});

  const dateCounterArray = Object.entries(dateCounter)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (b.date - a.date));

  const overdueTasks = visibleTasks
    .filter((task) => (task.due_date && getZeroTimeDate(task.due_date.toDate()) < getZeroTimeDate(todayDate)))

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
        <div className='tasks__title'
            style={{ backgroundColor: `rgba(26, 26, 26, ${opacity})` }}>

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
                        <div className='label'>{cat.key} ({dbCat.count})</div>
                    </div>
                    
                ))
            }

            <TaskListContent tasks={visibleTasks.filter((task) => task.categories.indexOf(dbCat.category) !== -1)} category={dbCat.category} />
        </div>)) }

        {(viewType === 'category' && (visibleTasks.some((task) => !task.categories.length))) &&
        <div className='categoryTasks categoryTasks--other'>
            <div className='categoryTasks__title'>
              <div className='label'>UNCATEGORIZED ({visibleTasks.filter((task) => !task.categories.length).length})</div>
            </div>

            <TaskListContent tasks={visibleTasks.filter((task) => !task.categories.length)} />
        </div>}


        {/**
         * View by dates
         * 
         **/
        viewType === 'dates' && overdueTasks.length > 0 &&
        <div className='dateTasks dateTasks--overdue'>
            <div className='dateTasks__title'>
              <div className='label'>OVERDUE ({ overdueTasks.length })</div>
            </div>
            
            <TaskListContent tasks={overdueTasks} />
        </div> }

        { viewType === 'dates' && dateCounterArray.filter(date => (getZeroTimeDate(date.date) >= getZeroTimeDate(todayDate))).map((date, dateIndex) => (
        <div key={dateIndex} className={`dateTasks dateTasks--${dateIndex} ${!overdueTasks.length ? 'dateTasks--firstItem' : ''}`}>
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
