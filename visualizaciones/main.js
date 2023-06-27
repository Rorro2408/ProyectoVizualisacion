const WIDTH = 1100;
const HEIGHT = 600;

const WIDTHLEYENDA = 400;
const HEIGHTLEYENDA = 200;

const SVG1 = d3.select("#vis-1").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const SVG2 = d3.select("#vis-2").append("svg").attr("width", WIDTH).attr("height", HEIGHT);
const SVG3 = d3.select("#vis-3").append("svg").attr("width", WIDTH + 180).attr("height", HEIGHT)
    .style("border", '1px solid')
    .style("margin", '10px 10px');
const LEYENDA1 = d3.select("#leyenda-vis-1").append("svg").attr("width", WIDTHLEYENDA).attr("height", HEIGHTLEYENDA);
const LEYENDA2 = d3.select("#leyenda-vis-2").append("svg").attr("width", WIDTHLEYENDA).attr("height", HEIGHTLEYENDA);
const LEYENDA3 = d3.select("#leyenda-vis-3").append("svg").attr("width", WIDTHLEYENDA).attr("height", HEIGHTLEYENDA);

const PATHDATASET = "../Complete_song_data_no_duplicates.csv";
const PATHDATASETGERNRESBYYEAR = "../genres_by_year.csv"

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

    SVG3.append("g")
    .append("text")
    .attr("x", 5)
    .attr("y", 14)
    .attr("font-size", "20px")
    .attr("font-family", "Arial")
    .text("duración");

    SVG3.append("g")
    .append("text")
    .attr("x", 600)
    .attr("y", 599)
    .attr("font-size", "20px")
    .attr("font-family", "Arial")
    .text("año");

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
        .attr("x", 1110)
        .attr("y", 20)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextArtist = SVG3.append("text")
        .attr("x", 1110)
        .attr("y", 35)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextYear = SVG3.append("text")
        .attr("x", 1110)
        .attr("y", 50)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextDuration = SVG3.append("text")
        .attr("x", 1110)
        .attr("y", 65)
        .style("font-size", "12px")
        .style("fill", "black");
    var infoTextDanceability = SVG3.append("text")
        .attr("x", 1110)
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

});

d3.csv(PATHDATASETGERNRESBYYEAR).then(function(data_csv){
    var h = HEIGHT - MARGIN.top - MARGIN.bottom;
    var w = WIDTH - MARGIN.right - MARGIN.bottom;
    const rangoPopularidad = d3.extent(data_csv, (d) =>{
        return parseInt(d.popularity);
    });
    const rangoAnos = d3.extent(data_csv, (d) => {
        let ano = parseInt(d.release_date);
        return ano;
    });

    const escalaPopularidad = d3.scaleLinear().domain(rangoPopularidad).range([h, 0]);
    const escalaAnos = d3.scaleLinear().domain(rangoAnos).range([0, w]);

    const ejeX = d3.axisBottom(escalaAnos).ticks(16);
    const ejeY = d3.axisLeft(escalaPopularidad).ticks(16);

    SVG2.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .append("g")
    .attr("class", "y axis")
    .call(ejeY);

    SVG2.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .append("g")
    .attr("class", "x axis")
    .attr('transform', 'translate(0,' + h + ')')
    .call(ejeX);

    SVG2.append("g")
    .append("text")
    .attr("x", 5)
    .attr("y", 12)
    .attr("font-size", "20px")
    .attr("font-family", "Arial")
    .text("popularidad");

    SVG2.append("g")
    .append("text")
    .attr("x", 600)
    .attr("y", 595)
    .attr("font-size", "20px")
    .attr("font-family", "Arial")
    .text("año");

    groupedDataByGenre = d3.groups(data_csv, (d) => d.genre);

    LEYENDA3.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("circle")
    .data(groupedDataByGenre)
    .join("circle")
    .attr("r", 7)
    .attr("cx", 0)
    .attr("cy", (d, i, _) => i*(HEIGHTLEYENDA/7))
    .attr("class", (d, i, _) => d[0])

    LEYENDA3.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("text")
    .data(groupedDataByGenre)
    .join("text")
    .attr("x", 15)
    .attr("y", (d, i, _) => i*(HEIGHTLEYENDA/7) + 5)
    .attr("font-size", "17px")
    .attr("font-family", "Arial")
    .text((d, i, _) => d[0]);

    console.log(groupedDataByGenre);
    filteredDataByGenre = groupedDataByGenre.filter(item => !["hip hop", "reggae"].includes(item[0]));

    LEYENDA2.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("circle")
    .data(filteredDataByGenre)
    .join("circle")
    .attr("r", 7)
    .attr("cx", 0)
    .attr("cy", (d, i, _) => i*(HEIGHTLEYENDA/7))
    .attr("class", (d, i, _) => d[0])

    LEYENDA2.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("text")
    .data(filteredDataByGenre)
    .join("text")
    .attr("x", 15)
    .attr("y", (d, i, _) => i*(HEIGHTLEYENDA/7) + 5)
    .attr("font-size", "17px")
    .attr("font-family", "Arial")
    .text((d, i, _) => d[0]);

    const line = d3.line()
      .x(d => escalaAnos(d.release_date))
      .y(d => escalaPopularidad(d.popularity))
      .curve(d3.curveBasis);

    console.log("Apunto de hacer el join");
    SVG2.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")").attr("class", "paths")
    .selectAll("path")
    .data(filteredDataByGenre)
    .join("path")
    .attr("d", d => line(d[1]))
    .attr("fill", "none")
    .attr("class", d => d[0])
    .attr("stroke", "black")
    .attr("stroke-width", 2);

    groupedDataByYear = d3.groups(data_csv, (d) => d.release_date);
    groupedDataByYear.sort((a, b) => a[0] - b[0]);
    console.log(groupedDataByYear);

    const rangoDanceability = d3.extent(data_csv, (d) => {
        let danceability = parseFloat(d.danceability);
        return danceability;
    });
    
    console.log(rangoDanceability[1])

    LEYENDA1.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("rect")
    .data(data_csv)
    .join("rect")
    .attr("y", 0)
    .attr("x", (d, i , _) => i*1)
    .attr("width", 1)
    .attr("height", 20)
    .attr("fill", "red")
    .attr("opacity", (d, i, _) => i*rangoDanceability[1]/296)

    LEYENDA1.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("text")
    .data(data_csv)
    .join("text")
    .attr("x", (d, i ,_) => i)
    .attr("y", 30)
    .attr("font-size", "12px")
    .attr("font-family", "Arial")
    .text((d, i, _) => {
        if(i == 0){
            return "0"
        }
        if(i == 294){
            return "1"
        }
        else{
            return ""
        }
    });

    LEYENDA1.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .append("text")
    .attr("x", 20)
    .attr("y", 50)
    .attr("font-size", "18px")
    .attr("font-family", "Arial")
    .text("Gradiente de color bailabilidad")
    

    SVG1.append("g").attr("transform", "translate(0," + MARGIN.top + ")")
    .selectAll("text")
    .data(groupedDataByGenre)
    .join("text")
    .attr("x", 0)
    .attr("y", (d, i , _) => i*h/7+MARGIN.top)
    .attr("font-size", "12px")
    .attr("font-family", "Arial")
    .text((d, i, _) => d[0]);

    SVG1.append("g")
    .append("text")
    .attr("x", 5)
    .attr("y", 15)
    .attr("font-size", "20px")
    .attr("font-family", "Arial")
    .text("genero");

    SVG1.append("g")
    .append("text")
    .attr("x", 600)
    .attr("y", 590)
    .attr("font-size", "20px")
    .attr("font-family", "Arial")
    .text("año");

    SVG1.append("g").attr("transform", "translate(0," + MARGIN.top + ")")
    .selectAll("line")
    .data(groupedDataByGenre)
    .join("line")
    .attr("x1", 0)
    .attr("x2", WIDTH)
    .attr("y1", (d, i , _) => i*h/7)
    .attr("y2", (d, i , _) => i*h/7)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

    SVG1.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("text")
    .data(groupedDataByYear)
    .join("text")
    .attr("x", (d, i , _) => i*w/68)
    .attr("y", h)
    .attr("font-size", "8px")
    .attr("font-family", "Arial")
    .text((d, i, _) => d[0]);

    SVG1.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("line")
    .data(groupedDataByYear)
    .join("line")
    .attr("y1", 0)
    .attr("y2", h-MARGIN.bottom)
    .attr("x1", (d, i , _) => i*w/68)
    .attr("x2", (d, i , _) => i*w/68)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

    function getHeightGivenGenre(genre){
        if (genre === "blues"){
            return 0
        }
        if (genre === "country"){
            return h/7
        }
        if (genre === "hip hop"){
            return 2*h/7
        }
        if (genre === "jazz"){
            return 3*h/7
        }
        if (genre === "pop"){
            return 4*h/7
        }
        if (genre === "reggae"){
            return 5*h/7
        }
        if (genre === "rock"){
            return 6*h/7
        }
        else{
            return h;
        }
    }

    console.log("AAAAAAAA")

    SVG1.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")")
    .selectAll("rect")
    .data(data_csv)
    .join("rect")
    .attr("x", (d, i , _) => {
        if (d.release_date == 1950){
            return 0;
        }
        else{
            xPos = (d.release_date - 1953)*w/68 + w/68;
            return xPos;
        }
    })
    .attr("y", (d, i , _) => getHeightGivenGenre(d.genre))
    .attr("width", w/68)
    .attr("height", h/7)
    .attr("fill", "red")
    .attr("opacity", (d, i, _) => d.danceability)

})

function filterInfo(genre) {
    const paths = SVG2.select("g.paths").selectAll("path");
    if (genre === "noFilter"){
        return false;
    }
    paths.style("display", null);
  
    const filteredPaths = paths.filter((d, i, nodes) => {
        console.log("----filtering----");
        console.log(nodes);
        console.log(nodes[i]);
        console.log(d);
        return d3.select(nodes[i]).attr("class") !== genre
    });
  
    filteredPaths.style("display", "none");
  }

function restoreData() {
    const paths = SVG2.select("g.paths").selectAll("path");
    paths.style("display", null);
  }

d3.select("#showPop").on("click", () => filterInfo("pop"));
d3.select("#showRock").on("click", () => filterInfo("rock"));
d3.select("#showBlues").on("click", () => filterInfo("blues"));
d3.select("#showJazz").on("click", () => filterInfo("jazz"));
d3.select("#showCountry").on("click", () => filterInfo("country"));

d3.select("#showAll").on("click", restoreData);