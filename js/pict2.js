// console.log(window_height)
// console.log(window_width)
//picture in the up right
let pict2 = {
    width: 700,
    height: 600,
    yAttrs: ["H-index", "Citations", "Publications", "Publications Divided by Co-authors"],
    padding : {
        'left': 50,
        'bottom': 0,
        'top': 10,
        'right': 50,
    },
    xScales : [],
    yScale: null,
    colorSet:['rgb(205, 220, 57)',
                 'rgb(76, 172, 81)',
                 'rgb(0, 150, 136)'], 
    highlightColorSet: [
        'rgb(248, 252, 57)',
        'rgb(117, 252, 124)',
        'rgb(2, 236, 213)'
    ],
    //画坐标轴
    drawAxis: (svg, data) =>{
        //画y轴
        pict2.yScale = d3.scaleBand()
                        .domain(pict2.yAttrs)
                        .range([pict2.padding.bottom, pict2.height - pict2.padding.bottom])

        let start = 0;
        let step = pict2.yScale.step();
        let g = svg.append('g')
        g.append('text')
            .attr('transform', `translate(${pict2.padding.left - 5}, ${start})`)
            .text("H-index")
            .attr("text-anchor", "end")
            .attr('font-family', fontFamily)
            .attr('font-size', 20)
        g.append('text')
            .attr('transform', `translate(${pict2.padding.left - 5}, ${start + step})`)
            .text("Citations")
            .attr("text-anchor", "end")
            .attr('font-family', fontFamily)
            .attr('font-size', 20)
        g.append('text')
            .attr('transform', `translate(${pict2.padding.left - 5}, ${start + 2 * step})`)
            .text("Publications")
            .attr("text-anchor", "end")
            .attr('font-family', fontFamily)
            .attr('font-size', 20)
        g.append('text')
            .attr('transform', `translate(${pict2.padding.left - 5}, ${start + 3 * step})`)
            .text(`Publications Divided`)
            .attr("text-anchor", "end")
            .attr('font-family', fontFamily)
            .attr('font-size', 20)
        g.append('text')
            .attr('transform', `translate(${pict2.padding.left - 5}, ${start + 3 * step + 20})`)
            .text("by Co-authors")
            .attr("text-anchor", "end")
            .attr('font-family', fontFamily)
            .attr('font-size', 20)
        //画x轴
        let n = pict2.yAttrs.length;
        for(let i = 0; i < n; i++){
            let xScale = d3.scaleLinear()
                            .domain(get_min_max(data, pict2.yAttrs[i]))
                            .range([pict2.padding.left, pict2.width - pict2.padding.right])
            pict2.xScales.push(xScale)
            let xAxis = d3.axisBottom()
                        .scale(xScale)
            svg.append('g')
                .attr('transform', `translate(${0}, ${ pict2.yScale(pict2.yAttrs[i])})`)
                .call(xAxis)
                .attr('font-family', fontFamily)
                .attr('font-size', '0.7rem')
        }
    },
    //画每一条线
    drawLines: (svg, data) => {
        let g = svg.append('g')
        let gLines = g.selectAll('.line')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('class', (d, i) => {
                            let name = d["First Name"] + d["Mid Name"] + d["Last Name"];
                            return name;
                        })
                        .classed("line", true)
        let n = pict2.yAttrs.length;
        for(let i = 0; i < n - 1; i++){
            gLines.append("line")
                    .attr("x1",(d) =>{
                        return  pict2.xScales[i](d[pict2.yAttrs[i]])
                        })
                    .attr("y1", pict2.yScale(pict2.yAttrs[i]))
                    .attr("x2", (d) => {
                        return pict2.xScales[i + 1](d[pict2.yAttrs[i + 1]])
                    })
                    .attr("y2", pict2.yScale(pict2.yAttrs[i + 1]) )
                    .attr("opacity", 0.4)
                    .attr("stroke-width", 0.5)
                    .attr("stroke-linecap", "round")
                    .attr("stroke", pict2.colorSet[i]);

        }
    },
    //画标题
    draw_title: (svg) => {
        let x_scale = pict2.x_scale;
        let x_pos = pict2.x_pos;
        let x_attrs = pict2.x_attrs;
        let padding = pict2.padding;      
        svg.append('g')
            .append('text')
            .text('personal infomation')
            .attr('transform', `translate(${x_pos + padding.left }, ${padding.top / 2})`)
            .attr('font-size', 10)
    },
    
    drawMain: (data) => {
        let svg = d3.select("#pict2")
                    .attr('width', pict2.width)
                    .attr('height', pict2.height)
        pict2.drawAxis(svg, data)
        pict2.drawLines(svg, data)
    },
    mainFunc: (data_file) => {
        d3.csv(data_file).then(function(DATA) {
            data = DATA;
            

            data = data.filter((d, i) => {
                if(d['Ph.D. Graduation Year'] === '' || d['Publications'] === ''){
                    return false;
                }
                let n = pict2.yAttrs.length;
                for(let i = 0; i < n; i++){
                    if( Number.isNaN(Number(d[pict2.yAttrs[i]]))){
                        return false;
                    }
                }
                return true;
            })
        
        pict2.drawMain(data);
        })

    }

    

}
pict2.mainFunc(data_file);