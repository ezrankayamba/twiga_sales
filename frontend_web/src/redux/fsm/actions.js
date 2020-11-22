import {apiGet} from "../../_services/WebService";
import {BASE_URL, REFRESH_ACTIONS_AT} from "../../conf";
import dayjs from "dayjs";

export const FSM_REFRESH_REQUEST = 'FSM_REFRESH_REQUEST'
export const FSM_REFRESH_SUCCESS = 'FSM_REFRESH_SUCCESS'
export const FSM_REFRESH_FAIL = 'FSM_REFRESH_FAIL'
export let refreshFSM = (token, cb) => {
    let success = ({states}) => {
        return {
            type: FSM_REFRESH_SUCCESS,
            payload: {
                states: states,
                at: Date.now()
            }
        }
    }

    let fail = (error) => {
        return {
            type: FSM_REFRESH_FAIL
        }
    }
    let request = () => {
        return {
            type: FSM_REFRESH_REQUEST
        }
    }
    return (dispatch, getState) => {
        let fsm = getState().fsm
        let expired = (last) => {
            let duration = dayjs(last).add(REFRESH_ACTIONS_AT, 'minute').diff(dayjs())
            return duration < 0
        }
        if (fsm.states && fsm.at && !expired(fsm.at)) {
            cb(true)
            return
        } else {
        }
        dispatch(request())
        apiGet(BASE_URL + "/payments/fsm-states", token)
            .then(states => {
                dispatch(success({states}))
                cb(true)
            }).catch(error => {
            cb(false)
            dispatch(fail("FSM refresh failed"))
        })
    }
}