import Lantern from "./lantern.js"
import BumpChart from "./bumpchart.js"
import Tile from "./tile.js"

// Set dimensions
let dimensions = {};
dimensions.height = 800;
dimensions.width = 1000;
dimensions.topSpace = Math.max(0, (window.innerHeight - dimensions.width) * .60);

// Create SVG
let svg = d3.select("#chart")
    .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.topSpace + dimensions.height);

// Add text
svg
    .append("text")
        .attr("id", "greeting")
        .classed("gold", true)
        .classed("chinese", true)
        .classed("traditional", true)
        .attr("x", dimensions.width * .88)
        .attr("y", dimensions.topSpace + dimensions.height * .3)
        .text("新年快乐");

// Read data
d3.json("data/data.json")
    .then((data) => {

        // Calculate rollups
        let grouped = data.links.reduce((p, c) => {
            let d = (p[c["lantern"]]||[])
            d.push(c["lantern"]);
            p[c["lantern"]] = d;
            return p;
        });

        // Validate data types
        for(let i = 0; i < data.lanterns.length; i++) {
            data.lanterns[i].english = "" + data.lanterns[i].english;
            data.lanterns[i].prefix = "" + data.lanterns[i].prefix;
            data.lanterns[i].chinese_simplified = "" + data.lanterns[i].chinese_simplified;
            data.lanterns[i].chinese_traditional = "" + data.lanterns[i].chinese_traditional;
            data.lanterns[i].first_intonation = +data.lanterns[i].first_intonation;
            data.lanterns[i].last_intonation = +data.lanterns[i].last_intonation;
            data.lanterns[i].count = grouped[data.lanterns[i].english].length;
        }
        for(let i = 0; i < data.links.length; i++) {
            data.links[i].tile = +data.links[i].tile;
            data.links[i].lantern = "" + data.links[i].lantern;
        }
        for(let i = 0; i < data.tiles.length; i++) {
            data.tiles[i].id = +data.tiles[i].id;
            data.tiles[i].chinese_simplified = "" + data.tiles[i].chinese_simplified;
            data.tiles[i].chinese_traditional = "" + data.tiles[i].chinese_traditional;
            data.tiles[i].translation = "" + data.tiles[i].translation;
            for(let j=0; j < data.tiles[i].pinyin.length; j++) {
                data.tiles[i].pinyin[j] = "" + data.tiles[i].pinyin[j];
            }
        }

        // Create objects
        let lanterns = new Lantern(svg, dimensions, data);
        let tiles = new Tile(svg, dimensions, data);
        let bumpChart = new BumpChart(svg, dimensions, data, lanterns, tiles);

        // Switch characters
        let chineseSwitch = (to) => {
            let from = to === "traditional" ? "simplified" : "traditional";
            d3.selectAll(`.${from}`)
                // .text(d => d[`chinese_${to}`]) // My font does not read traditional LOL
                .classed(to, true)
                .classed(from, false);
            d3.select(`#button-${to}`).classed("selected", true);
            d3.select(`#button-${from}`).classed("selected", false);
        };

        d3.select("#button-simplified").on("click", () => chineseSwitch("simplified"));
        d3.select("#button-traditional").on("click", () => chineseSwitch("traditional"));

    })
    .catch((error) => console.error(`Error loading data : ${error}`));