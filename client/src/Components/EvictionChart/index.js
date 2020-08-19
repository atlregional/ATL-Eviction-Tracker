import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { Dropdown, Button, Container } from 'semantic-ui-react';
import { csv } from 'd3';
// STYLESHEET
import './style.css';
// CSV TEST-DATA IMPORT
const csvData = require('../../Test-data/AllCountyEvictionCaseFilings-as-of-8-14-20.csv');

const EvictionChart = (props) => {
  // case data for csv test cases;
  const [caseData, setCaseData] = useState([]);
  // filter options;
  const [countyFilter, setCountyFilter] = useState('ALL');
  console.log('countyFilter: ', countyFilter);

  useEffect(() => {
    csv(csvData)
      .then((data) => {
        console.log('data: ', data);
        setCaseData(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const countyOptions = [
    { key: '063', text: 'Clayton County', value: '63' },
    { key: '067', text: 'Cobb County', value: '67' },
    { key: '089', text: 'Dekalb County', value: '89' },
    { key: '121', text: 'Fulton County', value: '121' },
    { key: '135', text: 'Gwinnett County', value: '135' },
  ];

  return (
    <>
      <Dropdown
        className="icon chart-dropdown"
        placeholder="County Options"
        fluid
        multiple
        selection
        options={countyOptions}
        onClick={() => {
          
        }}
      />

      <ResponsiveContainer
        className="chart-responsive-container"
        width="95%"
        height="85%"
      >
        <BarChart
          className="barChart"
          width={1200}
          height={750}
          data={caseData}
          margin={{
            top: 15,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="File.Date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
          <Legend />
          <Bar dataKey="Count" stackId="a" fill="#8884d8" />
          {/* <Bar dataKey="tractID" stackId="a" fill="#82ca9d" /> */}
        </BarChart>
      </ResponsiveContainer>

      <Container className="button-group-container">
        <Button.Group className="button-group">
          <Button>Daily Cases</Button>
          <Button>Weekly Cases</Button>
          <Button>Monthly Cases</Button>
        </Button.Group>
      </Container>
    </>
  );
};

export default EvictionChart;
