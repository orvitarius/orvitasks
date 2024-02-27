
/**
 * @file firestore-helpers.js
 * @summary Helper functions for firestore database manipulation.
 * @description This file contains helper functions for data manipulation
 * @owner Sergi Rovira Morral <sroviramorral@gmail.com>
 * @license MIT
 * @see LICENSE.txt
 * @since 2024
 */

import { firestore } from "../firebase";

const firestoreHelpers = {
    /**
    * Adds multiple documents to the "categories" collection in Firestore
    * @param {Array} cats - an array of category objects
    * @returns {Promise} a Promise that resolves when all the documents have been successfully added
    */
    storeCategoriesInDatabase: (cats) => {
        // Add multiple docs to "categories" ref
        const batch = firestore.batch();
        const categoriesRef = firestore.collection('categories');
        
        for (let i=0; i<cats.length; i++) {
            let newCat = {...cats[i]};
            delete newCat.new;
            delete newCat.selected;

            const catRefDoc = categoriesRef.doc();
            batch.set(catRefDoc, newCat);
        }

        return batch.commit();
    },

    /**
    * Adds a new task to the Firestore collection
    * @param {Object} task - the task object to be added
    * @returns {Promise} a Promise that resolves with the reference to the newly added task
    */
    storeTaskInDatabase: (task) => {
        return firestore.collection('tasks').add(task);
    },

    /**
    * Sets a task document in the 'tasks' collection in Firestore
    * @param {Object} task - the task object to be set
    * @param {string} task.edit - the document ID of the task to be edited
    * @param {boolean} shouldMerge - whether the task should be merged with the existing document or not
    * @returns {Promise} a promise that resolves when the task document is successfully set
    */
    updateTaskInDatabase: (task, shouldMerge = false) => {
        const docId = task.edit;
        delete task.edit;
        return firestore.collection('tasks').doc(docId).set(task, { merge : shouldMerge })
    },

    /**
    * Deletes a task document from the Firestore collection
    * @param {Object} task - the task object to be deleted
    * @returns {Promise} a promise that resolves when the task document is successfully deleted
    */
    deleteTaskFromDatabase: (task) => {
        return firestore.collection('tasks').doc(task.id).delete();
    },

    /**
    * Deletes a category document from the Firestore collection
    * @param {Object} cat - the category object to be deleted
    * @returns {Promise} a promise that resolves when the category document is successfully deleted
    */
    deleteCategoryFromDatabase: (cat) => {
        return firestore.collection('categories').doc(cat.id).delete();
    },

    /**
     * Removes the category from all tasks which have it assigned
     * @param {*} cat - the category to be removed
     * @returns {Promise} a promise that resolves when the tasks have been updated
     */
    removeCategoryFromTasks: (cat) => {
        // Get all tasks with the category
        return firestore.collection('tasks').where('category', 'array-contains', cat.key).get()
            .then((querySnapshot) => {
            // For each task, remove the category key from the array
                const batch = firestore.batch();
                querySnapshot.forEach((doc) => {
                    const taskRef = firestore.collection('tasks').doc(doc.id);
                    const updatedCategories = doc.data().category.filter(key => key !== cat.key);
                    batch.update(taskRef, { category: updatedCategories });
                });

                return batch.commit();
            });
    }
}

export default firestoreHelpers;