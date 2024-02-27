import { createStore, combineReducers } from 'redux';
import selectedTaskReducer from './reducer/selectedTaskReducer';
import categoriesReducer from './reducer/categoriesReducer';
import userReducer from './reducer/userReducer';

const rootReducer = combineReducers({
    selectedTask: selectedTaskReducer,
    categories: categoriesReducer,
    user: userReducer
})

const store = createStore(rootReducer);

export default store;
