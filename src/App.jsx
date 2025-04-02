import { useEffect, useState } from "react";
import { StationApi } from "./API/OpenApi";
import icon from "./assets/find-icon.svg"
import gerb from "./assets/Gerb.png"

import "./App.css"

const App = () => {

  const [stations, setStations] = useState(null);
  const [stationInfo, setStationInfo] = useState(null);
  const [station2GetInfo, setStation2GetInfo] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);

  const [stationFrom, setStationFrom] = useState(null);
  const [stationTo, setStationTo] = useState(null);
  const [betweenStations, setBetweenStations] = useState(null);

  const stationsApi = new StationApi();

  const showInfoHandler = (stationCode) => {
    stationsApi.getSchedule(stationCode)
      .then((r) => { setStationInfo(r); setStation2GetInfo(stationCode) })
  }

  const findStationByCode = (stationCode) => {
    if (!stationCode) return null;
    return stations.find(station => station.codes.yandex_code === stationCode)
  }

  const fetchAndPrepareData = async () => {
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
          )
      });
      setStations(allStations);
    }
  }

  const applySearch2List = (stationsList) => stationsList.filter(elem => elem.title.toLowerCase().includes(searchString.toLowerCase()));

  const searchButtonHandler = () => {

    const codeFrom = stationFrom.split(" - ")[1];
    const codeTo = stationTo.split(" - ")[1];

    const api = new StationApi();
    api.between2Sations(codeFrom, codeTo)
      .then(r => {
        setBetweenStations(r ?? null);
      })
      .catch(e => { setBetweenStations(e.error.text) });
  }

  const changePageHandler = (koef) => {
    if ((selectedPage >= 1 && koef === 1)
      || (selectedPage <= Math.ceil(stations.length / 10) && koef === -1))
      setSelectedPage(selectedPage + koef);
  }

  useEffect(() => {
    fetchAndPrepareData();
  }, [])

  useEffect(() => {
    if (stations && stations.length > 0) {
      if (stationFrom === '' || stationTo === '') {
        setStationFrom(`${stations[0]?.title} - ${stations[0]?.codes.yandex_code}`)
        setStationTo(`${stations[1]?.title} - ${stations[1]?.codes.yandex_code}`)
      }
    }
  }, [stations])

  return <>
    <div className="main-body">
      <h2 className="main-title">Расписание электричек Самарской области <img src={gerb} width="40px" height="75px"/></h2>
      <div className="search-container">
        <div className="search-list-container">
          {stations && <>
            <div className="search">
              <input
                type="text"
                value={searchString}
                placeholder="Введите название для поиска"
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
                  <button className="show-info-button"  onClick={() => showInfoHandler(station.codes.yandex_code)} >
                    <img src={icon} alt="Поиск расписания" width="20px" height="20px" />
                  </button>
                </div>
              </>
            })}
          </div>
        </div>

        <div className="station-info-container">
          <h4 className="title">Расписание рейсов для станции:</h4>

          {station2GetInfo
            && findStationByCode(station2GetInfo)
            && <h4 className="title">{findStationByCode(station2GetInfo).title}</h4>}
          <div className="station-info">
            {stationInfo
              && !stationInfo.error
              && stationInfo.schedule
              && <>
                {stationInfo.schedule.map(schedule => {
                  return <>
                    <div className="station-info-item">
                      {schedule.days}<br />Поезд №{schedule.thread.number}<br />{schedule.thread.short_title}
                    </div>
                  </>
                })}
              </>}
          </div>
        </div>   
      </div>

      <div className="find-way-container">
        <h4 className="title">Маршруты между двумя станциями</h4>
        <div className="between-stations">
          <div className="between-stations-input">
            {stations
              && <>
                <label htmlFor="">Откуда:</label>
                <select value={stationFrom} onChange={(e) => { setBetweenStations(null); setStationFrom(e.target.value) }}>
                  {stations.map(station => {
                    return <>
                      <option value={`${station.title} - ${station.codes.yandex_code}`}>
                        {station.title} - {station.codes.yandex_code}
                      </option>
                    </>
                  })}
                </select>

                <label htmlFor="">Куда:</label>
                <select value={stationTo} onChange={(e) => { setBetweenStations(null); setStationTo(e.target.value) }}>
                  {stations.map(station => {
                    return <>
                      <option value={`${station.title} - ${station.codes.yandex_code}`}>
                        {station.title} - {station.codes.yandex_code}
                      </option>
                    </>
                  })}
                </select>
                <button onClick={searchButtonHandler}>Поиск</button>
              </>}
          </div>


          <div className="between-stations-result">
            {betweenStations
              && betweenStations.segments
              && betweenStations.segments.length > 0
              && <>
                  {betweenStations.segments.map(segment => {
                    return <div className="between-result-item">
                      {segment.days}<br />
                      Поезд №{segment.thread.number}<br />
                      {segment.thread.short_title}<br />
                      Время в пути {Number.parseInt(segment.duration) / 60} мин.
                    </div>
                  })}
              </>}
            </div>
      
        </div>
      </div>       
    </div>
  </>
    
}

export default App;
