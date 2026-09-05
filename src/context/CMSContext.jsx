"use client";
import { createContext, useState } from 'react';

export const CMSContext = createContext();

export const INITIAL_STATS = {
  projectsCompleted: 0,
  industrialClients: 0,
  serviceCategories: 8,
  safetyCompliance: 0,
};

export const INITIAL_PROJECTS = [];

export const CMSProvider = ({ children }) => {
  const [introState, setIntroState] = useState('done');
  const [stats, setStats] = useState(INITIAL_STATS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const updateStats = (newStats) => {
    setStats((prev) => ({
      ...prev,
      ...newStats,
    }));
  };

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const editProject = (id, updatedProject) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, ...updatedProject } : proj))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
  };

  return (
    <CMSContext.Provider
      value={{
        stats,
        projects,
        updateStats,
        addProject,
        editProject,
        deleteProject,
        introState,
        setIntroState,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

