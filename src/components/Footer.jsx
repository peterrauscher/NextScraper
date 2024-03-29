import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faFileExport, faCode } from '@fortawesome/free-solid-svg-icons'
import { useContext } from 'react'
import { PageDataContext } from '../contexts/PageDataProvider'
import { ClipboardContext } from '../contexts/ClipboardProvider'

export const Footer = () => {
  const { scrapedData, pageEnabled, jsonRef } = useContext(PageDataContext)
  const { copyToClipboard } = useContext(ClipboardContext)

  const copySnippet = (language) => {
    let snippet = ''
    switch (language) {
      case 'javascript':
        snippet = `const axios = require("axios");
  const cheerio = require("cheerio");
  
  const targetUrl = "${scrapedData.url}";
  
  axios
    .get(targetUrl)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        // Check for a Next.js cache
        const cachedData = $("script#__NEXT_DATA__").text();
        if (!cachedData) {
          // Otherwise, check for a React state cache
          cachedData = $("script[data-name=query]")
            .text()
            .split("=")[1]
            .trim()
            .replace(/;+$/, "");
        }
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          /**
           * TODO:
           * Do what you wish with the parsed Next.js/React data here!
           **/
        }
      } else {
        // You may need to spoof some headers in your request to bypass anti-scraping measures
        console.error("Failed to retrieve the page.");
      }
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
        `
        break
      case 'python':
        snippet = `import requests
  from bs4 import BeautifulSoup
  import json
  
  target_url = "${scrapedData.url}"
  
  try:
      response = requests.get(target_url)
      if response.status_code == 200:
          html = response.text
          soup = BeautifulSoup(html, 'html.parser')
  
          # Check for a Next.js cache
          cached_data = soup.find('script', id='__NEXT_DATA__').text
          if not cached_data:
              # Otherwise, check for a React state cache
              cached_data = soup.find('script', attrs={"data-name": "query"}).text.split('=')[1]
  
          if cached_data:
              # Remove any trailing semicolons
              cached_data = cached_data.strip().rstrip(';')
              # Extract JSON data
              parsed_data = json.loads(cached_data)
  
              # TODO: Do what you wish with the parsed Next.js/React data here!
          else:
              print("Next.js/React data not found on the page.")
      else:
          # You may need to spoof some headers in your request to bypass anti-scraping measures
          print("Failed to retrieve the page.")
  
  except Exception as e:
      print("Error:", str(e))
        `
        break
      default:
        return
        break
    }
    copyToClipboard(snippet)
  }

  const exportToFile = () => {
    if (scrapedData.jsonString === '{}') return
    const blob = new Blob([scrapedData.jsonString], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.href = url
    a.download = `${scrapedData.stateType
      .toLowerCase()
      .replace('.', '')}_page_data_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <footer className="footer bg-base-200 p-2 flex-none">
      <div className="grid grid-cols-3 gap-3 w-full h-full">
        <button
          disabled={!pageEnabled}
          onClick={() => {
            if (jsonRef.current) copyToClipboard(jsonRef.current.textContent)
          }}
          className="btn btn-rounded btn-primary w-full"
        >
          <FontAwesomeIcon icon={faCopy} /> Copy
        </button>
        <button
          disabled={!pageEnabled}
          onClick={exportToFile}
          className="btn btn-rounded btn-secondary w-full"
        >
          <FontAwesomeIcon icon={faFileExport} /> Export
        </button>
        <div className="dropdown dropdown-top dropdown-hover w-full">
          <div role="button" disabled={!pageEnabled} className="btn btn-rounded btn-accent w-full">
            <FontAwesomeIcon icon={faCode} /> Snippets
          </div>
          {pageEnabled && (
            <ul className="shadow menu dropdown-content z-[1] bg-base-100 rounded-box">
              <li>
                <a onClick={() => copySnippet('javascript')}>JavaScript</a>
              </li>
              <li>
                <a onClick={() => copySnippet('python')}>Python</a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
