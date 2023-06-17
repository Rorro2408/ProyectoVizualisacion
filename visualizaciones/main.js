const WIDTH = 800;
const HEIGHT = 600;

const SVG1 = d3.select("#vis-1").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const SVG2 = d3.select("#vis-2").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const SVG3 = d3.select("#vis-3").append("svg").attr("width", WIDTH).attr("height", HEIGHT);

const PATHDATASET = "../Complete_song_data_no_duplicates.csv";

const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
};

d3.csv(PATHDATASET).then(function(data_csv){
    var h = HEIGHT - margin.top - margin.bottom;
    var w = WIDTH - margin.right - margin.bottom;
    console.log(data_csv[0]);
    const rangoDuracion = d3.extent(data_csv, (d) => {
        let duracion = parseInt(d.duration);
        return duracion/1000;
    });
    const rangoAnos = d3.extent(data_csv, (d) => {
        let ano = parseInt(d.release_date);
        return ano;
    });
    console.log(rangoDuracion);
    console.log(rangoAnos);

    const escalaDuracion = d3.scaleLinear().domain([0, rangoDuracion[1]]).range([h, 0]);
    const escalaAnos = d3.scaleLinear().domain(rangoAnos).range([0, w]);

    const ejeX = d3.axisBottom(escalaAnos).ticks(16);
    const ejeY = d3.axisLeft(escalaDuracion).ticks(16);

    SVG3.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .append("g")
    .attr("class", "y axis")
    .call(ejeY);

    SVG3.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate(0,' + h + ')')
    .call(ejeX);

    SVG3.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .selectAll("circle")
      .data(data_csv)
      .join("circle")
      .attr("cx", (d, i, _) => escalaAnos(d.release_date))
      .attr("cy", (d, i , _) => escalaDuracion(d.duration/1000))
      .attr("r", 2)
      .attr("class", (d, i, _) => d.genre)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const dataGroupedByYearAndGenre = d3.groups(data_csv, d => parseInt(d.release_date), d => d.genre);
    console.log(dataGroupedByYearAndGenre);
    console.log(dataGroupedByYearAndGenre[0]);
    console.log(dataGroupedByYearAndGenre[0][1])

    //let testMean = d3.mean(dataGroupedByYearAndGenre[0][1], (d) => d.popularity);
    //console.log(testMean);

    SVG2.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .selectAll("circle")
        .data(dataGroupedByYearAndGenre)
        .join("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("transform", (d, i, _) => "translate(" + escalaAnos(d[0]) + ", 0)")
        .data((d, i, _) => {
            console.log("loading data")
            console.log(d)
            console.log(dataGroupedByYearAndGenre[1]);
            return dataGroupedByYearAndGenre[1];
        })
        .join("circle")
        .attr("cx", 0)
        .attr("cy", (d, i , _) => {
            console.log("Inside the data join");
            console.log(d);
            return 5;
        })

});