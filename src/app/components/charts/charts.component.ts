import { Component, OnInit } from '@angular/core';
import { VisualizationService } from '../../services/upload-visualize.service';

@Component({
  selector: 'charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  allRecords = [];
  chartProperties:any[] = [];
  displayCharts:boolean = false;

  constructor(private VisualizationService: VisualizationService) {
      this.allRecords = this.VisualizationService.getAllCSVRecords();
      this.chartProperties[0] = {};
      this.chartProperties[1] = {};
      this.chartProperties[2] = {};
      this.chartProperties[3] = {};
  }

  ngOnInit() {
    this.runChartFunctions();
  }

  async runChartFunctions(){
    await this.getNumberOfTripsEachMonth();
    await this.getNumberOfBookingsBasedOnType();
    await this.getCountBasedOnPackageId();
    await this.getCountBasedOnTravelType();
    this.displayCharts=true;
  }

  getNumberOfTripsEachMonth(){
    this.chartProperties[0]['title'] = 'Number of trips per month';
    this.chartProperties[0]['type'] = 'LineChart';
    this.chartProperties[0]['options'] = {   
      hAxis: {
        title: 'Month'
      },
      vAxis:{
        title: 'Number of Trips'
      },
      pointSize:5,
      backgroundColor: { fill:'transparent' }
    };
    this.chartProperties[0]['width'] = 1500;
    this.chartProperties[0]['height'] = 600;
    let data:any = [["January"],["February"],["March"],["April"],["May"],["June"],["July"],
    ["August"],["September"],["October"],["November"],["December"]];
    let columnNames = ["Month"];
    let noOfRecords = this.allRecords[1].length;
    for(let i = 0; i < noOfRecords; i++){
      if(this.allRecords[1][i]['id'] !== "") {
        let dateString = new Date(this.allRecords[1][i]['from_date']);
        let tripYear = dateString.getFullYear().toString();
        let tripMonth = dateString.getMonth();
        if(columnNames.indexOf(tripYear) === -1){
          columnNames.push(tripYear);
          let len = data[tripMonth].length;
          data[tripMonth][len] = 0;
          for(let j = 0; j < data.length; j++)
            data[j][columnNames.indexOf(tripYear)] = 0;
        }
        data[tripMonth][columnNames.indexOf(tripYear)] += 1;
      }
      if(i === noOfRecords - 1){
        this.chartProperties[0]['columnNames'] = columnNames;
        this.chartProperties[0]['data'] = data;
      }
    }
  }

  getNumberOfBookingsBasedOnType(){
    this.chartProperties[1]['title'] = 'Mode of booking in each month';
    this.chartProperties[1]['type'] = 'ColumnChart';
    this.chartProperties[1]['options'] = {   
      hAxis: {
        title: 'Month'
      },
      vAxis:{
        title: 'Number of bookings'
      },
      backgroundColor: { fill:'transparent' }
    };
    this.chartProperties[1]['width'] = 1500;
    this.chartProperties[1]['height'] = 600;
    let data:any = [["January",0,0,0],["February",0,0,0],["March",0,0,0],["April",0,0,0],["May",0,0,0],["June",0,0,0],
    ["July",0,0,0],["August",0,0,0],["September",0,0,0],["October",0,0,0],["November",0,0,0],["December",0,0,0]];
    let columnNames = ["Month","Desktop Booking","Mobile Booking","Other Modes"];
    let noOfRecords = this.allRecords[1].length;
    for(let i = 0; i < noOfRecords; i++){
      if(this.allRecords[1][i]['id'] !== "") {
        let online_booking = parseInt(this.allRecords[1][i]['online_booking']);
        let mobile_site_booking = parseInt(this.allRecords[1][i]['mobile_site_booking']);
        let dateString = new Date(this.allRecords[1][i]['from_date']);
        let tripMonth = dateString.getMonth();
        if (online_booking === 1) {
          data[tripMonth][1] += 1;
        } else if (mobile_site_booking === 1) {
          data[tripMonth][2] += 1;
        } else {
          data[tripMonth][3] += 1;
        }
      }
      if(i === noOfRecords - 1){
        this.chartProperties[1]['columnNames'] = columnNames;
        this.chartProperties[1]['data'] = data;
      }
    }
  }

  getCountBasedOnPackageId(){
    this.chartProperties[2]['title'] = 'Preferred Packages';
    this.chartProperties[2]['type'] = 'PieChart';
    this.chartProperties[2]['options'] = {   
      is3D: true,
      backgroundColor: { fill:'transparent' }
    };
    this.chartProperties[2]['width'] = 850;
    this.chartProperties[2]['height'] = 500;
    let data:any = [["Type 1: 4hrs & 40kms",0],["Type 2: 8hrs & 80kms",0],["Type 3: 6hrs & 60kms",0],["Type 4: 10hrs & 100kms",0],
                    ["Type 5: 5hrs & 50kms",0],["Type 6: 3hrs & 30kms",0],["Type 7: 12hrs & 120kms",0]];
    let columnNames = ["Booking Type","% of bookings"];
    let noOfRecords = this.allRecords[1].length;
    let totalPackageCount = [];
    for(let j = 0; j < 8; j++)
      totalPackageCount[j] = 0;
    for(let i = 0; i < noOfRecords; i++){
      if(this.allRecords[1][i]['id'] !== "") {
        if(this.allRecords[1][i]['package_id'] !== "NULL") {
          let package_id = parseInt(this.allRecords[1][i]['package_id']);
          if(!isNaN(package_id)){
            totalPackageCount[package_id] += 1;
            totalPackageCount[0] += 1;
          }
        }
      }
      if(i === noOfRecords - 1){
        for(let j = 1; j < 8; j++){
          data[j - 1][1] += ((totalPackageCount[j]/totalPackageCount[0]) * 100)
          if(j === 7){
            this.chartProperties[2]['columnNames'] = columnNames;
            this.chartProperties[2]['data'] = data;
          }
        }
      }
    }
  }


  getCountBasedOnTravelType(){
    this.chartProperties[3]['title'] = 'Travel Types Used';
    this.chartProperties[3]['type'] = 'BarChart';
    this.chartProperties[3]['options'] = {   
      hAxis: {
        title: 'Travel Type'
      },
      vAxis:{
        title: 'Number of bookings'
      },
      backgroundColor: { fill:'transparent' } 
    };
    this.chartProperties[3]['width'] = 750;
    this.chartProperties[3]['height'] = 500;
    let data:any = [["Type 1: Long Distance",0],["Type 2: Point to Point",0],["Type 3: Hourly Rental",0]];
    let columnNames = ["Travel Type","Number of bookings"];
    let noOfRecords = this.allRecords[1].length;
    for(let i = 0; i < noOfRecords; i++){
      if(this.allRecords[1][i]['id'] !== "") {
        let travelTypeId = parseInt(this.allRecords[1][i]['travel_type_id']);
        if(!isNaN(travelTypeId)){
          data[travelTypeId - 1][1] += 1;
        }
      }
      if(i === noOfRecords - 1){
        this.chartProperties[3]['columnNames'] = columnNames;
        this.chartProperties[3]['data'] = data;
      }
    }
  }

}
