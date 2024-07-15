import { useReducer } from "react";

export const action = {
    SET_UI_NAV_STATUS: "SET_UI_NAV_STATUS"

}
export const useProvider = () => {
    const initalState = {
        ui: {
            isSideNaveClosed: true,
            currentPage: ""
        },
    };
    function reducer(store, action) {
        switch (action.type) {
            case "SET_UI_NAV_STATUS":
                return { ...store, ui: { ...store.ui, isSideNaveClosed: action.payload } };
            case "SET_CURRENT_PAGE":
                return { ...store, ui: { ...store.ui, currentPage: action.payload } };

        }
    }

    const [store, dispatch] = useReducer(reducer, { ...initalState });
    return { store, dispatch }
}