const initialState = {
    selectedTask: null
}

const selectedTaskReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_SELECTED_TASK':
            if (state.selectedTask === action.payload || !action.payload || action.payload.completed) {
                return {
                    ...state,
                    selectedTask: null
                }
            }
            return {
                ...state,
                selectedTask: action.payload
            };

        default:
            return state;
    }
}

export default selectedTaskReducer