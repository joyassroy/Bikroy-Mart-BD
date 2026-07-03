import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

const RECENT_KEY = "bm-recent-searches";

function loadRecent() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(list) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export const fetchSuggestions = createAsyncThunk(
  "search/fetchSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      if (!query || query.trim().length < 1) {
        const res = await api.get("/products/suggestions?popular=true");
        return { suggestions: res.data.data || [], isPopular: true };
      }
      const res = await api.get(`/products/suggestions?q=${encodeURIComponent(query.trim())}`);
      return { suggestions: res.data.data || [], isPopular: false };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    suggestions: [],
    recentSearches: loadRecent(),
    showDropdown: false,
    loadingSuggestions: false,
    isPopular: false,
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    setShowDropdown(state, action) {
      state.showDropdown = action.payload;
    },
    addRecentSearch(state, action) {
      const term = action.payload;
      if (!term.trim()) return;
      state.recentSearches = [term, ...state.recentSearches.filter((s) => s !== term)].slice(0, 8);
      saveRecent(state.recentSearches);
    },
    clearRecentSearches(state) {
      state.recentSearches = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem(RECENT_KEY);
      }
    },
    clearSuggestions(state) {
      state.suggestions = [];
      state.isPopular = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestions.pending, (state) => {
        state.loadingSuggestions = true;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.loadingSuggestions = false;
        state.suggestions = action.payload.suggestions;
        state.isPopular = action.payload.isPopular;
      })
      .addCase(fetchSuggestions.rejected, (state) => {
        state.loadingSuggestions = false;
        state.suggestions = [];
      });
  },
});

export const {
  setQuery,
  setShowDropdown,
  addRecentSearch,
  clearRecentSearches,
  clearSuggestions,
} = searchSlice.actions;

export default searchSlice.reducer;
