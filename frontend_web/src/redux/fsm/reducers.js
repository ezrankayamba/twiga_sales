import {FSM_REFRESH_FAIL, FSM_REFRESH_REQUEST, FSM_REFRESH_SUCCESS} from "./actions";
import dayjs from "dayjs";

let initialState = {
    states: null,
    at: null
}

let fsmReducer = (state = initialState, action) => {
    switch (action.type) {
        case FSM_REFRESH_REQUEST:
            return {
                ...state
            }

        case FSM_REFRESH_SUCCESS:
            return {
                ...state,
                states: action.payload.states,
                at: dayjs().format()
            }
        case FSM_REFRESH_FAIL:
            return {
                ...state
            }
        default:
            return state
    }
}

export default fsmReducer