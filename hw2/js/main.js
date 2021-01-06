let _width = $(window).width();
let _height = $(window).height();
let width = _width;
let height = 1000;

let data = null;
let data_file = './data/data.json';
let nodeName2Num = {}
let edges = []
let nodes_dict = {}
let G = new Map();//邻接表
let linkNums = [0, 20, 40];
let rectText = [0, 20, 40, 60];
//返回i与j之间的斥力。分别分解成x,y两个分量
//斥力 (k^2)/(dist^alpha)
function getRepulsiveForce(k, alpha,node1, node2){
    let dx = node1.x - node2.x;
    let dy = node1.y - node2.y;
    let dis = Math.sqrt(dx*dx + dy*dy);
    let tmp = Math.pow(dis, alpha);

    let rf = (k*k) / tmp;
    let rfx = (rf * dx / dis);
    let rfy = (rf * dy / dis);
    
    return [rfx, rfy];
}
//返回i与j之间的引力。分别分解成x,y两个分量
//引力 (dist^(alpha+1))/k
function getTracionForce(k, alpha, node1, node2){
    let dx = node1.x - node2.x;
    let dy = node1.y - node2.y;
    let dis = Math.sqrt(dx*dx + dy*dy);
    let tmp = Math.pow(dis, alpha+1);
    let tf = tmp / k;
    let tfx = -(tf * dx / dis);
    let tfy = -(tf * dy / dis);
    return [tfx, tfy];
}
/**devide Nodes by link num
 * nodes: Array of object.[{"id": "xxx University", "weight": }, {}, ...]
 * linkNum
 */
function getNodesByLinkNum(nodes, linkNum){
    let subNodes = new Array();
    let subG = new Map();
    let ndSet = new Set();
    for(let i in nodes){
        let u = nodeName2Num[nodes[i].id];
        if(G.get(u).size >= linkNum){
            subNodes.push(nodes[i]);
            ndSet.add(nodeName2Num[nodes[i].id]);
        }
    }
    for(let i = 0; i < subNodes.length; i++){
        let u = nodeName2Num[subNodes[i].id];
        
        let link = new Set();
        for(let j = 0; j < subNodes.length; j++){
            let v = nodeName2Num[subNodes[j].id];
            if(G.get(u).has(v)){
                link.add(j);
            }
        }
        
        // for(let item of G.get(u).values()){
        //     if(ndSet.has(item)){
        //         link.add(item);
        //     }
        // }
        subG.set(i, link);
    }
    return [subNodes, subG];
}
function main_draw(nodes, graph, iter=200, k=0.5, alpha = 1){
    let n = nodes.length;
    let f = new Array(n);
    let v = new Array(n);
    
    for(let i = 0; i < n; i++){
        f[i] = [0.0, 0.0];
        v[i] = [0.0, 0.0];
    }


    //参数
    let beta = 0.9;
    let delta = 0.01;
    
    k = k * Math.sqrt(width * height/nodes.length)
    
    //迭代iter次
    while(iter--){
    //计算每个节点受到的引力和斥力
        for(let i = 0; i < n; i++){
            for(let j = 0; j < n; j++){
                if(i == j) continue;
                let rf = getRepulsiveForce(k, alpha, nodes[i], nodes[j]);
                f[i][0] += rf[0];
                f[i][1] += rf[1];
                
            }
           // let nn = G[i].length;
            for(let j of graph.get(i).values()){
                let tf = getTracionForce(k, alpha + 1, nodes[i], nodes[j]);
                    f[i][0] += tf[0];
                    f[i][1] += tf[1];
            }
        }
        //移动每一个点
        for(let i = 0; i < n; i++){
            v[i][0] = v[i][0] * beta + f[i][0] * (1 - beta);
            v[i][1] = v[i][1] * beta + f[i][1] * (1 - beta);

            let dx = delta * v[i][0];
            let dy = delta * v[i][1];
            while(Math.abs(dx) > 100 || Math.abs(dy) > 100){
                dx = dx / 2;
                dy = dy / 2;
            }
           
            if(nodes[i].fixed === "false"){
                nodes[i].x += dx;
                nodes[i].y += dy;
            }
            
            f[i][0] = 0;
            f[i][1] = 0;
        
        }  
    } 
    let averX = 0; let averY = 0;
    for(i in nodes){
        averX += nodes[i].x;
        averY += nodes[i].y;
    }
    averX /= n; averY /= n;
    for(i in nodes){
        nodes[i].x = nodes[i].x - averX + width/2;
        nodes[i].y = nodes[i].y - averY + height/2;
    }
}

// 需要实现一个图布局算法，给出每个node的x,y属性
function graph_layout_algorithm(nodes, links) {
    // 算法开始时间
    d = new Date()
    begin = d.getTime()

    //请在这一部分实现图布局算法
    let [subNodes, subGraph] = getNodesByLinkNum(nodes, 7)
    // console.log(subNodes.length)
    main_draw(subNodes, subGraph, 400,2.5, 0.8)
    for(let nd of subNodes){
        nd.fixed = "true";
        
    }
    main_draw(nodes, G, 500, 0.3, 0.5)
    
    
    
    // 算法结束时间
    d2 = new Date()
    end = d2.getTime()
    
    // 保存图布局结果和花费时间为json格式，并按提交方式中重命名，提交时请注释这一部分代码
    // var content = JSON.stringify({"time": end-begin, "nodes": nodes, "links": links});
    // var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    // saveAs(blob, "save.json");
}
//预处理，绑定node,link,text。添加鼠标事件
function preprocess(){
    let svg = d3.select('#container')
        .select('svg')
        .attr('width', width)
        .attr('height', height);

    // 数据格式
    // nodes = [{"id": 学校名称, "weight": 毕业学生数量}, ...]
    // links = [{"source": 毕业学校, "target": 任职学校, "weight": 人数}, ...]
    let links = data.links;
    let nodes = data.nodes;
    for(let nd of nodes){
        nd.fixed = "false";
        nd.x = Math.random() * 0.8 * width + 0.1 * width;
        nd.y = Math.random() * 0.8 * height + 0.1 * height;
    }
    for (let i in nodes) {
        nodes_dict[nodes[i].id] = nodes[i]
        nodeName2Num[nodes[i].id] = Number(i) 
    }
    for(let i in links){
        edges.push([ nodeName2Num[links[i].source],nodeName2Num[links[i].target]])
    }
    //    //创建邻接表
    let n = nodes.length;
    for(let i = 0; i < n; i++){
        G.set(i, new Set())
    }
    for(let i in links){
        let u = nodeName2Num[links[i].source];
        let v = nodeName2Num[links[i].target];
        if(u == v) continue;
        G.get(u).add(v);
        G.get(v).add(u);
    }
    // links
    let link = svg.append("g")
        .attr("id", "gLinks")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.4)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.weight))
        .attr("class", d => {
            let c1 = "s" + nodeName2Num[d.source];
            let c2 = "t" + nodeName2Num[d.target];
            return c1 + " " + c2;
        })

    // nodes
    let node = svg.append("g")
        .attr("id", "gNodes")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => Math.pow(d.weight, 1/3) * 1.5 + 1)
        .attr("fill", "rgba(42, 29, 223, 0.685)")
        .attr("id", d => {
            return "c" + nodeName2Num[d.id]
        })
        .attr("opacity", (d) => {
            let i = 0;
            let u = nodeName2Num[d.id];
            let num = G.get(u).size;
            if(num < 20){
                i = 2;
            }else if(num < 40){
                i = 1;
            }
            return 1-0.35*i;
        })
        .on("mouseover", function (e, d) {// 鼠标移动到node上时显示text
            text.attr("display", function (f) {
                if(f.id == d.id){
                    return "null";
                }else{
                    return "none";
                }
            }) 
            //突出显示选中元素
            let ndEle = document.getElementById("c" + nodeName2Num[d.id])
            ndEle.setAttribute("stroke", "rgba(45, 33, 224, 0.925)")
            ndEle.setAttribute("stroke-width", 1.5)
            //突出显示它的邻居结点
            for(let item of G.get(nodeName2Num[d.id]).values()){
                let cirElement = document.getElementById("c" + item)
                cirElement.setAttribute("stroke", "rgba(235, 71, 21, 0.938)")
                cirElement.setAttribute("stroke-width", 1.5)
            }
            
            
            //突出显示它的临边
            let c = "s" + nodeName2Num[d.id]
            let elements =  document.getElementsByClassName(c)
            let en = elements.length;
            for(let i = 0; i < en; i++){
                elements[i].setAttribute("stroke-width", 2)
                elements[i].setAttribute("stroke", "rgba(235, 71, 21, 0.938)")
                elements[i].setAttribute("stroke-opacity", 0.7)
            }
        })
        .on("mouseout", function (e, d) {// 鼠标移出node后按条件判断是否显示text
            text.attr("display", function (f) {
                    return 'none';
            })
            //恢复选中元素
            let ndEle = document.getElementById("c" + nodeName2Num[d.id])
            ndEle.setAttribute("stroke", "#fff")
            ndEle.setAttribute("stroke-width", 0.5)
            //恢复它的邻居结点
            for(let item of G.get(nodeName2Num[d.id]).values()){
                let cirElement = document.getElementById("c" + item)
                cirElement.setAttribute("stroke", "#fff")
                cirElement.setAttribute("stroke-width", 0.5)
            }
            //恢复它的邻边
            let c = "s" + nodeName2Num[d.id]
            let elements =  document.getElementsByClassName(c)
            let en = elements.length;
            for(let i = 0; i < en; i++){
                elements[i].setAttribute("stroke-width", 1)
                elements[i].setAttribute("stroke", "#999")
                elements[i].setAttribute("stroke-opacity", 0.4)
            }    
        });

    // 学校名称text，只显示满足条件的学校
    let text = svg.append("g")
        .attr("id", "gText")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text(d => d.id)
        .attr("display", () => "none")
    
    
    let rects = svg.append("g")
                    .selectAll("rect")
                    .data(linkNums)
                    .join("rect")
                    .attr("fill", "rgba(45, 33, 224, 0.925)")
                    .attr("height", 10)
                    .attr("width", 20)
                    .attr("x", 1000)
                    .attr("y", (d, i) => {
                        return 700 + 10.5*i;
                    })
                    .attr("opacity", (d, i) => {
                        return 1 - 0.35*i;
                    })
                   
    svg.append("g")
        .selectAll("text")
        .data(rectText)
        .join("text")
        .text((d, i) => {return d})
        .attr("x", 1022)
        .attr("y", (d, i) => {
            return 735 - 11*i;
        })
        .attr("font-size", "8px")
    svg.append("g")
        .selectAll("text")
        .data([1])
        .join("text")
        .text("连边数")
        .attr("x", "1000")
        .attr("y", "690")
        .attr("font-size", "8px")
        
}

function draw_graph() {
    preprocess();
    
    // 图布局算法
    let links = data.links;
    let nodes = data.nodes;

    graph_layout_algorithm(nodes, links)
    let link = d3.select("#gLinks").selectAll("line")
    let node = d3.select("#gNodes").selectAll("circle")
    let text = d3.select("#gText").selectAll("text")

    // 绘制links, nodes和text的位置
    link
        .attr("x1", d => nodes_dict[d.source].x)
        .attr("y1", d => nodes_dict[d.source].y)
        .attr("x2", d => nodes_dict[d.target].x)
        .attr("y2", d => nodes_dict[d.target].y)
        
        
    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        
    text
        .attr("x", d => d.x)
        .attr("y", d => d.y)
    
}

function main() {
    d3.json(data_file).then(function (DATA) {
        data = DATA;
        draw_graph();
    })

}

main()