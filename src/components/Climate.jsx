import React from 'react';
import axios from 'axios';

import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, LineMarkSeries, MarkSeries, VerticalBarSeries, LineSeries, AreaSeries, Hint, GradientDefs, HeatmapSeries, LabelSeries, Crosshair, ContinuousColorLegend } from 'react-vis';
import '../../node_modules/react-vis/dist/style.css';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';


import { interpolateYlGnBu, interpolateRdBu } from 'd3-scale-chromatic';

import { MapContainer, TileLayer, Tooltip, CircleMarker, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

import getCountryISO2 from 'country-iso-3-to-2';
import ReactCountryFlag from 'react-country-flag';

import { Icon } from '@mdi/react';
import { mdiThermometer, mdiWeatherPouring, mdiArrowUpThick, mdiArrowDownThick, mdiMinusThick, mdiCalendarRange, mdiArrowRight, mdiMapMarker, mdiChartTimelineVariantShimmer, mdiHomeAccount, mdiAlertDecagram } from '@mdi/js';

import { MultiSelect } from 'react-multi-select-component';

import { BeatLoader } from 'react-spinners';

import { Animation } from 'react-web-animation';

import milestones from 'd3-milestones';

import '../../node_modules/d3-milestones/build/d3-milestones.css';

import * as cities from '../data/places.json';

import ReactHtmlParser from 'react-html-parser';

import { countriesData } from '../data/africa.js';



export class Climate extends React.Component {


    constructor(){
        super();
        this.state = {
            datasets: [
                {
                    label: 'Berkeley Max',
                    value: 'max',
                    climatology: '45a41685-5be5-4da1-ac97-1c9bb74eacf1',
                    temperature: 'c13119ab-750a-4c18-a146-8e9a477088fc',
                    data: [],
                },
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                    climatology: 'bae363f7-1318-43d8-9d96-dc4aac27fc7b',
                    temperature: '66da171e-be57-4f16-aee2-0d86a6b69dd5',
                    data: [],
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                    climatology: '1aba7d74-20a5-4d95-9d09-795fa0f6bf41',
                    temperature: '036d381a-911d-4f6a-8964-920646bbe557',
                    data: [],
                },
                {
                    label: 'GPCC Precipitation',
                    value: 'precip',
                    precipitation: '40034efe-ffa7-4094-9c33-991e2b5f6ce0',
                    data: [],
                },
                {
                    label: 'GPCC Precipitation Average',
                    value: 'precip_avg',
                    precipitation: '3111fb54-12d5-4d45-9538-d58337ba7384',
                    data: [],
                },
                {
                    label: 'EM-DAT Disasters',
                    value: 'disasters',
                    disasters: 'fbee2045-ac71-472b-bc29-2a7cb7e37880',
                    data: [],
                },
                
            ],
            selected_datasets: [
                {
                    label: 'Berkeley Avg',
                    value: 'avg',
                },
                {
                    label: 'Berkeley Max',
                    value: 'max',
                },
                {
                    label: 'Berkeley Min',
                    value: 'min',
                },
                
            ],
            temp_chart_options: [
                {
                    label: 'Min Max Range',
                    value: 'temp_range'
                },
                {
                    label: 'Average',
                    value: 'calculated_temp_avg'
                },
                {
                    label: 'Max',
                    value: 'calculated_temp_max'
                },
                {
                    label: 'Min',
                    value: 'calculated_temp_min'
                },
                {
                    label: 'Average Climatology',
                    value: 'climatology_avg'
                },
                {
                    label: 'Max Climatology',
                    value: 'climatology_max'
                },
                {
                    label: 'Min Climatology',
                    value: 'climatology_min'
                }
                
            ],
            temp_chart_selected: [
                {
                    label: 'Min Max Range',
                    value: 'temp_range'
                },
                {
                    label: 'Average',
                    value: 'calculated_temp_avg'
                }
            ],
            position_details: {},
            data: [],
            precip_data: [],
            climatology_data: [],
            disasters_data: [],
            date_range: [2012, 2022],
            lat: 30.0444196,
            lon: 31.2357116,
            rounded_lat: null,
            rounded_lon: null,
            loading: true,
            center: [-6.559482, 22.937506],
            modal: false,
            options: {},
            hint_value: null,
            temp_bar_hint_value: null,
            hint_value_precip: null,
            hint_value_disaster: null,
            temp_table_metric: 'avg',
            temp_table_year: 2022,
            precip_table_year: 2022,
            update_precip_chart: 1,
        }
        this.dateRangeStartRef = React.createRef();
        this.dateRangeEndRef = React.createRef();
        this.tempTableYear = React.createRef();
        this.precipTableYear = React.createRef();
        this.tempChart = React.createRef();
        this.anomalyChart = React.createRef();
        this.precipChart = React.createRef();
        this.disasterChart = React.createRef();
    }
    

    componentDidMount() {

        let self = this;

        let searchTerms = window.location.search.split('&');

        let daterangesearch = searchTerms.filter(term => term.includes('daterange='))[0];

        if(window.location.search.includes('daterange=')) {

            let date_range = daterangesearch.split('=')[1];

            if(date_range.includes(',')) {
                let start = parseInt(date_range.split(',')[0]);
                let end = parseInt(date_range.split(',')[1]);
                self.setState({
                    date_range: [start, end],
                    temp_table_year: end,
                    precip_table_year: end,
                });
            }

        }

        if(window.location.search.includes('position=')) {

            let positionsearch = searchTerms.filter(term => term.includes('position='))[0];

            let position = positionsearch.split('=')[1];

            if(position.includes(',')) {
                let lat = parseFloat(position.split(',')[0]);
                let lon = parseFloat(position.split(',')[1]);
                self.setState({lat: lat, lon: lon}, () => 
                {
                    self.getData();
                    self.getPrecipData();
                    setTimeout(() => {
                        self.getDisasters();
                    }, 3000);
                })
            }

        } else if(window.location.search.includes('city=')) {

            
            let citysearch = searchTerms.filter(term => term.includes('city='))[0];

            let city = citysearch.split('=')[1];
            city = city.replace('?city=', '').replace('-',' ');

            let city_data = cities.find(c => c.city.toLowerCase() === city.toLowerCase());

            if(city_data) {

                let positions_details = {
                    place: city_data.city,
                    country: city_data.country,
                    iso_code: city_data.iso_code,
                }

                self.setState({lat: city_data.lat, lon: city_data.lon, position_details: positions_details}, () => 
                {
                    self.getData();
                    self.getPrecipData();
                    setTimeout(() => {
                        self.getDisasters();
                    }, 3000);
                })
            }
            
        }

        setTimeout(() => {
            self.dateRangeStartRef.current.value = self.state.date_range[0];
            self.dateRangeEndRef.current.value = self.state.date_range[1];
            self.tempTableYear.current.value = self.state.temp_table_year;
            self.precipTableYear.current.value = self.state.precip_table_year;
        }, 1000);
        
    }
   

    // selectDatasets = (selected_datasets) => {
    //     this.setState({selected_datasets: selected_datasets}, () => {
    //         this.getData();
    //     })
    // }


    selectTempChartOptions = (temp_chart_selected) => {
        this.setState({temp_chart_selected: temp_chart_selected}, () => {
            // this.getData();
        })
    }


    getMonthName = (month) => {
        let month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return month_names[month];
    }

    getPositionDetails = (type) => {
    
        let self = this;

        if(type == 'country_code') {
            if(self.state.position_details.place) {
                return getCountryISO2(self.state.position_details.iso_code);
            } else {
                return self.props.positionDetails.country_code;
            }
        }

        if(type) {
            if(self.state.position_details.place) {
                return self.state.position_details[type];
            } else {
                return self.props.positionDetails[type];
            }


        } else {

            if(self.state.position_details.place) {
                return self.state.position_details.place + ', ' + self.state.position_details.country;
            } else {
                return self.props.positionDetails.county + ', ' + self.props.positionDetails.country;
            }
        }
    
    }


    getData = () => {

        let self = this;

        self.setState({data: [], loading: true}, () => {

            let data = [];

            let finalData = [];

            let promises = [];

            self.state.selected_datasets.forEach((dataset) => {
                if(dataset.value == 'max' || dataset.value == 'avg' || dataset.value == 'min') {
                    promises.push(self.getBerkeleyData(dataset));
                }
            })

            Promise.all(promises).then((results) => {

                results.forEach((result) => {
                    data = data.concat(result);
                })

                data.forEach((entry) => {
                    let existing_entry = finalData.find((e) => e.latitude == entry.latitude && e.longitude == entry.longitude && e.date == entry.date);
                    if(existing_entry) {
                        Object.assign(existing_entry, entry);
                    } else {
                        finalData.push(entry);
                    }
                
                })

                finalData = finalData.filter((entry) => entry.x && entry.y && entry.y0);

                let avgData = [];

                finalData.forEach((entry) => {
                    avgData.push(Object.assign({}, entry));
                })

                avgData.forEach((entry) => {
                    entry.y = entry.calculated_temp_avg;
                })

                let climatologyData = [];
                
                climatologyData = finalData;

                let temp_bar_data = [];

                finalData.forEach((entry) => {
                    temp_bar_data.push(Object.assign({}, entry));
                })

                temp_bar_data.forEach((entry) => {
                    delete entry.y0;
                    entry.y = entry.temperature;
                })

                self.setState(
                    {
                        temp_line_data: avgData,
                        temp_bar_data: temp_bar_data,
                        data: finalData,
                        climatology_data: climatologyData,
                        rounded_lat: data[0].latitude,
                        rounded_lon: data[0].longitude,
                        loading: false
                    }, () => {

 
                })

            })
        
        })
        
    
    }

    getPrecipData = () => {
        let self= this;

        self.getGPCCDataAvg(self.state.datasets.find(dataset => dataset.value == 'precip_avg')).then((data) => {
            
            let precip_data_avg = data;

            self.getGPCCData(self.state.datasets.find(dataset => dataset.value == 'precip')).then((data) => {

                let precip_data = data;
    
                let min = 0;
                let max = 10;
    
                precip_data.forEach((entry) => {
                    entry.precip_scale = (entry.precip - min) / (max - min);
                    entry.month_avg = parseFloat(precip_data_avg.find((e) => e.month_number == entry.month_number).precip);
                })
    
    
                self.setState({precip_data: precip_data})
    
            })

        })
        
    }


    getGPCCData = (dataset) => {

        let self = this;

        return new Promise(function(resolve, reject) {

            let current_dataset = self.state.datasets.find((d) => d.value == dataset.value);

            let current_precipitation_dataset = current_dataset.precipitation;

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_precipitation_dataset + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.lon + 0.5) + '%20AND%20time%3E%3D' + self.state.date_range[0] + '%20AND%20time%3C%3D' + self.state.date_range[1] + '%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {

                response.data.result.records.forEach((record) => {
                    record.date = record.month_number + '/' + record.time;
                    record.precip = Math.round(record.precip * 100) / 100;
                })

                let datasets = self.state.datasets;

                datasets[datasets.indexOf(current_dataset)].data = response.data.result.records;

                self.setState({datasets: datasets}, () => {
                    resolve(response.data.result.records);
                })

            })
        })
    }


    getGPCCDataAvg = (dataset) => {

        let self = this;

        return new Promise(function(resolve, reject) {

            let current_dataset = self.state.datasets.find((d) => d.value == dataset.value);

            let current_precipitation_dataset = current_dataset.precipitation;

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_precipitation_dataset + '"%20WHERE%20latitude%20%3E%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%20' + (self.state.lon + 0.5) + '%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {
                resolve(response.data.result.records);
            })
        
        })
    
    }

    getDisasters = () => {

        let self = this;

        let disasters_dataset = self.state.datasets.find((d) => d.value == 'disasters').disasters;

        axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + disasters_dataset + '"%20WHERE%20"ISO"%20LIKE%20%27' + self.state.position_details.iso_code + '%27',
            { headers: {
                "Authorization": process.env.CKAN
            }
        }).then(function(response) {



            let disasters = response.data.result.records;

            let disasters_colors = [
                {name: 'Biological', color: '#d7191c'},
                {name: 'Hydrological', color: '#2c7bb6'},
                {name: 'Geophysical', color: '#fdae61'},
                {name: 'Climatological', color: '#abd9e9'},
                {name: 'Meteorological', color: '#312e81'}
            ]
            

            disasters.forEach((disaster) => {

                disaster.date = disaster['Start Month'] + '/' + disaster['Start Year'];
                // find the index of self.state.data where the date is equal to the disaster date
                let index = self.state.data.findIndex((d) => d.date == disaster.date);

                if(index != -1) {
                    disaster.x = index;
                    disaster.y = 0;
                    disaster.year = parseInt(disaster.Year);
                    disaster.color = disasters_colors.find((d) => d.name == disaster['Disaster Subgroup']).color;
                    disaster.title = disaster['Disaster Type'];
                }
            })

            disasters.forEach((disaster) => {

                let count = disasters.filter((d) => d.date == disaster.date).length;

                let disaster_index = disasters.filter((d) => d.date == disaster.date).findIndex((d) => d == disaster);

                disaster.y = disaster_index > 0 ? disaster_index + 1 : disaster_index;

                
            })

            disasters = disasters.filter((d) => d.x != undefined);

            self.setState({disasters_data: disasters}, () => {

                
            })
        })
    }


    dateRange = () => {
        let self = this;
    
        let dates = [];
        let currentDate = self.state.date_range[0];
        let endDate = self.state.date_range[1];
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = currentDate + 1;
        }

        return dates;
    }

    changeDateRange = () => {
    
        let self = this;
    
        let startref = self.dateRangeStartRef;
        let endref = self.dateRangeEndRef;

        if(startref.current != null && endref.current != null) {

            if(parseInt(startref.current.value) > parseInt(endref.current.value)) {
                startref.current.value = endref.current.value;
            }

            // set the daterange in the window.location.search
            let searchParams = new URLSearchParams(window.location.search);
            searchParams.set('daterange', startref.current.value + ',' + endref.current.value);
            window.history.replaceState({}, '', window.location.pathname + '?' + searchParams.toString().replace('%2C',','));


            self.setState({date_range: [parseInt(startref.current.value), parseInt(endref.current.value)]}, () => {
                self.getData();
                self.getPrecipData();
            })

        }
    
    }


    getBerkeleyData = (dataset) => {

        let self = this;

        return new Promise(function(resolve, reject) {

            let current_dataset = self.state.datasets.find((d) => d.value == dataset.value);

            let current_climatology_dataset = current_dataset.climatology;

            

            axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_climatology_dataset + '"%20WHERE%20latitude%20%3E%3D%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%3D%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%3D%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%3D%20' + (self.state.lon + 0.5) + '%20',
                { headers: {
                    "Authorization": process.env.CKAN
                }
            }).then(function(response) {

                let datasets = self.state.datasets;

                datasets[datasets.indexOf(current_dataset)].data = response.data.result.records;
            
                self.setState({
                    datasets: datasets
                }, () => {

                    let current_temperature_dataset = current_dataset.temperature;

                    axios.get('https://ckandev.africadatahub.org/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20"' + current_temperature_dataset + '"%20WHERE%20latitude%20%3E%3D%20' + (self.state.lat - 0.5) + '%20AND%20latitude%20%3C%3D%20' + (self.state.lat + 0.5) + '%20AND%20longitude%20%3E%3D%20' + (self.state.lon - 0.5) + '%20AND%20longitude%20%3C%3D%20' + (self.state.lon + 0.5) + '%20AND%20time%3E%3D' + self.state.date_range[0] + '%20AND%20time%3C%3D' + (self.state.date_range[1] + 1) + '%20',
                        { headers: {
                            "Authorization": process.env.CKAN
                        }
                    }).then(function(response) {

                        let this_data = response.data.result.records;

                        this_data.forEach((record,index) => {

                            // sort records by time
                            this_data.sort((a, b) => {
                                return a.time - b.time;
                            })

                            // split date at first .
                            let date = record.time.split('.');
                            if(date[1] == '0416666666663') {
                                date[1] = 0;
                            } else if(date[1] == '125') {
                                date[1] = 1;
                            } else if(date[1] == '2083333333333') {
                                date[1] = 2;
                            } else if(date[1] == '2916666666663') {
                                date[1] = 3;
                            } else if(date[1] == '375') {
                                date[1] = 4;
                            } else if(date[1] == '4583333333333') {
                                date[1] = 5;
                            } else if(date[1] == '5416666666663') {
                                date[1] = 6;
                            } else if(date[1] == '625') {
                                date[1] = 7;
                            } else if(date[1] == '7083333333333') {
                                date[1] = 8;
                            } else if(date[1] == '7916666666663') {
                                date[1] = 9;
                            } else if(date[1] == '875') {
                                date[1] = 10;
                            } else if(date[1] == '9583333333333') {
                                date[1] = 11;
                            }

                            record.date = (date[1] + 1) + '/' + date[0];
                            record.month_number = date[1];

                            let climatology = datasets[datasets.indexOf(current_dataset)].data.filter((clim) => {
                                return clim.month_number == record.month_number;
                            })

                            record['climatology_' + dataset.value] = Math.round(climatology[0].climatology * 100) / 100;

                            record['temperature_' + dataset.value] = Math.round(record.temperature * 100) / 100;

                            record['calculated_temp_' + dataset.value] = parseFloat(record['climatology_' + dataset.value]) + parseFloat(record.temperature);

                            record['calculated_temp_' + dataset.value] = Math.round(record['calculated_temp_' + dataset.value] * 100) / 100;
                        
                            if(dataset.value == 'max') {
                                record.y = record['calculated_temp_' + dataset.value];
                            } else if(dataset.value == 'min') {
                                record.y0 = record['calculated_temp_' + dataset.value];
                            }

                            record.x = index
                            

                        })

                        datasets = self.state.datasets;

                        datasets[datasets.indexOf(current_dataset)].data = this_data;

                        
                        resolve(this_data);
                    
                    })
                
                })

            })

        })

    }

    getKeyFrames = () => {
        return [
            { transform: 'translateY(-10%)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
        ];
    };

    getTiming = (delay, duration) => {
        return {
            duration,
            delay,
            iterations: 1,
            direction: 'alternate',
            easing: 'ease-in-out',
            fill: 'forwards'
        };
    };

    getTooltip = (hint) => {
        
        let self = this;

        let fields = ['Disaster Subgroup', 'Disaster Type', 'Disaster Subtype', 'Location', 'Total Affected', 'Total Deaths', 'Origin'];

        let hint_text = '<div>';
        
        fields.forEach((field) => {
            if(hint[field] != '' && hint[field] != undefined && hint[field] != null) {
                hint_text += '<div class="row mb-1" style="width: 400px"><div class="col-4">' + field + ':</div><div class="col">' + hint[field] + '</div></div>';
            }
        })

        hint_text += '</div>';

        return hint_text;


    }

    chartDownload = (chartRef) => {

        let self = this;
        let chart = self[chartRef];

        html2canvas(chart.current, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            let filename = chartRef == 'tempChart' ? 'temperature' : chartRef == 'precipChart' ? 'precipitation' : 'disaster';
            link.download = filename + '-' + self.state.date_range[0] + '-' + self.state.date_range[1] + '.png'; 
            link.href = canvas.toDataURL();
            link.click();
        });
    }
    

    dataDownload = (chartRef) => {

        let self = this;

        let chart = self[chartRef];
        console.log(chart);
    
    }
    
   

        

    render() {
        return (<>

            <Row className="mt-4">
                <Col md={5}>
                    
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="p-4">
                                <Row>
                                    <Col>
                                        <p className="fs-4 mb-0"><strong className="text-adh-orange">The Africa Data Hub Climate Observer</strong> is designed to help journalists and academics reporting and researching climate change in <span className="text-adh-orange text-nowrap"><ReactCountryFlag style={{position: 'relative', top: '-1px'}} countryCode={this.getPositionDetails('country_code')} svg /> {this.getPositionDetails('country')}</span> and Africa.</p>
                                    </Col>
                                </Row>
                                
                                <Row className="mt-4">
                                    <Col xs="auto">
                                    { (this.state.rounded_lat != null && this.state.rounded_lon != null) &&
                                        <MapContainer
                                            
                                            center={[this.state.rounded_lat, this.state.rounded_lon]}
                                            zoom={7}
                                            scrollWheelZoom={false}
                                            zoomControl={false}
                                            attributionControl={false}
                                            doubleClickZoom={false}
                                            touchZoom={false}
                                            style={{background: '#fff', width: '150px', height: '150px', border: '3px solid #c2b59b'}}
                                            dragging={false}>
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <Rectangle bounds={[
                                                    [parseFloat(this.state.rounded_lat) - 0.5, parseFloat(this.state.rounded_lon) - 0.5],
                                                    [parseFloat(this.state.rounded_lat) + 0.5, parseFloat(this.state.rounded_lon) + 0.5],
                                                ]} pathOptions={{color: '#ff6f47',fillColor: '#ff6f47'}}/>
                                            </MapContainer>
                                    }
                                            
                                    </Col>
                                    <Col>
                                        { (this.state.rounded_lat != null && this.state.rounded_lon != null) &&
                                        <>
                                            <p>Location data is mapped to grid squares which measure <strong>1x1 degree latitude and longitude</strong> and all positions are rounded to the nearest 1x1 square.</p>
                                            <p>Current location is in the 1x1 degree square with a center point at <strong>{parseFloat(this.state.rounded_lon)}° and {parseFloat(this.state.rounded_lat)}°</strong></p>
                                        </>
                                        }
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    
                </Col>
                <Col>
                    
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="p-4">
                                <Row>
                                    <Col>
                                        <p className="fs-5">The Climate Observer uses temperature data from <a className="text-adh-orange text-decoration-none" href="https://berkeleyearth.org/data/" target="_blank">Berkeley Earth</a> and precitiptation date 
                                        from the <a className="text-adh-orange text-decoration-none" href="https://www.dwd.de/EN/ourservices/gpcc/gpcc.html" target="_blank">Precipitation Climatology Centre</a>. It is based on both observations made (eg. weather stations) and modelled data based on observations (for areas where there are no monitoring stations).
                                        </p>
                                        <p>All temperature data shown is taken from <a className="text-adh-orange text-decoration-none" href="https://berkeleyearth.org/data/" target="_blank">Berkeley Earth</a>, and precipitation (rainfall) data from the <a className="text-adh-orange text-decoration-none" href="https://www.dwd.de/EN/ourservices/gpcc/gpcc.html" target="_blank">Precipitation Climatology Centre</a>.</p>

                                        <p>When using this data, it is important to note and communicate to readers that not all data points are direct measurements from weather stations. For information on Berkeley Earth's methodology for producing broad geographic data from weather station observations, <a className="text-adh-orange text-decoration-none" href="https://berkeleyearth.org/methodology/" target="_blank"> see here</a>.
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiCalendarRange} size={2} />
                                </Col>
                                <Col xs={10} md>
                                    <h5 style={{marginTop: '0.6em'}}>Choose a date range to study the climate data for that period</h5>
                                </Col>
                                <Col xs={5} md="auto">
                                    <Form.Select size="lg" className="bg-control-grey" ref={this.dateRangeStartRef} onChange={() => this.changeDateRange()}>
                                        {
                                            Array.from({length: 30}, (_, i) => 1993 + i).map((year) => {
                                                return <option key={year} value={year}>{year}</option>
                                            })
                                        }
                                    </Form.Select>
                                </Col>
                                <Col xs="auto">
                                    <Icon path={mdiArrowRight} size={1} style={{marginTop: '0.8em'}}/>
                                </Col>
                                <Col xs={5} md="auto">
                                    <Form.Select size="lg" className="bg-control-grey" ref={this.dateRangeEndRef} onChange={() => this.changeDateRange()}>
                                        {
                                            Array.from({length: 30}, (_, i) => 1993 + i).map((year) => {
                                                return <option key={year} value={year}>{year}</option>
                                            })
                                        }
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>                            
                </Col>
            </Row>
           

            
            
            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiThermometer} size={2} />
                                </Col>
                                <Col>
                                    <h5>Monthly Temperature for <span className="text-adh-orange">{ this.getPositionDetails() }</span> from {this.state.date_range[0]} to {this.state.date_range[1]}</h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This chart shows the minimum, maximum and average temperatures per month from from {this.state.date_range[0]} to {this.state.date_range[1]}. Use the dropdown to show or hide different metrics. Dotted climatology lines show the average monthly temperature for the period 1950-1980.</p>
                                </Col>
                                <Col md={3}>

                                    <MultiSelect
                                        options={this.state.temp_chart_options}
                                        value={this.state.temp_chart_selected}
                                        onChange={this.selectTempChartOptions}
                                        ClearSelectedIcon={null}
                                        disableSearch={true}
                                        labelledBy="Select"
                                    />
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body id="chartContainer">

                            {this.state.loading ? <Row><Col className="text-center"><BeatLoader/></Col></Row> :
                                
                                <div  ref={this.tempChart}>
                                
                                    <XYPlot width={document.getElementById('chartContainer').getBoundingClientRect().width - 20} height={300} onMouseLeave={() => this.setState({hint_value: null})}>
                                    <GradientDefs>
                                            <linearGradient id="CoolGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#fee2e2" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#e0f2fe" stopOpacity={1} />
                                            </linearGradient>
                                        </GradientDefs>
                                        <VerticalGridLines />
                                        <HorizontalGridLines />
                                        <XAxis tickFormat={v => this.state.data[v] != undefined ? this.state.data[v].date : v} />
                                        <YAxis tickFormat={v => v + '°C'} />

                                        {
                                        this.state.temp_chart_selected.some(item => item.value === 'temp_range') &&
                                            <AreaSeries
                                            className="area-elevated-series-1"
                                            color={'url(#CoolGradient)'}
                                            data={this.state.data}
                                            onNearestX={(value) => this.setState({hint_value: value})}
                                            />
                                        }

                                        
                                        {
                                        this.state.temp_chart_selected.map((selected_dataset,index) => 
                                            <LineSeries
                                            className="area-elevated-line-series"
                                            data={ this.state.data.map(item => { return { x: item.x, y: item[selected_dataset.value] } }) }
                                            color={ 
                                                selected_dataset.value == 'calculated_temp_max' ? '#ef4444' :
                                                selected_dataset.value == 'calculated_temp_min' ? '#93c5fd' :
                                                selected_dataset.value == 'calculated_temp_avg' ? '#094151' :
                                                selected_dataset.value == 'climatology_max' ? '#fca5a5' :
                                                selected_dataset.value == 'climatology_min' ? '#a0c4fd' :
                                                selected_dataset.value == 'climatology_avg' ? '#155e75' : '#000000'
                                            }
                                            strokeStyle={selected_dataset.value.includes('climatology') ? 'dashed' : 'solid'}
                                            strokeWidth={selected_dataset.value.includes('climatology') ? 1 : 2}
                                            />
                                        )}

                                    
                                        <Crosshair values={[this.state.hint_value]}>
                                            <div></div>
                                        </Crosshair>
                                        
                                        { this.state.hint_value && (
                                            <Hint value={this.state.hint_value} style={{marginLeft: '1em', marginRight: '1em'}}>
                                                <div className="hintBox">
                                                    <h6>{this.state.hint_value.date}</h6>
                                                    {
                                                        this.state.temp_chart_selected.filter(selected_dataset => selected_dataset.value != 'temp_range').map((selected_dataset,index) =>
                                                            <>
                                                                <strong>{selected_dataset.label}</strong>: {this.state.hint_value[selected_dataset.value]}°C<br/>
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        this.state.disasters_data.filter(disaster => disaster.x == this.state.hint_value.x).map((disaster,index) =>
                                                            <>
                                                                <strong>{disaster['Disaster Type']}</strong>: {disaster['Event Name']}<br/>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </Hint>
                                        )}
                                        
                                    </XYPlot>
                                </div>
                                
                            }
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col></Col>
                                <Col xs="auto" className="py-2">
                                    { this.state.loading ? '' :
                                        <Dropdown className="mt-1">
                                            <Dropdown.Toggle variant="control-grey">Download</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => this.chartDownload('tempChart')}>Chart (PNG)</Dropdown.Item>
                                                <Dropdown.Item onClick={() => this.dataDownload('tempChart')}>Data (CSV)</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiThermometer} size={2} />
                                </Col>
                                <Col>
                                    <h5>Monthly Temperature Anomaly <span className="text-adh-orange">{ this.getPositionDetails() }</span> from {this.state.date_range[0]} to {this.state.date_range[1]}</h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This chart shows the average temperature anomaly per month from from {this.state.date_range[0]} to {this.state.date_range[1]}. The anomaly is the degrees celcius above or below the climatological average of 1950-1980. The visualisation is based on the approach taken by Prof Ed Hawkins at <a className="text-adh-orange text-decoration-none" href="https://showyourstripes.info/" target="_blank">#ShowYourStripes</a> </p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body id="chartContainer">
                            <div className="chart-container2">
                            {this.state.loading ? <Row><Col className="text-center"><BeatLoader/></Col></Row> :
                                <div ref={this.anomalyChart}>
                                    <XYPlot width={document.querySelector('.chart-container2') != null ? document.querySelector('.chart-container2').getBoundingClientRect().width : 600} height={300} onMouseLeave={() => this.setState({hint_value: null})} yDomain={[-3, 3]} >
                                        <VerticalGridLines />
                                        <HorizontalGridLines />
                                        <XAxis tickFormat={v => this.state.data[v] != undefined ? this.state.data[v].date : v} />
                                        <YAxis tickFormat={v => v + '°C'} />
                                        <VerticalBarSeries
                                            data={this.state.temp_bar_data.map(d => ({ ...d, 
                                                y0: 0, 
                                                color: d.y == null ? '#ccc' : interpolateRdBu((d.y*-1 + 3) / 6) 
                                            }))}
                                            colorType="literal"
                                            onNearestX={(value) => this.setState({temp_bar_hint_value: value})}
                                        />

                                        
                                        
                                        <Crosshair values={[this.state.temp_bar_hint_value]}>
                                            <div></div>
                                        </Crosshair>
                                        
                                        { this.state.temp_bar_hint_value && (
                                            <Hint value={this.state.temp_bar_hint_value} style={{marginLeft: '1em', marginRight: '1em'}}>
                                                <div className="hintBox">
                                                    <h6>{this.state.temp_bar_hint_value.date}</h6>
                                                    <span><strong>ANOMALY:</strong> {parseFloat(this.state.temp_bar_hint_value.y).toFixed(2)}°C</span><br/>
                                                </div>
                                                    
                                            </Hint>
                                        )}
                                        
                                    </XYPlot>
                                </div>                             
                            }
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col></Col>
                                <Col xs="auto" className="py-2">
                                    { this.state.loading ? '' :
                                        <Dropdown className="mt-1">
                                            <Dropdown.Toggle variant="control-grey">Download</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => this.chartDownload('anomalyChart')}>Chart (PNG)</Dropdown.Item>
                                                <Dropdown.Item onClick={() => this.dataDownload('anomalyChart')}>Data (CSV)</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiAlertDecagram} size={2} />
                                </Col>
                                <Col>
                                    <h5>Timeline of natural disasters for <span className="text-adh-orange">{ this.getPositionDetails('country') }</span> from {this.state.date_range[0]} to {this.state.date_range[1]}</h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This chart shows natural disasters in the seleted period for the whole country and <strong>might not have affected the currently viewed location</strong>.</p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <div ref={this.disasterChart}>                            
                                <XYPlot width={document.querySelector('.chart-container2') != null ? document.querySelector('.chart-container2').getBoundingClientRect().width - 10 : 600} height={150} onMouseLeave={() => this.setState({hint_value: null})} yDomain={[0, 10]} >
                                        {/* <VerticalGridLines /> */}
                                        <HorizontalGridLines />
                                        <XAxis tickFormat={v => this.state.data[v] != undefined ? this.state.data[v].date : v} />
                                        <YAxis />
                                        <MarkSeries data={this.state.disasters_data} onValueMouseOver={(value) => this.setState({hint_value_disaster: value})} colorType="literal" onValueMouseOut={(value) => this.setState({hint_value_disaster: null})}/>
                                        
                                    <LineSeries data={this.state.data}/>
                                        
                                        { this.state.hint_value_disaster && (
                                            <Hint value={this.state.hint_value_disaster} style={{marginLeft: '1em', marginRight: '1em'}}>
                                                <div className="hintBox">
                                                    <div className="badge-pill hint-badge-pill" style={{backgroundColor: this.state.hint_value_disaster.color}}>{this.state.hint_value_disaster.title}</div>
                                                    <h6>{this.state.hint_value_disaster.date}</h6>
                                                    {ReactHtmlParser(this.getTooltip(this.state.hint_value_disaster))}
                                                </div>
                                                    
                                                </Hint>
                                        )}
                                </XYPlot>
                            </div>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col></Col>
                                <Col xs="auto" className="py-2">
                                    { this.state.loading ? '' :
                                        <Dropdown className="mt-1">
                                            <Dropdown.Toggle variant="control-grey">Download</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => this.chartDownload('disasterChart')}>Chart (PNG)</Dropdown.Item>
                                                <Dropdown.Item onClick={() => this.dataDownload('disasterChart')}>Data (CSV)</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col md>
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiThermometer} size={2} />
                                </Col>
                                <Col>
                                    <h5>
                                    <Form.Select className="d-inline" style={{width: 'unset'}} onChange={e => this.setState({temp_table_metric: e.target.value})}>
                                        <option value="avg">Average</option>
                                        <option value="min">Minumum</option>
                                        <option value="max">Maximum</option> 
                                    </Form.Select> monthly temperature versus <Form.Select className="d-inline" style={{width: 'unset'}} onChange={e => this.setState({temp_table_year: e.target.value})} ref={this.tempTableYear}>
                                        {
                                            this.dateRange().map((year, index) => {
                                                return (
                                                    <option key={index} value={year}>{year}</option>
                                                )
                                            })

                                        }
                                    </Form.Select>
                                    </h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This table shows the how the temperatures in {this.state.temp_table_year} compare with the recorded climatological averages between 1950 and 1980</p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th className="text-end" style={{width: '20%'}}>Mean {this.state.temp_table_metric}</th>
                                        <th className="text-end" style={{width: '20%'}}>{this.state.temp_table_year}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.climatology_data.filter(data => data.date.split('/')[1] == this.state.temp_table_year).map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td><strong>{this.getMonthName(data.month_number)}</strong></td>
                                                    <td className="text-end">{data['climatology_' + this.state.temp_table_metric]}°C</td>
                                                    <td className="text-end">
                                                        <span className={data['calculated_temp_' + this.state.temp_table_metric] > data['climatology_' + this.state.temp_table_metric] ? 'text-adh-red' : ''}>
                                                            {data['calculated_temp_' + this.state.temp_table_metric]}°C</span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col></Col>
                                <Col xs="auto" className="py-2">
                                    { this.state.loading ? '' :
                                        <Dropdown className="mt-1">
                                            <Dropdown.Toggle variant="control-grey">Download</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => this.dataDownload('tempTable')}>Data (CSV)</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiWeatherPouring} size={2} />
                                </Col>
                                <Col>
                                    <h5>Average monthly precipitation versus <Form.Select className="d-inline" style={{width: 'unset'}} onChange={e => this.setState({precip_table_year: e.target.value})} ref={this.precipTableYear}>
                                        {
                                            this.dateRange().map((year, index) => {
                                                return (
                                                    <option key={index} value={year}>{year}</option>
                                                )
                                            })

                                        }
                                    </Form.Select></h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This table shows the how the monthly average precipitation in {this.precip_table_year} compare with the average between 1950 and 1980</p>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Table>
                            <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th className="text-end" style={{width: '20%'}}>Mean Precip</th>
                                        <th className="text-end" style={{width: '20%'}}>{this.state.precip_table_year}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.precip_data.filter(data => data.date.split('/')[1] == this.state.precip_table_year).sort((a, b) => { return a.month_number - b.month_number }).map((data, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td><strong>{this.getMonthName(parseInt(data.month_number) - 1)}</strong></td>
                                                    <td className="text-end">{Math.round(data.month_avg * 100) / 100}mm</td>
                                                    <td className="text-end">
                                                        <span className={data.precip > data.month_avg ? 'text-adh-red' : ''}>
                                                            {data.precip}mm</span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col></Col>
                                <Col xs="auto" className="py-2">
                                    { this.state.loading ? '' :
                                        <Dropdown className="mt-1">
                                            <Dropdown.Toggle variant="control-grey">Download</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => this.dataDownload('precipTable')}>Data (CSV)</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            
            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="py-4">
                            <Row>
                                <Col xs="auto">
                                    <Icon path={mdiWeatherPouring} size={2} />
                                </Col>
                                <Col>
                                    <h5>Monthly Precipitation for <span className="text-adh-orange">{this.getPositionDetails() }</span></h5>
                                    <p style={{fontWeight: '300'}} className="mb-0">This chart shows the average monthly preciptitation for every month from {this.state.date_range[0]} to {this.state.date_range[1]}. the colour scale ranges from <span className="badge-pill" style={{background: '#feffd8', color: '#333'}}>0mm</span> to <span className="badge-pill" style={{backgroundColor: '#081d58', color: '#fff'}}>10mm</span>.</p>
                                </Col>
                            </Row>
                            
                        </Card.Header>
                        <Card.Body>
                            {this.state.loading ? <Row><Col className="text-center"><BeatLoader/></Col></Row> :
                            <div className="chart-container3">
                                <div ref={this.precipChart}>
                                    <XYPlot
                                    key={this.state.update_precip_chart}
                                    width={document.querySelector('.chart-container2') != null ? document.querySelector('.chart-container2').getBoundingClientRect().width : 1000}
                                    height={this.dateRange().length < 10 ? this.dateRange().length * 40 : this.dateRange().length * 30}
                                    xType="ordinal"
                                    xDomain={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                                    yType="ordinal"
                                    yDomain={this.dateRange()}>
                                        <XAxis tickFormat={v => this.getMonthName(v-1)}  />
                                        <YAxis />
                                        <HeatmapSeries
                                            colorType="literal"
                                            data={
                                                this.state.precip_data.map((d,index) => {
                                                    return { 
                                                        x: parseInt(d.month_number),
                                                        y: parseInt(d.time),
                                                        color: d.precip == null ? '#ccc' : interpolateYlGnBu(d.precip_scale),
                                                        precip: d.precip,
                                                        date: d.date,
                                                        time: d.time,
                                                        stroke: (this.state.hint_value_precip && this.state.hint_value_precip.x === parseInt(d.month_number) && this.state.hint_value_precip.y === parseInt(d.time))
                                                        ? 'red'
                                                        : 'transparent'
                                                    }
                                                })
                                            }
                                            onValueMouseOver={e => this.setState({hint_value_precip: e})}
                                            onValueMouseOut={e => this.setState({hint_value_precip: null})}
                                            cellPadding={0}
                                            style={{stroke: this.state.hint_value_precip ? this.state.hint_value_precip.stroke : 'transparent'}}
                                        
                                        />
                                            <Crosshair values={[this.state.hint_value_precip]}>
                                                <div></div>
                                            </Crosshair>
                                            { this.state.hint_value_precip && (
                                                <Hint value={this.state.hint_value_precip} style={{marginLeft: '1em', marginRight: '1em'}}>
                                                    <div className="hintBox">
                                                        <h6>{this.state.hint_value_precip.date}</h6>
                                                        {this.state.hint_value_precip.precip} mm
                                                    </div>
                                                        
                                                </Hint>
                                            )}
                                    </XYPlot>
                                </div>
                            </div>
                            }
                            {/* <ContinuousColorLegend width={200} startTitle="0" endTitle="10" startColor={interpolateYlGnBu(0)} endcolor={interpolateYlGnBu(1)} /> */}
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col></Col>
                                <Col xs="auto" className="py-2">
                                    { this.state.loading ? '' :
                                        <Dropdown className="mt-1">
                                            <Dropdown.Toggle variant="control-grey">Download</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => this.chartDownload('precipChart')}>Chart (PNG)</Dropdown.Item>
                                                <Dropdown.Item onClick={() => this.dataDownload('precipChart')}>Data (CSV)</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    }
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Row className="my-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col></Col>
                                <Col xs="auto">
                                    <div style={{display: 'inline-block', position: 'relative', top: '0.2em', right: '0.6em'}}>POWERED BY</div> <a target="_blank" href="https://www.openup.org.za"><img style={{width: '100px'}} src="https://brand-assets.openup.org.za/openup/PNG/Standard/openup-logo-1200x267.png"/></a>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        
        
        

       
        
        </>)
    }

}