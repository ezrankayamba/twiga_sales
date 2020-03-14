import {FORMS_CLEAR_ALL_OPTIONS, FORMS_CLEAR_OPTION, FORMS_NEW_OPTION} from "./actions";

let initialState = {newOptions: {}}

let formsReducer = (state = initialState, action) => {
    switch (action.type) {
        case FORMS_NEW_OPTION:
            return {
                newOptions: {
                    ...state.newOptions,
                    [action.payload.name]: action.payload.data
                }
            }
        case FORMS_CLEAR_OPTION:
            return {
                newOptions: {
                    ...state.newOptions,
                    [action.payload]: undefined
                }
            }
        case FORMS_CLEAR_ALL_OPTIONS:
            return {
                ...initialState
            }
        default:
            return state
    }
}

export default formsReducer
