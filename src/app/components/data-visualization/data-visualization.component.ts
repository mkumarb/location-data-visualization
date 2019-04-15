import { Component, OnInit } from '@angular/core';

import * as mapboxgl from 'mapbox-gl';
import { VisualizationService } from '../../services/upload-visualize.service';
import { GeoJson, FeatureCollection } from '../../models/map';

@Component({
  selector: 'data-visualization',
  templateUrl: './data-visualization.component.html',
  styleUrls: ['./data-visualization.component.css']
})
export class DataVisualizationComponent implements OnInit {

  fileUploaded = null;
  map: mapboxgl.Map;
  // style = 'mapbox://styles/mkumarb/cju82b5sx35lc1fo3norh79m0';
  // mapbox://styles/mkumarb/cjugodw6g25bk1fn2953ltpa3
  // mapbox://styles/mapbox/light-v10
  style = 'mapbox://styles/mkumarb/cjugodw6g25bk1fn2953ltpa3';
  source_from: any;
  source_to: any;
  markers: any;
  featureCollectionWithFromCoordinates: any;
  featureCollectionWithToCoordinates: any;
  visualize:boolean = false;
  uploadStatus: string = "Upload CSV file";
  loading:boolean = false;
 

  constructor(private VisualizationService: VisualizationService) { }

  ngOnInit() {
    // this.buildMap();
  }

  changeUploadStatus(){
    this.uploadStatus = "Upload in progres.....  "
  }

  uploadFile(){
    this.loading = true;
    this.visualize = true;
    this.featureCollectionWithFromCoordinates = this.VisualizationService.getFeatureCollectionWithFromCoordinates();
    this.featureCollectionWithToCoordinates = this.VisualizationService.getFeatureCollectionWithToCoordinates();
    this.initMap();
  }

  scrollSmooth($element): void {
    console.log($element);
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

  onFileSelected(event){
    this.uploadStatus = "<- Click when it's available"
    this.VisualizationService.parseCSVFile(event.target.files[0]);
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      // zoom: 9,
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      pitch: 40,
      center: [77.57475,12.98059]
    }); 
  }

  initMap() {
    let center_long = this.featureCollectionWithToCoordinates.features[0].geometry.coordinates[0];
    let center_lat = this.featureCollectionWithToCoordinates.features[0].geometry.coordinates[1];
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      // zoom: 9,
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      pitch: 40,
      center: [parseFloat(center_long),parseFloat(center_lat)]
    });
    this.map.addControl(new mapboxgl.NavigationControl());
      this.map.on('load', (event) => {
        
        /// register source
        this.map.addSource('from_locale', {
           type: 'geojson',
           data: {
            type: 'FeatureCollection',
            features: []
          },
          buffer: 0
        });

        this.map.addSource('to_locale', {
          type: 'geojson',
          data: {
           type: 'FeatureCollection',
           features: []
         },
         buffer: 0
       });
       
       
        /// get source
      this.source_from = this.map.getSource('from_locale')
      this.source_from.setData(this.featureCollectionWithFromCoordinates)
      this.map.addLayer({
        id: 'from_locale_id',
        source: 'from_locale',
        type: 'circle',
        'paint': {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': [
            "interpolate", ["linear"], ["zoom"],
            // zoom is 5 (or less) -> circle radius will be 1px
            10, 5,
            // zoom is 10 (or greater) -> circle radius will be 5px
            15, 10
          ],
          'circle-color': 'rgb(51,67,244)',
          // 'rgb(34,139,34)'
          'circle-blur': 0.25
        }
          // layout: 
          // {
          //   'text-field': '{description}',
          //   'text-size': 15,
          //   'text-transform': 'uppercase',
          //   "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          //   'icon-image': 'harbor-15',
          //   'text-offset': [0, 1]
          // },
          // paint: {
          //   'text-color': '#f16624',
          //   'text-halo-color': '#fff',
          //   'text-halo-width': 2
          // }
      })

      this.source_to = this.map.getSource('to_locale')
      this.source_to.setData(this.featureCollectionWithToCoordinates)
      
      this.map.addLayer({
        id: 'to_locale_id',
        source: 'to_locale',
        type: 'circle',
        'paint': {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': [
            "interpolate", ["linear"], ["zoom"],
            // zoom is 5 (or less) -> circle radius will be 1px
            10, 3,
            // zoom is 10 (or greater) -> circle radius will be 5px
            15, 6
          ],
          'circle-color': 'rgb(247,64,67)',
          'circle-blur': 0.75
        }
      })

      this.map.on('data', function(e) {
        document.getElementById("loader").style.visibility = "visible";
        if (e.dataType === 'source' && e.sourceId === 'from_locale') {
          console.log("In here")
          setTimeout(function(){
            document.getElementById("loader").style.visibility = "hidden";
          },10000)
            
        }
    })
    })
  }
  
  addMarker(map,mapData){
    mapData.forEach(function(marker) {
      if(!isNaN(parseFloat(marker.from_long)) || !isNaN(parseFloat(marker.from_lat))) {
        let coordinates = new mapboxgl.LngLat(parseFloat(marker.from_long),parseFloat(marker.from_lat));
        let el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = 'url(map-icon.png)';
        el.style.width = '50px';
        el.style.height = '50px';
        let title = "Pickup from this location"
        let popup = new mapboxgl.Popup()
          .setHTML('<div style="padding:0.3rem 0.3rem 0;text-align:center;">'
          + '<h2 style="font-size:16px;margin:0 0 0.3rem;">' + title + '</h2>'
          + '<p style="font-size:12px;margin:0;">On: ' + marker.from_date + '</p></div>');
        
        // add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map);
      }
    })
      // f1(this.geoJson.features[0]);
      // f1(this.geoJson.features[1]);
   
  }

  




}
