import { Group } from '@/types/goal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  addGroup: (name: string) => Promise<string>;
  toggleGroup: (groupId: string) => void;
}

export const GroupsContext = createContext<GroupsContextType | null>(null);

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    saveGroups();
  }, [groups]);

  const loadGroups = async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const saveGroups = async () => {
    try {
      await AsyncStorage.setItem('groups', JSON.stringify(groups));
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  };

  const addGroup = async (name: string): Promise<string> => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      isExpanded: true,
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup.id;
  };

  const toggleGroup = (groupId: string) => {
    setGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, isExpanded: !group.isExpanded }
          : group
      )
    );
  };

  return (
    <GroupsContext.Provider value={{ groups, setGroups, addGroup, toggleGroup }}>
      {children}
    </GroupsContext.Provider>
  );
}

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
}; 