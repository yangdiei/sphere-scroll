# sphere-scroll
### Example
<img alt="Join Discusion Group" src="https://user-images.githubusercontent.com/26077443/150458813-d1b3a3c0-5f7c-4bf2-87e2-1121d027ed86.png" width="300">

## Install
```
npm install sphere-scroll
```

## Quick Start
```javascript
import SphereScroll from "sphere-scroll";
```
```HTML
<sphere-scroll
  :dataList="dataList" 
  @selectChange="onSelectChange" 
  :viewHeight="300" 
  :itemHeight="35"
  :viewWidth="300"
>
```
### You can see [demo](https://github.com/adavie1) for more information.

## Porps
|  porps   | description  | Type | Default |
|  ----    | ----         | ---- | ---- |
| viewHeight  | Component height | string/number | 350 |
| viewWidth   | Component width  | string/number | 300 |
| itemHeight  | List item height | string/number | 40 |
| dataList    | List data      | array | - |

##Events
| Event Name |	Description |	Parameters |
|  ----      | ----        | ----       |
| selectChange  | triggers when selection changes | selcetion index|

## Methods
| Method |	Description |	Parameters |
|  ----  | ----         | ----       |
| setSeclectIndex  | set selection | selcetion index|