'use client'

import React, { createContext, useContext, useState } from 'react'

interface FileContextType {
  resumeFile: File | null
  setResumeFile: (file: File | null) => void
}

const FileContext = createContext<FileContextType>({
  resumeFile: null,
  setResumeFile: () => {},
})

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  return (
    <FileContext.Provider value={{ resumeFile, setResumeFile }}>
      {children}
    </FileContext.Provider>
  )
}

export const useFileContext = () => useContext(FileContext)
