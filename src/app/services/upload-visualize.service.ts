import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';

import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import {IGeoJson} from '../models/map'

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {

  allRecords: any[];
  csvHeaders: any[];
  allCSVRecords: any[];

  featureCollectionFromLocation: any;

  featureCollectionToLocation: any;

  constructor(private papa: Papa) {
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
  }

  getFeatureCollectionWithFromCoordinates(){
    return this.featureCollectionFromLocation;
  }

  getFeatureCollectionWithToCoordinates(){
    return this.featureCollectionToLocation;
  }

  getAllCSVRecords(){
    return [this.csvHeaders, this.allCSVRecords];
  }

  parseCSVFile(CSVfile){
    const csvData = CSVfile;
    this.papa.parse(csvData, {
      complete: async (result) => {
        this.csvHeaders = result.data[0];
        let allRecords = await this.convertDataToObject(result.data);
        this.featureCollectionFromLocation = allRecords[0];
        this.featureCollectionToLocation = allRecords[1];
      }
    });
  }

  convertDataToObject(data){
    let arrHeader = data[0];
    let featureCollectionFromLocation = {
      "type":"FeatureCollection",
      "features": []
    };
    let featureCollectionToLocation = {
      "type":"FeatureCollection",
      "features": []
    };
    let allCSVRecords = []
    for(let i = 1; i < data.length; i++){
      let curRow = [...data[i]];
      curRow.reduce(function(curRowObj, currentValue, currentIndex, array) {
        curRowObj[arrHeader[currentIndex]]=currentValue;
        if((currentIndex === curRow.length - 1) && (!isNaN(parseFloat(curRowObj.from_long)))){
          let feature_from = { 
            "type" : "Feature", 
            "properties" : {...curRowObj}, 
            "geometry" : { 
              "type" : "Point", 
              "coordinates" : [parseFloat(curRowObj.from_long),parseFloat(curRowObj.from_lat)]
            }
          }
          let existingFromFeatures = featureCollectionFromLocation.features;
          featureCollectionFromLocation.features = [...existingFromFeatures,feature_from];
        }
        if((currentIndex === curRow.length - 1) && (!isNaN(parseFloat(curRowObj.to_long)))){
          let feature_to = { 
            "type" : "Feature", 
            "properties" : {...curRowObj}, 
            "geometry" : { 
              "type" : "Point", 
              "coordinates" : [parseFloat(curRowObj.to_long),parseFloat(curRowObj.to_lat)]
            }
          }
          let existingToFeatures = featureCollectionToLocation.features;
          featureCollectionToLocation.features = [...existingToFeatures,feature_to];
        }
        if(currentIndex === curRow.length - 1){
          allCSVRecords.push(curRowObj);
        }
        return curRowObj;
      },{});
      if(i === data.length - 1){
        this.allCSVRecords = allCSVRecords;
        return [featureCollectionFromLocation, featureCollectionToLocation];
      }
    }
  }

  
  
}
