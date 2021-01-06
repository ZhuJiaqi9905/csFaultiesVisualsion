let pict3_margin = ({top: 20, right: 20, bottom: 20, left: 265});
let pg_label = null;
function drawPict3(nData, threshold = 4){
    let data = {
      nodes: null,
      links: null
    }
    // g_allSchool
    //过滤neighbors小于等于4的结点
    // let threshold = 4;
    let v = nData.nodes.filter((d) => {
      if(g_allSchool.find(e => {
        return e == d.id
      })){
        return true;
      }
      return d.neighbors > threshold;
    }).map((d)=>{
      
      return Number(d.weight)
    })
    // console.log(v)
    // console.log(v.sort((a, b) => { return a - b}))
    data.nodes = nData.nodes.filter((d) => {
        return d.neighbors > threshold;
      }).map((d) => {
        if(d.weight<=15){
          return {id: d.id, group: 1}
        }else if(d.weight <= 30){
          return {id: d.id, group: 2}
        }else if(d.weight <= 45){
          return {id: d.id, group: 3}
        }else if(d.weight <= 60){
          return {id: d.id, group: 4}
        }else{
          return {id: d.id, group: 5}
        }
      });
    data.links = nData.links.filter((d) => {
        return d.sNeighbors > threshold && d.tNeighbors > threshold
      }).map((d) => {return {source: d.source, target: d.target, value: d.weight}});
      
    // console.log(data)
    
    let graph = getGraph(data);
    let step = 12;
    let height = (data.nodes.length - 1) * step + pict3_margin.top + pict3_margin.bottom
    let y = d3.scalePoint(graph.nodes.map(d => d.id).sort(d3.ascending), [pict3_margin.top, height - pict3_margin.bottom]);
    
    let color = d3.scaleOrdinal(graph.nodes.map(d => d.group).sort(d3.ascending), d3.schemeCategory10);
    
    let form = order();
    return function (){
        
        let svg = d3.select("#pict3").select("svg");
        // svg.on("mouseout", (e, d) => {
        //   g_findAndHighlightRect("", "false");
        // })
        //画毕业生数量的矩形标注
        let g = svg.append("g").attr("name", "stuNum")
        g.selectAll("rect")
          .data([1, 2, 3, 4, 5])
          .join("rect")
          .attr("fill", "rgba(45, 33, 224, 0.925)")
          .attr("height", 10)
          .attr("width", 20)
          .attr("x", (d, i) => {
            return 380 + 20.5 * i;
          })
          .attr("y", (d) => {return 0}
          )
          .attr("fill", (d) => {
              return color(d);
          })
       
        g.append("g")
        .selectAll("text")
        .data([0, 15, 30, 45, 60, "60以上"])
        .join("text")
        .text((d, i) => {return d})
        .attr("x", (d, i) => {
            return 375 + 20.5*i;
        })
        .attr("y", "20")
        .attr("font-size", "10px")
        
        let box = g.append("g")
        
        box.selectAll("text")
        .data(["输入", "输出", "双向"])
        .join("text")
        .text((d) => d)
        .attr("x", 400)
        .attr("y", (d, i) => {
          return 300 + 20.5*i;
        }).attr("font-size", "10px")
        box.selectAll("rect")
            .data([0, 1, 2, 3])
            .join("rect")
            .attr("height", "15")
            .attr("width", "20")
            .attr("x", 425)
            .attr("y", (d) => {
              if(d < 2){
                return 290 + 20*d
              }else{
                return 290 + 20 * 2;
              }
            })
            .attr("fill", (d) => {
              return d%2 == 0 ? "red" : "blue"; 
            })
            .attr("opacity", 0.5)
        box.attr("display", "none")
      g.append("g")
      .selectAll("text")
      .data([1])
      .join("text")
      .text("毕业学生数量")
      .attr("x", "300")
      .attr("y", "8")
      .attr("font-size", "10px")

      svg.append("style").text(`

        .hover path {
        stroke: #ccc;
        }

        .hover text.schoolName {
        fill: #ccc;
        }

        .hover g.primary text {
        fill: black;
        font-weight: bold;
        }

        .hover g.secondary text {
        fill: #333;
        }
        .highlightblack text{
          fill: black;
          font-weight: bold;
        }
        

        .hover path.input{
          stroke:  red;
          stroke-opacity: 0.5;
        }
        .hover path.output{
          stroke: blue;
          stroke-opacity: 0.5;
        }
        
        `);
        
        let label = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
          .selectAll("g")
          .data(graph.nodes)
          .join("g")
            .attr("transform", d => `translate(${pict3_margin.left},${d.y = y(d.id)})`)
            .call(g => g.append("text")
                .classed("schoolName", true)
                .attr("x", -6)
                .attr("dy", "0.35em")
                .attr("fill", d => d3.lab(color(d.group)).darker(2))
                .text(d => d.id))
            .call(g => g.append("circle")
                .attr("r", 3)
                .attr("fill", d => color(d.group)))
              
        pg_label = label;
        let path = svg.insert("g", "*")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1.5)
          .selectAll("path")
          .data(graph.links)
          .join("path")
            .attr("stroke", d => d.source.group === d.target.group ? color(d.source.group) : "#aaa")
            .attr("d", arc);
        
        
        let overlay = svg.append("g")
            .attr("fill", "none")
            .attr("pointer-events", "all")
          .selectAll("rect")
          .data(graph.nodes)
          .join("rect")
            .attr("width", pict3_margin.left + 40)
            .attr("height", step)
            .attr("y", d => y(d.id) - step / 2)
            .on("mouseover", (e, d) => {
              svg.classed("hover", true);
              label.classed("primary", (n) => {
                return n === d});
              label.classed("secondary", n => n.sourceLinks.some(l => l.target === d) || n.targetLinks.some(l => l.source === d));
              
              box.attr("display", "inline")
               
              path.classed("output", l => l.target === d && l.source !== d).filter(".output").raise();
              path.classed("input", l => l.target !== d && l.source === d).filter(".input").raise();
              
            })
            .on("mouseout", (e, d) => {
              svg.classed("hover", false);
              label.classed("primary", false);
              label.classed("secondary", false);
              // path.classed("primary", false).order();
              path.classed("output", false).order()
              path.classed("input", false).order();
              box.attr("display", "none")
            })
            .on("click", (e, d) => {
              g_findAndHighlightRect(d.id, "true")
            })
            

        function update() {
          y.domain(graph.nodes.sort(form.value).map(d => d.id));

          let t = svg.transition()
              .duration(750);

          label.transition(t)
              .delay((d, i) => i * 20)
              .attrTween("transform", d => {
                let i = d3.interpolateNumber(d.y, y(d.id));
                return t => `translate(${pict3_margin.left},${d.y = i(t)})`;
              });

          path.transition(t)
              .duration(750 + graph.nodes.length * 20)
              .attrTween("d", d => () => arc(d));

          overlay.transition(t)
              .delay((d, i) => i * 20)
              .attr("y", d => y(d.id) - step / 2);
        }

        form.addEventListener("input", update);
        // invalidation.then(() => form.removeEventListener("input", update));

        return svg.node();
          
    }
}

function getGraph(data){
    let nodes = data.nodes.map(({id, group}) => ({
      id,
      sourceLinks: [],
      targetLinks: [],
      group
    }));
  
    let nodeById = new Map(nodes.map(d => [d.id, d]));
  
    let links = data.links.map(({source, target, value}) => ({
      source: nodeById.get(source),
      target: nodeById.get(target),
      value
    }));
  
    for (let link of links) {
      let {source, target, value} = link;
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    }
  
    return {nodes, links};
}

function order(){
    let options = [
      {name: "Order by name", value: (a, b) => d3.ascending(a.id, b.id)},
      {name: "Order by group", value: (a, b) => a.group - b.group || d3.ascending(a.id, b.id)},
      {name: "Order by degree", value: (a, b) => -d3.sum(b.sourceLinks, l => l.value) - d3.sum(b.targetLinks, l => l.value) + d3.sum(a.sourceLinks, l => l.value) + d3.sum(a.targetLinks, l => l.value) || d3.ascending(a.id, b.id)}
    ];
    
    let form = document.getElementById("pict3").getElementsByTagName("form")[0]
    let timeout = setTimeout(() => {
      form.i.selectedIndex = 1;
      form.dispatchEvent(new CustomEvent("input"));
    }, 2000);
    form.onchange = () => {
      form.dispatchEvent(new CustomEvent("input")); // Safari
    };
    form.oninput = (event) => {
      if (event.isTrusted) form.onchange = null, clearTimeout(timeout);
      form.value = options[form.i.selectedIndex].value;
    };
    form.value = options[form.i.selectedIndex].value;
    return form;
}

function arc(d) {
  let y1 = d.source.y;
  let y2 = d.target.y;
  let r = Math.abs(y2 - y1) / 2;
  return `M${pict3_margin.left},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${pict3_margin.left},${y2}`;
}