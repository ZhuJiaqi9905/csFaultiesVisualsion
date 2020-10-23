
function main() {
    d3.csv(data_file).then(function(DATA) {
        data = DATA;

        // remove data without x_attr or y_attr
        data = data.filter((d, i) => (d[x_attr] != '' && d[y_attr] != ''));
        set_ui();
        draw_main();
    })
}

//main()