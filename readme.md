# lucid-fetch-helper

## Installation

`npm install --save lucid-fetch-helper`

or using yarn

`yarn add lucid-fetch-helper`

## Usage

```javascript
import fetch from "lucid-fetch-helper"

const response = await fetch(LucidModel,columnsSettings, pagination, orderBy, searchQuery, filters, dateRange, customColumnsSelectionList,excludedSearchColumns)
...
```

## API

| Parameter | Description |
|-----------|-------------|
|`LucidModel`|Lucid Orm Model|
|`columnsSettings`| { customColumnsSelectionList : ['columnName1',...], method : 'include'|'exclude' }|
|`pagination`|object defines pagination settings {page:number,perPage:number(defaults to 15)}|
|`orderBy`|object defines column to order by {filed:"columnName" ,direction:"asc"|"desc"}|
|`searchQuery`|string to search with in all database columns (generic search)|
|`filters`|an array of key:value pairs defines filtration criteria  [{gender:"male"}]|
|`dateRange`|date range to filter by {from:"YYYY/MM/DD",to:"YYYY/MM/DD"} note that from and to are optional witch means you can define dateRange object as follows {from:"YYYY/MM/DD"} Or {to:"YYYY/MM/DD"}|
|`excludedSearchColumns`|list of columns that should be excluded from generic search i.e. any non string values ex ['isActive','id',...] Note by default 'id','updated_at','created_at' columns are excluded|