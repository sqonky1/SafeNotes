import React, { createContext, useState } from 'react';

export const TabHistoryContext = createContext();

export const TabHistoryProvider = ({ children }) => {
  const [tabHistory, setTabHistory] = useState([]);

  const pushTab = (tabName) => {
    setTabHistory((prev) => [...prev, tabName]);
  };

  const popTab = () => {
    const newHistory = [...tabHistory];
    const lastTab = newHistory.pop();
    setTabHistory(newHistory);
    return lastTab;
  };

  return (
    <TabHistoryContext.Provider value={{ tabHistory, pushTab, popTab }}>
      {children}
    </TabHistoryContext.Provider>
  );
};
