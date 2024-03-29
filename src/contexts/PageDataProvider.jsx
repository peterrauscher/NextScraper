import { useRef, useState, useEffect } from 'react'
import { createContext } from 'react'

export const PageDataContext = createContext()

export const PageDataProvider = ({ children }) => {
  const jsonRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [scrapedData, setScrapedData] = useState({
    url: '',
    stateType: '',
    jsonString: '{}',
    data: {},
    pageEnabled: false,
  })

  const scrapeData = async () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
      setLoading(true)
      chrome.tabs.sendMessage(tab.id, { type: 'retreive_dom' }, (res) => {
        setScrapedData({
          url: tab.url,
          ...res,
        })
        setLoading(false)
      })
    })
  }

  useEffect(() => {
    if (jsonRef.current && scrapedData.jsonString)
      jsonRef.current.textContent = scrapedData.jsonString
  }, [scrapedData])

  useEffect(() => {
    scrapeData()
  }, [])

  return (
    <PageDataContext.Provider
      value={{
        scrapedData: scrapedData,
        pageEnabled: scrapedData.pageEnabled,
        loading: loading,
        jsonRef: jsonRef,
      }}
    >
      {children}
    </PageDataContext.Provider>
  )
}
