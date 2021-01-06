let pict1 = {
    width : 700,
    height: 550,
    padding: {left: 80,
              bottom: 80,
              top: 30,
              right: 50},
    
    x_attr: 'Ph.D. Graduation Year',
    y_attr: 'Publications',
    xScale: null,
    yScale: null,
    //绘制标题
    drawTitle: (svg) => {
        // title
        svg.append('g')
        .attr('transform', `translate(${pict1.padding.left + (pict1.width - pict1.padding.left - pict1.padding.right)/2}, ${pict1.padding.top*0.4})`)
        .append('text')
        .attr('class', 'title')
        .text('Relation Between Ph.D. Graduation Year and Publications')
        .attr('font-size', 40)

    },
    //绘制坐标轴
    drawAxis: (data) => {
        // x axis - phd graduation year
        let svg = d3.select("#pict1");
        pict1.xScale = d3.scaleLinear()  //是一个映射，用来计算每个点的位置
            .domain(get_min_max(data, pict1.x_attr))
            .range([pict1.padding.left, pict1.width - pict1.padding.right]);   

        let axis_x = d3.axisBottom()//创建一个底部的水平坐标轴。这个是可以显示到网页上的
        .scale(pict1.xScale)//把axis和x绑定
        .ticks(10)//10个刻度
        .tickFormat(d => d);
        // x axis
        svg.append('g')
        .attr('transform', `translate(${0}, ${pict1.height - pict1.padding.bottom})`)
        .call(axis_x)//更改坐标轴的位置等属性
        .attr('font-family', fontFamily)
        .attr('font-size', '0.8rem')

        svg.append('g')
        .attr('transform', `translate(${pict1.padding.left + (pict1.width - pict1.padding.left - pict1.padding.right)/2}, ${pict1.height - pict1.padding.bottom})`)
        .append('text')
        .attr('class', 'axis_label')
        .attr('dx', '-0.4rem')
        .attr('dy', 0.08*pict1.height)
        .text(pict1.x_attr);

        // y axis - publications
        pict1.yScale = d3.scaleLinear()//是一个映射，用来计算每个点的位置
                    .domain(get_min_max(data, pict1.y_attr))
                    .range([pict1.height - pict1.padding.bottom, pict1.padding.top]);
           
        let axis_y = d3.axisLeft()//创建垂直的轴。刻度信息在轴的左侧
                        .scale(pict1.yScale)
                        .ticks(10)
                        .tickFormat(d => d);
        // y axis
        svg.append('g')        
            .attr('transform', `translate(${pict1.padding.left}, ${0})`)
            .call(axis_y)
            .attr('font-family', fontFamily)
            .attr('font-size', '0.8rem')
        svg.append('g')
            .attr('transform', `
                translate(${pict1.padding.left}, ${pict1.height/2})
                rotate(-90)    
            `)
            .append('text')
            .attr('class', 'axis_label')
            .attr('dy', -pict1.height*0.07)
            .text(pict1.y_attr)
            .attr('font-size', 50)
    },
    drawPoints:(data) => {
        let g = d3.select("#pict1g")       
        g.selectAll('circle')
        .data(data)
        .join("circle")
        .attr('class', (d, i) => {
            let name = d["First Name"] + d["Mid Name"] + d["Last Name"];
            return name;
        })
        .classed('circle', true)
        .attr('cx', (d, i) => {
            return pict1.xScale(parseInt(d[pict1.x_attr]));
        })
        .attr('cy', (d, i) => pict1.yScale(parseInt(d[pict1.y_attr])))
        .attr('r', 2)
        .attr('fill', '#0077AA')
        .attr('opacity', 0.7)
        .on('mouseover', (e, d) => {

            // console.log('e', e, 'd', d)
            //平行坐标的线高亮
            let className = d["First Name"] + d["Mid Name"] + d["Last Name"] + " line";
            let element =  document.getElementsByClassName(className)[0]
    
             let childs = element.children;
             
             for(let i = 0; i < childs.length; i++){
                 childs[i].setAttribute("opacity", 1)
                 childs[i].setAttribute("stroke", "black")
                 childs[i].setAttribute("stroke-width", 1)
             }
             // show a tooltip
             let name = d['First Name'] + ' ' + d['Mid Name'] + ' ' + d['Last Name'];
             let institution = d['Institution'];
             let grad_year = d['Ph.D. Graduation Year'];
             let grad_school = d['Ph.D. Graduate School'];
            
             let infoArray = [name, institution, grad_year, grad_school]
            // tooltip
            let tooltip = document.getElementById("mytooltip");
            let trs = tooltip.getElementsByTagName("tr");
            for(let i = 0; i < trs.length; i++){
                let td = trs[i].getElementsByTagName("td")[1];
                td.appendChild(document.createTextNode(infoArray[i]));
            }
        })
        .on('mouseout', (e, d) => {
            //平行坐标的线取消高亮
           let className = d["First Name"] + d["Mid Name"] + d["Last Name"] + " line";
           let element =  document.getElementsByClassName(className)[0]
    
            let childs = element.children;
            
            for(let i = 0; i < childs.length; i++){
                childs[i].setAttribute("opacity", 0.4)
                childs[i].setAttribute("stroke", pict2.colorSet[i])
                childs[i].setAttribute("stroke-width", 0.5)
            }
    
            // remove tooltip
           
            let tooltip = document.getElementById("mytooltip");
            let trs = tooltip.getElementsByTagName("tr");
            for(let i = 0; i < trs.length; i++){
                let td = trs[i].getElementsByTagName("td")[1];
                td.removeChild(td.firstChild);
             //   td.appenChild(document.createTextNode(infoArray[i]));
            }
        })    
    },
    drawMain: (data) => {
        let svg = d3.select('#pict1')
                    .attr('width', pict1.width)
                    .attr('height', pict1.height)
        
        pict1.drawAxis(data)
        pict1.drawPoints(data)
    },
    mainFunc: (data_file) => {
        //便于在画每个图时候调试
        d3.csv(data_file).then(function(DATA) {
            data = DATA;
            // remove data without x_attr or y_attr
            data = data.filter((d, i) => (d['Ph.D. Graduation Year'] != '' && d['Publications'] != ''));
            set_ui();
            pict1.drawMain(data);
        })        
    } 
}