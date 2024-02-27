export const setSelectedTask = (task) => {
    return {
        type: 'SET_SELECTED_TASK',
        payload: task
    };
};

export const setCategories = (cats) => {
    return {
        type: 'SET_DATABASE_CATS',
        payload: cats
    }
};

export const setUserData = (user) => {
    return {
        type: 'SET_USER_DATA',
        payload: user
    }
};