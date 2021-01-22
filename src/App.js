
import './App.css';
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import MenuItem from "@material-ui/core/MenuItem"
import { useEffect, useState } from 'react';
import InfoBox from "./InfoBox"
import Map from "./Map"
import Table from "./Table"
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph"
import "leaflet/dist/leaflet.css"
import numeral from "numeral";

function App() {
  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState('worldwide');
  const [countryInfo,setCountryInfo] = useState({})   
  const[tableData,setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
 useEffect(() =>{
    fetch( "https://disease.sh/v3/covid-19/all")
   .then(response => response.json())
   .then(data => {
     setCountryInfo(data)
   })
 }, [])

  useEffect(() =>{
     const getCountriesData = async ()=>{
       await fetch("https://disease.sh/v3/covid-19/countries")
       .then((response) => response.json())
       .then((data)=> {
         const countries = data.map((country) => (
           {
             name : country.country,
             value : country.countryInfo.iso2
           }));

           const sortedData = sortData(data)
           setTableData(sortedData);
           setMapCountries(data);
           setCountries(countries);
       });
      
     }
     getCountriesData();
  },[]);

   const onCountryChange =  async (event) =>{
    const countryCode = event.target.value;
    setCountry(countryCode)

    const url = countryCode=== "worldwide" ? "https://disease.sh/v3/covid-19/all" : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`;
   
    await fetch(url)

    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);

    })
    console.log(countryInfo)
    
   };
   
   
  return (
    <div className="app">
      <div className = 'app__left'>
      <div className = "app__header">
      <h1>Covid 19 Tracker</h1>
      <FormControl className = "app_dropdown">
         <Select variant = "outlined"
         onChange ={onCountryChange}
         value = {country} >

          <MenuItem value = "worldwide"> <h3>Worldwide</h3></MenuItem>
           {
             countries.map(country =>(
               <MenuItem value = {country.value}>{country.name}</MenuItem>
             ))
           }
           

           
         
         </Select>
      </FormControl>
      </div>
      
     <div className = "app__stats">
       <InfoBox 
       onClick={(e) => setCasesType("cases")}
       title = "Coronavirus Cases" 
       isRed
       cases = {prettyPrintStat(countryInfo.todayCases)} 
       total = {numeral(countryInfo.cases).format("0.0a")} />
       <InfoBox
       onClick={(e) => setCasesType("recovered")}
        title = "Recoverd"  
        cases = {prettyPrintStat(countryInfo.todayRecovered)} 
        total = {numeral(countryInfo.recovered).format("0.0a")} />
       <InfoBox title = "Deaths"
       isRed
        onClick={(e) => setCasesType("deaths")} 
        cases = {prettyPrintStat(countryInfo.todayDeaths)} 
       total = {numeral(countryInfo.deaths).format("0.0a")} />

     </div>
     <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
<Card className = "app_right">
      <CardContent>
        <h2>Live Cases by Country</h2>
        <Table countries ={tableData}/>
        <h2>Worldwide new Cases</h2>
        <LineGraph/>
      </CardContent>
</Card>
      
    </div>
  );
}

export default App;
