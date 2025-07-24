import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface LoaderState {
    loader?: boolean;
}

const initialState: LoaderState = {
    loader: false,
};

export const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        flagLoading: (state, action: PayloadAction<boolean>) => {
            state.loader = action.payload;
        },
    },
});

export const { flagLoading } = loadingSlice.actions;
export const selectLoading = (state: RootState) => state.loader.loader;

export default loadingSlice.reducer;
