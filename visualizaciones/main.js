const WIDTH = 800;
const HEIGHT = 600;

const SVG1 = d3.select("#vis-1").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const SVG2 = d3.select("#vis-2").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const SVG3 = d3.select("#vis-3").append("svg").attr("width", WIDTH + 180).attr("height", HEIGHT)
    .style("border", '1px solid')
    .style("margin", '10px 10px');


const PATHDATASET = "../Complete_song_data_no_duplicates.csv";

const MARGIN = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
};

const HEIGHTVIS = HEIGHT - MARGIN.top - MARGIN.bottom;
const WIDTHVIS = WIDTH - MARGIN.right - MARGIN.left;

// Cleamos nuestro clip que oculta todo lo que está fuera del rect
SVG3
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", WIDTHVIS)
    .attr("height", HEIGHTVIS);

const SVG3_HIJO = SVG3
    .append("g")
    .attr("width", WIDTHVIS)
    .attr("height", HEIGHTVIS)
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
    .attr("clip-path", "url(#clip)");

// var tooltip_SVG1 = d3
//     .select("body")
//     .append("div")
//     .attr("class", "tooltip")
//     .style("position", "absolute")
//     .style("visibility", "hidden")
//     .style("background-color", "white")
//     .style("border", "solid")
//     .style("border-width", "2px")
//     .style("padding", "10px");

// SVG1.on("mousemove", function (event, d) {
//     var mousePosition = d3.pointer(event);
//     tooltip_SVG1.style("top", mousePosition[1] + "px").style("left", mousePosition[0] + "px");
// });

d3.csv(PATHDATASET).then(function (data_csv) {
    var h = HEIGHTVIS;
    var w = WIDTHVIS;
    console.log(data_csv[0]);
    const rangoDuracion = d3.extent(data_csv, (d) => {
        let duracion = parseInt(d.duration);
        return duracion / 1000;
    });
    const rangoAnos = d3.extent(data_csv, (d) => {
        let ano = parseInt(d.release_date);
        return ano;
    });
    console.log(rangoDuracion);
    console.log(rangoAnos);

    const escalaDuracion = d3.scaleLinear().domain([0, rangoDuracion[1]]).range([h, 0]);
    const escalaAnos = d3.scaleLinear().domain(rangoAnos).range([10, w - 10]);

    const ejeX = d3.axisBottom(escalaAnos).ticks(16);
    const ejeY = d3.axisLeft(escalaDuracion).ticks(16);


    const contenedorEjeY = SVG3.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        .append("g")
        .attr("class", "y axis")
        .call(ejeY);

    const contenedorEjeX = SVG3.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        .append("g")
        .attr("class", "x axis")
        .attr('transform', 'translate(' + - 10 + ',' + h + ')')
        .call(ejeX);

    const circles = SVG3_HIJO.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        .selectAll("circle")
        .data(data_csv)
        .join("circle")
        .attr("cx", (d, i, _) => escalaAnos(d.release_date))
        .attr("cy", (d, i, _) => escalaDuracion(d.duration / 1000))
        .attr("r", 2)
        .attr("class", (d, i, _) => d.genre)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    contenedorEjeX.call(ejeX);
    contenedorEjeY.call(ejeY);


    const dataGroupedByYearAndGenre = d3.groups(data_csv, d => parseInt(d.release_date), d => d.genre);
    console.log(dataGroupedByYearAndGenre);
    console.log(dataGroupedByYearAndGenre[0]);
    console.log(dataGroupedByYearAndGenre[0][1])

    const manejadorZoom = (evento) => {
        const transformacion = evento.transform;
        // Ajustamos escalas. Esta función solo sirve con escalas continuas.
        const escalaY2 = transformacion.rescaleY(escalaDuracion);
        // Actualizamos las escalas en la visualización
        contenedorEjeY.call(ejeY.scale(escalaY2));

        // Ajustamos escalas. Esta función solo sirve con escalas continuas.
        const escalaX2 = transformacion.rescaleX(escalaAnos);
        // Actualizamos las escalas en la visualización
        contenedorEjeX.call(ejeX.scale(escalaX2));

        circles.attr("transform", transformacion);
    };

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("start", () => console.log("Empecé"))
        .on("zoom", manejadorZoom)
        .on("end", () => console.log("Terminé"));

    SVG3.call(zoom);

    // Agrega el texto de información para mostrar en el hover
    var infoTextSong = SVG3.append("text")
        .attr("x", 810)
        .attr("y", 20)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextArtist = SVG3.append("text")
        .attr("x", 810)
        .attr("y", 35)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextYear = SVG3.append("text")
        .attr("x", 810)
        .attr("y", 50)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextDuration = SVG3.append("text")
        .attr("x", 810)
        .attr("y", 65)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextDanceability = SVG3.append("text")
        .attr("x", 810)
        .attr("y", 80)
        .style("font-size", "12px")
        .style("fill", "black");

    circles
        .on("mouseover", function (d, i) {
            circles
                .filter(function (d, i) {
                    return i !== d3.select(this).data()[0];
                })
                .attr("opacity", 0.3);

            d3.select(this).attr("opacity", 1);

            infoTextSong.text(`Canción: ${d.fromElement.__data__.track_name}`);
            infoTextArtist.text(`Artista: ${d.fromElement.__data__.artist_name}`);
            infoTextYear.text(`Año de lanzamiento: ${d.fromElement.__data__.release_date}`);
            infoTextDuration.text(`Duración: ${d.fromElement.__data__.duration}`);
            infoTextDanceability.text(`Daceabilidad: ${d.fromElement.__data__.danceability}`);
        })
        .on("mouseout", function () {
            circles.attr("opacity", 1);

            infoTextSong.text("");
            infoTextArtist.text("");
            infoTextYear.text("");
            infoTextDuration.text("");
            infoTextDanceability.text("");
        });


    //let testMean = d3.mean(dataGroupedByYearAndGenre[0][1], (d) => d.popularity);
    //console.log(testMean);

    SVG2.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        .selectAll("circle")
        .data(dataGroupedByYearAndGenre)
        .join("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
        .attr("transform", (d, i, _) => "translate(" + escalaAnos(d[0]) + ", 0)")
        .data((d, i, _) => {
            console.log("loading data")
            console.log(d)
            console.log(dataGroupedByYearAndGenre[1]);
            return dataGroupedByYearAndGenre[1];
        })
        .join("circle")
        .attr("cx", 0)
        .attr("cy", (d, i, _) => {
            console.log("Inside the data join");
            console.log(d);
            return 5;
        })

});