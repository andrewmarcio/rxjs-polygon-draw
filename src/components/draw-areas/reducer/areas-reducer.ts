import { IPolygon } from 'types/polygon'

type TActionTypes = 'SET'
type TAreaReducerActions = {
    type: TActionTypes
    payload: IPolygon
}
function areasReducer(state: IPolygon[], action: TAreaReducerActions) {
    const { payload, type } = action
    if (!type) return state

    return {
        SET: [...state, payload],
    }[type]
}

export { areasReducer }
