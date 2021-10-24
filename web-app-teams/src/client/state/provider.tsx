import * as React from "react";
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { stateReducer as contextStateReducer } from "./context/reducer";
import { stateReducer as searchStateReducer } from "./search/reducer";
import { IContextState } from "./context/models";
import { ISearchState } from "./search/models";

export interface IRootState {
    context: IContextState,
    search: ISearchState
}

const rootReducer = combineReducers<IRootState>({
    context: contextStateReducer, 
    search: searchStateReducer
});

const store = createStore(rootReducer);

export const StateProvider = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};