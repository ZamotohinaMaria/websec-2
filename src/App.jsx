import { useEffect, useState } from "react";
import { StationApi } from "./API/OpenApi";

import "./App.css"

const App = () => {

  const [stations, setStations] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);

  const stationsApi = new StationApi();

  const getAllData = async () => {
    const res = await stationsApi.getAllStations();
    if (res && res.countries) {
      const ruRegions = res.countries.find((elem) => elem.title === 'Россия').regions;

      const allStations = ruRegions.reduce((acc, currItem) => {
        return [
          ...acc,
          ...currItem.settlements.reduce((acc, currItem) => {
            return [
              ...acc,
              ...currItem.stations
            ]
          }, [])
        ]
      }, []).filter((item) => {
        return item.transport_type === "train"
          && item.codes.esr_code
          && (
            (item.codes.esr_code).startsWith('63')
            || (item.codes.esr_code).startsWith('64')
            || (item.codes.esr_code).startsWith('65')
          )
      });
      setStations(allStations);
    }
  }

  const applySearch2List = (stationsList) => stationsList.filter(elem => elem.title.toLowerCase().includes(searchString.toLowerCase()));


  const changePageHandler = (koef) => {
    if ((selectedPage >= 1 && koef === 1)
      || (selectedPage <= Math.ceil(stations.length / 10) && koef === -1))
      setSelectedPage(selectedPage + koef);
  }

  useEffect(() => {
    getAllData();
  }, [])


  return <>

    {stations && <>
      <div className="search">
        <input
          type="text"
          value={searchString}
          placeholder="Введите название станции"
          onChange={(e) => setSearchString(e.target.value)} />
      </div>
    </>}

    {stations && <>
      <div className="pagination">
        <button disabled={selectedPage === 1} onClick={() => changePageHandler(-1)}>{"<"}</button>
        <p>{selectedPage} из {Math.ceil(stations.length / 10)}</p>
        <button disabled={selectedPage === Math.ceil(stations.length / 10)} onClick={() => changePageHandler(1)}>{">"}</button>
      </div>
    </>}

    <div className="stations-container">
      {stations && applySearch2List(stations).slice(10 * selectedPage, 10 * (selectedPage + 1)).map(station => {
        return <>
          <div className="station-item">
            <div className="left-content">
              {station.title}<br /> <i>{station.codes.yandex_code}</i>
            </div>
            {/* <button className="show-info-button" onClick={() => showInfoHandler(station.codes.yandex_code)} /> */}
          </div>
        </>
      })}
    </div>
  </>;
}

export default App;
