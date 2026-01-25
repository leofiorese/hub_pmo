import React, { createContext, useState, useContext } from 'react';

const AnalyticsContext = createContext({});

export function AnalyticsProvider({ children }) {
    // Wizard State - Persists across steps
    const [selectedTables, setSelectedTables] = useState({}); // { TABLE_KEY: ['col1', 'col2'] }
    const [filters, setFilters] = useState({}); // { TABLE_KEY: [ { id, column, operator, value } ] }
    const [dataPreview, setDataPreview] = useState(null); // { TABLE_KEY: [rows] }
    const [analysisResult, setAnalysisResult] = useState("");

    const clearAnalytics = () => {
        setSelectedTables({});
        setFilters({});
        setDataPreview(null);
        setAnalysisResult("");
    };

    return (
        <AnalyticsContext.Provider value={{
            selectedTables, setSelectedTables,
            filters, setFilters,
            dataPreview, setDataPreview,
            analysisResult, setAnalysisResult,
            clearAnalytics
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    return useContext(AnalyticsContext);
}
