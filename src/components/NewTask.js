import React, { useState, useRef, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faPenToSquare, faGears } from '@fortawesome/free-solid-svg-icons';

import firestoreHelpers from '../data/firestore-helpers';
import { calculateBrightness } from '../data/helpers';

import DatePicker from "react-datepicker";
import { registerLocale } from  "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from 'date-fns/locale/es';
import CategoryBadge from './elements/CategoryBadge';

import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTask } from '../reducer/actions';


registerLocale('es', es)


const NewTask = () => {

    const dispatch = useDispatch();
    const selectedTask = useSelector(state => state.selectedTask.selectedTask);
    const cats = useSelector(state => state.categories.categories);
    const userData = useSelector(state => state.user.user);


    const [taskText, setTaskText] = useState("");
    const [taskCategories, setTaskCategories] = useState([]);
    const [dueDate, setDueDate] = useState(null);

    const [showCatSelector, setShowCatSelector] = useState(false);
    const [catFilter, setCatFilter] = useState('')
    const [editCategories, setEditCategories] = useState(false);

    const inputRef = useRef(null);

    /**
     * Effect to load task for edition
     * 
     */
    useEffect(() => {
        // If object not empty, we are editing
        if (selectedTask && Object.keys(selectedTask).length !== 0) {
            resetForm();
            setTaskText(selectedTask.title);
            
            // For categories, get the db data for each category key in the array
            let categoriesToLoad = [];
            selectedTask.categories.forEach((catKey) => {
                const cat = cats.filter((cat) => (cat.key === catKey));
                if (cat.length > 0 && !categoriesToLoad.includes(cat[0])) {
                    categoriesToLoad.push(cat[0]);
                }
            });

            setTaskCategories(categoriesToLoad);

            if (selectedTask.due_date) {
                setDueDate(selectedTask.due_date.toDate());
            }
        } else {
            resetForm();
        }
    }, [selectedTask, cats])


    /**
    * Handles form submission for adding or editing a task
    * @param {Event} event - the form submission event
    * @returns {void}
    */
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get the task details from the form fields
        const task = {
            // Add the necessary properties for the task (e.g., title, description, etc.)
            'title': taskText,
            'categories': taskCategories.map((tl, _) => (tl.key)),
            'completed': false,
            'description': '',
            'due_date': dueDate,
            'creation_date': new Date(),
            'edit' : selectedTask ? selectedTask.id : false,
            'comment': selectedTask ? (selectedTask.comment || '') : '',
            'userId': userData?.id || '',
            'subtasks': selectedTask ? selectedTask.subtasks : []
        };

        const promises = [
            storeTaskInDatabase(task),
            storeCategoriesInDatabase(taskCategories)
        ];

        Promise.all(promises)
            .then(([taskResult, categoriesResult]) => {
                // Handle the result of both promises here
                console.log('Task and categories stored successfully');
                resetForm();
                dispatch(setSelectedTask(null))
            })
            .catch((error) => {
                console.error('Error storing task and categories:', error);
                // Handle the error here
            });
    };

    /**
    * Stores a task in the database (new or updated)
    * @param {Object} task - the task object to be stored
    * @returns {Promise} - a promise that resolves with the stored task
    */
    const storeTaskInDatabase = (task) => {
        return (task.edit ? 
            firestoreHelpers.updateTaskInDatabase(task) : firestoreHelpers.storeTaskInDatabase(task));
    };

    /**
    * Stores new categories in the database
    * @param {Array} cats - the array of category objects
    * @returns {Promise} a promise that resolves when the categories are stored in the database
    */
    const storeCategoriesInDatabase = (cats) => {
        cats = cats.filter((cat) => (cat.new));
        if (!cats || !cats.length) return;
        
        return firestoreHelpers.storeCategoriesInDatabase(cats);
    };

    /**
    * Deletes a category from the database and updates related tasks
    * @param {Object} cat - the category to be deleted
    * @returns {void}
    */
    const deleteCategoryFromDatabase = (cat) => {
        firestoreHelpers.deleteCategoryFromDatabase(cat)
            .then(() => { 
                console.log('delete ok')

                 // Delete from taskCategories
                let newTaskCategories = taskCategories.filter((tCat) => (tCat.key !== cat.key));
                setTaskCategories(newTaskCategories);

                // Remove from any task which had it as category, in batch
                firestoreHelpers.removeCategoryFromTasks(cat)
                    .then(() => {
                        console.log('Category removed from tasks');
                    })
                    .catch((error) => {
                        console.error('Error removing category from tasks:', error);
                    });
            })
            .catch(error => { console.error('Delete error:', error)});
    }

    /**
    * Resets the form by clearing task categories, task text, due date, toggles, etc.
    * @returns {void}
    */
    const resetForm = () => {
        setTaskCategories([]);
        setTaskText('');
        setDueDate(null);
        setShowCatSelector(false);
    }


    /**
    * Adds a new category to the list of task categories
    * @param {Object} existingCategory - the existing category object, if any
    * @param {string} newKey - the key for the new category
    * @param {string} newColor - the color for the new category
    * @returns {void}
    */
    const addCategoryToList = (existingCategory, newKey='', newColor='') => {
        let newCat = {
            'key': existingCategory ? existingCategory.key : newKey,
            'selected': false,
            'new': !existingCategory,
            'color': existingCategory ? existingCategory.color : newColor,
            'textColor': existingCategory?.textColor,
            'userId': userData?.id || ''
        }
        setTaskCategories([...taskCategories, newCat]);
    }

    const handleTextChange = (event) => {
        let text = event.target.value;

        // PARSE THE LISTS
        if (text.includes("[")) {
            setShowCatSelector(true);
            // Set categories filter to text after opening bracket, not included
            const filter = text.substring(text.indexOf('[') + 1)
            setCatFilter(filter.toUpperCase());
        } else {
            setShowCatSelector(false);
            setCatFilter('');
        }

        // Extract the content between "[" and "]", and add it to the taskLists array
        if (text.includes("[") && text.includes("]")) {
            let catKey = text.substring(text.indexOf("[") + 1, text.indexOf("]")).toUpperCase();

            // Check if it's already added to the current list
            if (taskCategories.some((tCat, _) => (tCat.key === catKey))) {
                text = text.replace(/\[.*?\]/g, '');
                setTaskText(text);
                setCatFilter('');
                return;
            }

            // Check if list exists in the DB to get data
            const exists = cats.find((dbCat) => (dbCat.key === catKey));

            addCategoryToList(exists, catKey);
            setShowCatSelector(false);
            setCatFilter('');

            // Remove the text between brackets, including the brackets themselves
            text = text.replace(/\[.*?\]/g, '');
        }

        // TRIGGER DATE SELECTOR
        if (text.includes('//')) {
            const element = document.querySelector('.datePickerInput');
            if (element) {
                element.focus();
            }
        } 

        // Update sanitized text
        setTaskText(text);
    }


    /**
    * Handles key press event and performs autocomplete if conditions are met
    * @param {Event} event - the key press event object
    * @returns {void}
    */
    const handleKeyPress = (event) => {
        const keyCode = event.keyCode || event.which;
        const filteredDbCats = cats.filter((cat) => (cat.key.indexOf(catFilter.toUpperCase()) !== -1))
        
        // If "TAB" pressed, autocomplete if only one list is available and not alredy added
        if (keyCode === 9 
            && taskText.includes('[') && !taskText.includes(']') 
            && (filteredDbCats.length === 1) 
            && !taskCategories.some((tCat, _) => (tCat.key === filteredDbCats[0].key))) {
            event.preventDefault();
            
            // Add filtered list to task
            addCategoryToList(filteredDbCats[0])
            setShowCatSelector(false);
            setCatFilter('');

            // Remove the text from [ until end of text
            let text = (taskText + ']').replace(/\[.*?\]/g, '');
            setTaskText(text);
        }
    }


    /**
     *  DUE DATE METHODS
     *
     */
    const selectDatePicker = (event) => {
        let text = inputRef.current.value;

        // Remove "//" from the text
        text = text.replace(/\/\//g, '');
        setTaskText(text);
        setDueDate(event);
    }

    useEffect(() => {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }, [dueDate])
    
  

    
    /**
     * CATEGORIES METHODS
     * 
     */
    
    const removeCat = (catToBeRemoved) => {
        setTaskCategories((currentCat) => {
            return currentCat.filter((cat) => cat.key !== catToBeRemoved.key);
        });
    };
        
    const selectCat = (catToBeUpdated) => {
        setTaskCategories((currentCat) => {
            return currentCat.map((cat, i) => {
                return cat.key === catToBeUpdated.key ? {...cat, selected : !cat.selected} : {...cat, selected : false }
            })
        })
    }
    
	const randomizeCategoryColor = (catToBeUpdated) => {
		// Generate a random RGB color in HEX format
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += Math.floor(Math.random() * 16).toString(16);
		}

        // Calculate the brightness value of the color
        const brightness = calculateBrightness(color);

        // Set the text color based on the brightness value
        const textColor = brightness > 127.5 ? 'black' : 'antiquewhite';
		
		setTaskCategories((currentCat) => {
            return currentCat.map((cat) => {
                return cat.key === catToBeUpdated.key ? {...cat, color : color, textColor: textColor} : cat
            })
        })
	}



  return (
    <div className='task-form'>
      <form className='addTaskForm' onSubmit={handleSubmit}>
        <div className={`dbCats ${showCatSelector ? 'dbCats--visible' : ''}`}>
            {
                cats
                .filter((cat, _) => (
                    taskCategories.map((tC, _) => (tC.key)).indexOf(cat.key) === -1
                ))
                .filter((cat, _) => {
                    if (catFilter === '' || catFilter.length < 2) {
                        return true;
                    }

                    return (cat.key.indexOf(catFilter) !== -1)
                })
                .sort((a, b) => a.key.localeCompare(b.key)) // TODO => Sort by recent use or most common
                .map((cat, index) => (
                    <CategoryBadge
                        key={index}
                        categoryObj={cat}
                        clickCallback={addCategoryToList}
                        showRemove={editCategories}
                        removeAction={deleteCategoryFromDatabase}
                    />
                ))
            }

            <div className='catsSetup' onClick={(e) => { e.preventDefault(); setEditCategories(!editCategories)}}>
                <FontAwesomeIcon icon={faGears} />
            </div>
        </div>

        <div className='addTaskForm__content'>
            <div className='taskCatsWrapper'>
                <div className='addList'>
                    <span onClick={() => setShowCatSelector(!showCatSelector)}>{showCatSelector ? '-' : '+'}</span>
                </div>

                <div className='taskCats'>
                    {
                        taskCategories.map((cat, index) => (
                            <CategoryBadge 
                                key={index} 
                                categoryObj={cat}
                                removeAction={removeCat}
                                clickCallback={selectCat}
                                selected={cat.selected}
                                showRemove={cat.selected}
                                plusClickAction={randomizeCategoryColor}
                            />
                        ))
                    }
                </div>
                
                <div className={`dueDate ${dueDate && 'dueDate--active'}`}>
                    <DatePicker
                        locale="es"
                        dateFormat="P"
                        allowSameDay={true}
                        className='datePickerInput'
                        onChange={ selectDatePicker }
                        onSelect={ selectDatePicker }
                        selected={ dueDate }
                        placeholderText='Due date'
                        startDate={ new Date() }
                        minDate={ new Date() }
                    />
                </div>
            </div>
            
            <div className='taskTextWrapper'>
                <input 
                    className='taskText'
                    placeholder='New task...'
                    ref={ inputRef }
                    value={ taskText }
                    onChange={ handleTextChange }
                    onKeyDown={ handleKeyPress }
                    autoFocus
                />
                
                <button type='submit' className={`submitTask ${(taskText.trim() === '') ? 'disabled' : ''}`} disabled={(taskText.trim() === '')}>
                    {!selectedTask && <FontAwesomeIcon icon={faCircleCheck} />}
                    {selectedTask && <FontAwesomeIcon icon={faPenToSquare} />}
                </button>
            </div>

        </div>
      </form>
    </div>
  );
};

export default NewTask;