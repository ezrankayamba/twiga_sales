export const FORMS_NEW_OPTION = 'FORMS_NEW_OPTION'
export const FORMS_CLEAR_OPTION = 'FORMS_CLEAR_OPTION'
export const FORMS_CLEAR_ALL_OPTIONS = 'FORMS_CLEAR_ALL_OPTIONS'

export let addNewOption = (field, {id, name}) => {
    const data = {
        name: field, data: {id, name}
    }
    return {
        type: FORMS_NEW_OPTION,
        payload: data
    }
}
export let clearNewOptions = () => {
    return (dispatch, getState) => {
        dispatch({
            type: FORMS_CLEAR_ALL_OPTIONS
        })
    }
}
export let clearNewOption = (name) => {
    return (dispatch, getState) => {
        dispatch({
            type: FORMS_CLEAR_OPTION,
            payload: name
        })
    }
}
