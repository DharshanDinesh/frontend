import { useReducer } from "react";

export const action = {
    SET_UI_NAV_STATUS: "SET_UI_NAV_STATUS",
    SET_LOGGED_OUT: "SET_LOGGED_OUT"

}
export const useProvider = () => {
    const initalState = {
        ui: {
            isSideNaveClosed: true,
            currentPage: "",
            isLoggedIn: sessionStorage.getItem("isLoggedIn"),
        },
    };
    function reducer(store, action) {
        switch (action.type) {
            case "SET_UI_NAV_STATUS":
                return { ...store, ui: { ...store.ui, isSideNaveClosed: action.payload } };
            case "SET_CURRENT_PAGE":
                return { ...store, ui: { ...store.ui, currentPage: action.payload } };
            case "SET_LOGGED_IN": {
                sessionStorage.setItem("isLoggedIn", true)
                return { ...store, ui: { ...store.ui, isLoggedIn: true } };
            }
            case "SET_LOGGED_OUT": {
                sessionStorage.clear();
                return { ...store, ui: { ...store.ui, isLoggedIn: false } };
            }
        }
    }

    const [store, dispatch] = useReducer(reducer, { ...initalState });
    return { store, dispatch }
}