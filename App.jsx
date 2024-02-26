import { ParkingArea } from './components/ParkingArea';
import './App.css';
import { useEffect, useState } from 'react';

const App = () => {

  const [ areas, setAreas ] = useState([
    {
      name: 'Area 1',
      spots: [
        { id: 1, status: 'Disponible' },
        { id: 2, status: 'Disponible' },
        { id: 3, status: 'Disponible' },
        { id: 4, status: 'Disponible' },
        { id: 5, status: 'Disponible' },
        { id: 6, status: 'Disponible' },
        { id: 7, status: 'Disponible' },
        { id: 8, status: 'Disponible' },
        { id: 9, status: 'Disponible' },
        { id: 10, status: 'Disponible' },
        { id: 11, status: 'Disponible' },
        { id: 12, status: 'Disponible' },
        { id: 13, status: 'Disponible' },
        { id: 14, status: 'Disponible' },
        { id: 15, status: 'Disponible' },
        { id: 16, status: 'Disponible' },
      ],
    },
  ]);

  const [selectedSpot, setSelectedSpot] = useState(null);

  const [detectionMinimumDistance, setDetectionMinimumDistance] = useState(200);

  const [showConfig, setShowConfig] = useState(false);

  const [reportsNumber, setReportsNumber] = useState(20);

  const [refreshInterval, setRefreshInterval] = useState(10000);

  // const [autoRefresh, setAutoRefresh] = useState(false);

  const updateSpotStatus = (areaIndex, spotIndex, status) => {
    setAreas(prevAreas => {
      const newAreas = [...prevAreas];
      const updatedSpot = { ...newAreas[areaIndex].spots[spotIndex] };
  
      updatedSpot.status = status;

      newAreas[areaIndex].spots[spotIndex] = updatedSpot;
      return newAreas;
    });
  };

  const updateSpotStatusOnReport = (areaIndex, spotIndex, status) => {
    const currentStatus = areas[areaIndex].spots[spotIndex].status;
    if (status === 'NoDisponible') {
      updateSpotStatus(areaIndex, spotIndex, status);
      if (currentStatus === 'Reservado') {
        setSelectedSpot(null);
      }
    }
    if (status === 'Disponible' && currentStatus === 'NoDisponible') {
      updateSpotStatus(areaIndex, spotIndex, status);
    }
  }

  const toggleReserveSpot = (areaIndex, spotIndex) => {
    const spot = areas[areaIndex].spots[spotIndex];
    if (spot.status === 'Reservado') {
      setSelectedSpot(null);
      updateSpotStatus(areaIndex, spotIndex, 'Disponible');
    } else if (spot.status === 'Disponible') {
      if (selectedSpot !== null) {
        toggleReserveSpot(selectedSpot.areaIndex, selectedSpot.spotIndex)
        setSelectedSpot(null);
      }
      setSelectedSpot({ areaIndex, spotIndex });
      updateSpotStatus(areaIndex, spotIndex, 'Reservado');
    }
  }

  const analyzeReports = (reports) => {
    let processDistanceLeft = 0;
    let leftCont = 0;
    let processDistanceRight = 0;
    let rightCont = 0;
    reports.forEach((report) => {
      if (report.angulo > 90) {
        processDistanceLeft += report.distancia;
        leftCont++;
      } else {
        processDistanceRight += report.distancia;
        rightCont++;
      }
    });
    const averageLeft = processDistanceLeft / leftCont;
    const averageRight = processDistanceRight / rightCont;
    console.log('averageLeft', averageLeft);
    console.log('averageRight', averageRight);

    console.log('detectionMinimumDistance', detectionMinimumDistance)
    console.log('averageLeft < detectionMinimumDistance', averageLeft < detectionMinimumDistance);
    console.log('averageRight < detectionMinimumDistance', averageRight < detectionMinimumDistance);

    updateSpotStatusOnReport(0, 0, averageLeft < detectionMinimumDistance ? 'NoDisponible' : 'Disponible');
    updateSpotStatusOnReport(0, 1, averageRight < detectionMinimumDistance ? 'NoDisponible' : 'Disponible');
  }

  const getReports = (number) => {
    // fetch(`https://esparking.onrender.com/reportes/${number}`).then(response => response.json())
    fetch(`http://192.168.18.5:3000/reportes/${number}`).then(response => response.json())
      .then(data => {
        console.log(data);
        analyzeReports(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    let interval = setInterval(() => {
      getReports(reportsNumber);
    }, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [reportsNumber, refreshInterval, detectionMinimumDistance]);

  return (
    <div style={{ display: 'flex', flexDirection:'column' , justifyItems: 'center' }}>
      <h1>ESParking</h1>
      {areas.map((area, index) => (
        <ParkingArea key={index} areaName={area.name} spots={area.spots} toggleReservedSpot = {(spotIndex) => {toggleReserveSpot(index, spotIndex)} } />
      ))}
      <button onClick={() => setShowConfig(!showConfig)}>Config</button>
      <div className='config-menu' style={ showConfig ? {display:'flex'} : {display:'none'} }>
        <button onClick={() => {getReports(reportsNumber)}}>Refresh</button>
        {/* <div style={{ display:'flex', gap:'10px' }}>
          <input style={{ transform: 'scale(2)' }} type="checkbox" id="autoRefresh" name="autoRefresh" value={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          <label htmlFor="autoRefresh"> Auto Refresh:</label>
        </div> */}

        <label style={{ fontSize: '40px' }} htmlFor="detectionMinimumDistance">Distancia Mínima de Detección: {detectionMinimumDistance}</label>
        <input style={{ width:'630px' }} type="range" id="detectionMinimumDistance" name="detectionMinimumDistance" min="0" max="350" value={detectionMinimumDistance} onChange={(e) => setDetectionMinimumDistance(e.target.value)} />

        <label style={{ fontSize: '40px' }} htmlFor="reportsNumber">Cantidad de Reportes: {reportsNumber}</label>
        <input style={{ width:'630px' }} type="range" id="reportsNumber" name="reportsNumber" min="0" max="100" value={reportsNumber} onChange={(e) => setReportsNumber(e.target.value)} />

        <label style={{ fontSize: '40px' }} htmlFor="refreshInterval">Intervalo de Refresco: {refreshInterval/1000}s</label>
        <input style={{ width:'630px' }} type="range" id="refreshInterval" name="refreshInterval" min="0" max="20000" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} />

        <button onClick={() => setShowConfig(!showConfig)}>Close</button>
      </div>
    </div>
  );
};

export default App;
