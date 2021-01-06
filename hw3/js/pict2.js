var dataOri = null;
let fontFamily;
const data_file = "./data/data.csv";

const g_textFontSize = 13;
const g_rateForFontSize = 16; // 13 是看出来的
const g_ALL = "All";
const g_OTHER = "Others";
let g_schoolData = new Map(); // 所有的学校的研究方向汇总保存在 g_ALL("All") 中
let g_updateBarChart;
let g_findAndHighlightRect;
const g_allRegions = []; // 所有的领域, 把 "Others" 放在了最后面
const g_allSchool = [];
// 大小常数
const g_pixelHeight = 400,
    g_pixelWidth = 400;
const g_barHeight = 600,
    g_barWidth = 500;

/**
 * 设置字体
 */
function setUI() {
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily)
        .style("font-size", g_textFontSize + "px");
}

/**
 * 像素方法绘制结果
 */
function drawPixel() {
    // 获取所有的学校
    for (let i of g_schoolData.keys()) {
        if (i != g_ALL) {
            g_allSchool.push(i);
        }
    }
    g_allSchool.sort((a, b) => (a < b ? -1 : 1));
    g_allSchool.push(g_ALL);
    g_allRegions.pop();
    // 画图(现在先绘制横向为一个学校的)
    svg = d3.select("#container").append("svg");
    svg.attr("height", g_pixelHeight).attr("width", g_pixelWidth);
    svg.attr("id", "pic2_pixel")
    // 通用的大小
    let width = Math.min(g_pixelHeight, g_pixelWidth) * 0.8;
    // margin
    margin = 0.09 * width;
    // 比例函数
    let widthScale = d3
        .scaleLinear()
        .domain([0, g_allRegions.length])
        .range([margin, width - margin]);
    let heightScale = d3
        .scaleLinear()
        .domain([0, g_allSchool.length])
        .range([margin, width - margin]);
    const cube = {
        w: (widthScale(1) - widthScale(0)) * 0.9,
        h: (heightScale(1) - heightScale(0)) * 0.9,
    };
    // 绘制
    // 文字
    svg.append("text")
        .text("Institutions")
        .attr("text-anchor", "middle")
        .style("font-size", Math.min(1.5 * g_textFontSize, g_textFontSize + 10))
        .attr(
            "transform",
            // 后面的先变换
            `translate(${margin * 1.5},${width / 2}) rotate(-90)`
        );
    svg.append("text")
        .text("Research Area")
        .attr("x", width / 2 + margin)
        .attr("text-anchor", "middle")
        .style("font-size", Math.min(1.5 * g_textFontSize, g_textFontSize + 10))
        .attr("y", margin * 0.8);
    const t_toolTip = d3
        .select("#pixelToolTip")
        .style("font-size", g_textFontSize * 1.1 + "px");
    svg.selectAll("g")
        .data(g_allSchool)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(${margin},${heightScale(i)})`)
        .attr("schoolID", (d, i) => i)
        .on("click", (e, d) => {
            g_updateBarChart(d);
        // 对于每一行(学校)生成每一个领域对应的 rect
        })
        .selectAll("rect")
        .data(g_allRegions)
        .enter()
        .append("rect")
        .attr("height", cube.h)
        .attr("width", cube.w)
        .attr("x", (d, i) => widthScale(i))
        .attr("y", 0)
        .attr("schoolID", function (d) {
            g_allSchool[Number(d3.select(this.parentNode).attr("schoolID"))];
        })
        .attr("fill", function (d) {
            let school =
                g_allSchool[
                Number(d3.select(this.parentNode).attr("schoolID"))
                ];
            return value2color(school, Number(g_schoolData.get(school).get(d)));
        })
        .on("mouseover", function (e, d) {

            

            let school =
                g_allSchool[
                Number(d3.select(this.parentNode).attr("schoolID"))
                ];
                pg_label.classed("highlightblack", (n) => {
                    return n.id === school})
            let content =
                "<table><tr><td>Institution</td><td>" +
                school +
                "</td></tr>" +
                "<tr><td>Area</td><td>" +
                d +
                "</td></tr>" +
                "<tr><td>Numbers</td><td>" +
                g_schoolData.get(school).get(d) +
                "</td></tr></table>";
            t_toolTip
                .html(content)
                .style("visibility", "visible")
                .style("top", e.pageY + cube.h + "px")
                .style("left", e.pageX + cube.w + "px");
        })
        .on("mouseout", () => {
            t_toolTip.style("visibility", "hidden");
            pg_label.classed("highlightblack", false);
        });
    // 两个比例尺
    // let t_g1 = svg
    //     .append("g")
    //     .attr(
    //         "transform",
    //         `translate(${margin},${heightScale(g_allSchool.length)})`
    //     );
    // t_g1.append("text")
    //     .text(273)
    //     .attr("transform", `translate(${margin},${cube.h})`);
    // t_g1.append("text")
    //     .text(24)
    //     .attr("transform", `translate(${width - margin - cube.w},${cube.h})`);
    let t_g2 = svg
        .append("g")
        .attr(
            "transform",
            `translate(${margin},${heightScale(g_allSchool.length + 2)})`
        );
    // 渐变
    t_lg = t_g2.append("linearGradient").attr("id", "LG1");
    t_lg.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", value2color("", 36));
    t_lg.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", value2color("", 0));
    t_g2.append("rect")
        .attr("width", width - 2 * margin)
        .attr("height", cube.h)
        .attr("fill", "url(#LG1)")
        .attr("transform", `translate(${margin},${-cube.h})`);
    t_g2.append("text")
        .text(36)
        .attr("transform", `translate(${margin},${cube.h})`);
    t_g2.append("text")
        .text(0)
        .attr("transform", `translate(${width - margin - cube.w},${cube.h})`);
    // 高亮的 rect(覆盖问题)
    let t_g3 = svg.append("g").attr("transform", `translate(${margin},0)`);
    let t_rectHighlight = t_g3
        .append("rect")
        .attr("width", 1.1 * (width - margin * 2))
        .attr("height", cube.h * 1.1)
        .attr("x", margin * 0.5)
        .attr("stroke-width", 2)
        .attr("fill", "transparent")
        .attr("stroke", "gray")
        .style("visibility", "hidden")
        .on("click", (e, d) => {
            g_findAndHighlightRect("", false);
        })

    g_findAndHighlightRect =
        /**
         * 高亮 rect, 如果找不到学校的话, 取消高亮(也可以用这种方式消除高亮)
         * @param school 查找的学校
         * @param updateBarChart 是否更新整个 BarChart
         */
        function findAndHighlightRect(school, updateBarChart) {
            let index = g_allSchool.indexOf(school);
            if (index == -1) {
                t_rectHighlight.style("visibility", "hidden");
            } else {
                t_rectHighlight
                    .attr("transform", `translate(0,${heightScale(index)})`)
                    .style("visibility", "visible");
                if (updateBarChart) {
                    g_updateBarChart(school);
                }
            }
        };
    /**
     * 数值到颜色的转换
     */
    function value2color(school, val) {
        if (school === g_ALL) {
            return d3.interpolateRgb(
                d3.rgb(127, 255, 0),
                d3.rgb(34, 187, 34)
            )(val / 274);
        }
        /*
         * 0 - 35
         * 0 - 273
         */
        return d3.interpolateRgb(
            d3.rgb(255, 255, 255),
            d3.rgb(255, 0, 0)
        )(val / 36);
    }
}

/**
 * 数据预处理
 */
function preprocess() {
    allDataAnalysis();
    calcRegionsForEverySchool();
}

/**
 * 为每一个学校计算每一个领域的人数
 */
function calcRegionsForEverySchool() {
    // 获取所有的学校
    let t_set = new Set();
    const school_str = dataOri.columns[1];
    let t_length = dataOri.length;
    for (let i = 0; i < t_length; ++i) {
        t_set.add(dataOri[i][school_str]);
    }
    // 为每一个学校构建一个 Map
    for (let item of t_set) {
        // 返回的是一个迭代器
        let t_mapAllKeys = g_schoolData.get(g_ALL).keys();
        let t_map = new Map();
        for (let key of t_mapAllKeys) {
            t_map.set(key, 0);
        }
        g_schoolData.set(item, t_map);
    }
    // 根据每一条数据开始生成每一个学校的数据
    const interest_str = dataOri.columns[6];
    t_length = dataOri.length;
    for (let i = 0; i < t_length; ++i) {
        let t_school_map = g_schoolData.get(dataOri[i][school_str]);
        t_interest = String(dataOri[i][interest_str]).split(",");
        for (j in t_interest) {
            let j_interest = t_interest[j];
            if (j_interest === "") {
                j_interest = g_OTHER;
            }
            t_school_map.set(j_interest, t_school_map.get(j_interest) + 1);
        }
    }
}

/**
 * 全局分析数据, 并且生成所有人的研究兴趣
 * 保存在 g_schoolData.get(g_ALL) 中
 * 如果一个人有多个研究方向, 将他视作多个人
 */
function allDataAnalysis() {
    t_map = new Map();
    g_schoolData.set(g_ALL, t_map);
    let interest_str = dataOri.columns[6];
    let t_length = dataOri.length;
    for (let i = 0; i < t_length; ++i) {
        t_interest = String(dataOri[i][interest_str]).split(",");
        for (j in t_interest) {
            let j_interest = t_interest[j];
            if (j_interest === "") {
                j_interest = g_OTHER;
            }
            j_val = t_map.get(j_interest);
            if (j_val === undefined) {
                t_map.set(j_interest, 1);
            } else {
                t_map.set(j_interest, j_val + 1);
            }
        }
    }
    drawBarChart();
}

/**
 * 绘制所有领域研究人员数目的分布图的分布图
 */
function drawBarChart() {
    // 降序排列
    const order = (a, b) => (a.value < b.value ? 1 : -1);
    data = [];
    let t_mapAllEntries = g_schoolData.get(g_ALL).entries();
    for (let [k, v] of t_mapAllEntries) {
        // TODO 去除 ""
        if (k === g_OTHER) {
            continue;
        }
        data.push({ key: k, value: v });
    }
    data = data.sort(order);
    for (i in data) {
        if (data[i] != g_OTHER) {
            g_allRegions.push(data[i].key);
        }
    }
    // g_allRegions.push(g_OTHER);

    let svg = d3.select("#container").append("svg");
    svg.attr("height", g_barHeight).attr("width", g_barWidth);
    let margin = {
        top: 50,
        right: 0,
        bottom: 30,
        left: g_textFontSize * g_rateForFontSize,
    };
    let height = 800,
        width = 600;
    svg.attr("viewBox", [0, 0, width, height]);
    // x,y 伸缩函数(比例尺)
    const x = d3
        // 序数比例尺
        // scaleBand会将一组离散的定义域映射到一组线性的定义域中
        // 根据定义域中的值将值域分割为几个均匀的分段, 并返回分段中的第一个值
        // 定义域的顺序就是按照原始的排序(不会重新排序)
        .scaleBand()
        .domain(data.map((d) => d.key))
        .range([margin.top, height - margin.bottom])
        // paddingInner: 每一个 bind 之间的间隔(百分比)
        // paddingOuter: 最后一个 bind 之后以及第一个 bind 之前的间隔(百分比)
        // padding: paddingInner 和 paddingOuter 设置成相同值
        .padding(0.1);
    const y = d3
        // 线性映射
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        // 定义域会变成比较工整的形式, 但不是四舍五入
        .nice()
        .range([margin.left, width - margin.right]);

    // x,y 轴
    const xAxis = (g) =>
        g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(x).tickSizeOuter(0))
            .attr("font-size", g_textFontSize);

    const yAxis = (g) =>
        g.attr("transform", `translate(0,${margin.top})`).call(d3.axisTop(y));
    // 移除 y 轴的直线
    // .call((g) => g.select(".domain").remove());
    // 每一个柱形
    const t_toolTip = d3.select("#pixelToolTip");
    const bar = svg
        .append("g")
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .style("mix-blend-mode", "multiply")
        .attr("y", (d) => x(d.key))
        .attr("x", y(0))
        .attr("width", (d) => y(d.value) - y(0))
        .attr("height", x.bandwidth())
        .on("mouseover", function (e, d) {
            // console.log(e)
            t_toolTip
                .html(d.value)
                .style("visibility", "visible")
                .style("top", e.pageY + 10 + "px")
                .style("left", e.pageX + 10 + "px");
        })
        .on("mouseout", () => t_toolTip.style("visibility", "hidden"));
    // 画坐标轴
    const gx = svg.append("g").call(xAxis);
    const gy = svg.append("g").call(yAxis);

    g_updateBarChart =
        /**
         * 更新柱状图
         * 更新的时候先向中间/一边收拢, 再分开
         */
        function (schoolName) {
            // 新的 data
            t_data = [];
            let t_mapAllEntries = g_schoolData.get(schoolName).entries();
            for (let [k, v] of t_mapAllEntries) {
                // TODO 去除 ""
                if (k === g_OTHER) {
                    continue;
                }
                t_data.push({ key: k, value: v });
            }
            const t = svg.transition().duration(1000);
            // 新的 x 坐标变换
            x.domain(t_data.sort(order).map((d) => d.key));
            let halfLength = Math.floor(t_data.length / 2);
            gx.transition(t).call(xAxis).selectAll(".tick");
            // 柱状图变换 1
            // const maxWidth = y.range()[1];
            let y0 = y(0);
            let oldData = bar.data();
            bar.data(t_data, (d) => d.key)
                .order()
                .transition(t)
                // 两边的优先收拢
                // .delay(function (d) {
                //     let pos = oldData.indexOf(d);
                //     pos = pos > halfLength ? halfLength - pos : pos;
                //     return pos * 20;
                // })
                // .attr("y", () => x(t_data[halfLength].key))
                // 向一边收拢
                .delay((d) => (halfLength - oldData.indexOf(d)) * 20)
                .attr("y", () => x(t_data[0].key))
                // .attr("y", (d) => x(d.key))
                // overflow:hidden 实现了这一点
                // .attr("width", (d) => Math.min(y(d.value), maxWidth) - y0);
                .attr("width", (d) => y(d.value) - y0);
            // 新的 y 坐标变换
            y.domain([0, Math.max(d3.max(t_data, (d) => d.value) * 1.1, 8)])
                .nice()
                .range([margin.left, width - margin.right]);
            y0 = y(0);
            // 柱状图变换 2
            setTimeout((t) => {
                gy.transition(t).call(yAxis).selectAll(".tick");
                bar.order()
                    .transition()
                    .duration(1000)
                    .attr("y", (d) => x(d.key))
                    .attr("width", (d) => y(d.value) - y0);
            }, halfLength * 20 + 1000);
        };
}

/**
 * main() 运行入口
 */
function main2() {
    // d3.csv(data_file).then(function (DATA) {
    //     dataOri = DATA;
    //     setUI();
    //     preprocess();
    //     drawPixel();
    // });
}

main2();

// 辅助函数, 获取某个属性的最大最小值(预先剔除没有这个属性的元素)
function getMinMax(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach((d) => {
        let v = parseInt(d[attr]);
        if (v > max) max = v;
        if (v < min) min = v;
    });
    console.log("attr", attr, "min", min, "max", max);
    return [min, max];
}
