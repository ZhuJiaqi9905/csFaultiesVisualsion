// let _width = $(window).width();
// let _height = $(window).height();
// let width = _width;
// let height = 1000;

var nData = null;
var pData = null;
let nDataFile = './data/data.json';//node data
let pDataFile = './data/data.csv'; //person data

function processData(){
    return Promise.all([
        d3.json(nDataFile),
        d3.csv(pDataFile)
    ]).then(function(files) {
        // files[0] will contain nDataFile
        //files[1] will contain pDataFile
        nData = files[0];
        pData = files[1];
        // pData = pData.filter((d, i) => {
        //     if(d['Ph.D. Graduation Year'] === '' || d['Publications'] === ''){
        //         return false;
        //     }else{
        //         return true;
        //     }
        // })
        let nodeMap = new Map();
        let nodes = nData.nodes;
        let links = nData.links;
        nodes.forEach((d) => {nodeMap.set(d.id, 0)})//计算每个学校所连的边数
        links.forEach( (d) => { 
            nodeMap.set(d.source, nodeMap.get(d.source) + 1)
            nodeMap.set(d.target, nodeMap.get(d.target) + 1)
        })
        //添加neighbors属性
       nodes.forEach((d) => {d.neighbors = nodeMap.get(d.id)})
       links.forEach((d) => {d.sNeighbors = nodeMap.get(d.source), d.tNeighbors = nodeMap.get(d.target)})
        // console.log(nData);
    }).catch(function(err) {
        // handle error here
        console.log(err);
    })
    
    
    
}

// d3.csv(data_file).then(function (DATA) {
//     dataOri = DATA;
//     setUI();
//     preprocess();
//     drawPixel();
// });
function main() {
   processData()
    .then(() => {
        dataOri = pData;
        setUI();
        preprocess();
        drawPixel();
        // let data = getPict2Data(nData);
        // console.log(data);
        (drawPict3(nData, 5)())
    })
    
}

main()