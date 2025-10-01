import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserType = 'student' | 'interviewer';

interface UserState {
  userType: UserType | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  userType: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserType: (state, action: PayloadAction<UserType>) => {
      state.userType = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.userType = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUserType, logout } = userSlice.actions;
export default userSlice.reducer;
