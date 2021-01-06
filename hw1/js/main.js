let data = null;
let wholeData = null;
let data_file = './data/data.csv';
function main() {
    
    d3.csv(data_file).then(function(DATA) {
        wholeData = DATA;
        //数据预处理
        wholeData = wholeData.filter((d, i) => {
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
        set_ui();// 设置字体
        data = wholeData;
        pict1.drawMain(data);
        pict2.drawMain(data);
        
    })
}
main()