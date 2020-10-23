let data = null;
let data_file = './data/data0.csv';
function main() {
    
    d3.csv(data_file).then(function(DATA) {
        data = DATA;
        //数据预处理
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
        set_ui();// 设置字体
        
        pict1.drawMain(data);
        pict2.drawMain(data);
        
    })
}

main()