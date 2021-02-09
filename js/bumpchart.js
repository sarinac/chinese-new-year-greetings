class BumpChart {

    constructor(svg, data, lanterns, tiles) {
        
        this.svg = svg;
        this.width = parseFloat(svg.style("width"));
        this.height = parseFloat(svg.style("height"));
        this.data = data;
        this.lanterns = lanterns;
        this.tiles = tiles;

        this.drawLinks();
        this.drawTooltip();
        this.addMouseoverLanterns();
        this.addMouseoverTiles();

    }

    drawLinks() {

        this.links = this.svg 
            .append("g")
                .attr("id", "links")
                .selectAll("path.link")
                .data(this.data.links)
                .enter()
                .append("path")
                    .classed("link", true)
                    .classed("hidden", true)
                    .attr("d", d => {

                        let path = d3.path(),
                            lantern = d3.select(`g.lantern#lantern-${d.lantern}`).node().getBBox(),
                            lanternFront = d3.select(`#lantern-${d.lantern}`).select(".lantern-front").node().getBBox(),
                            tile = d3.select(`#tile-${d.tile}`).node().getBBox();
                        let topX = lanternFront.x + lanternFront.width / 2,
                            topY = lantern.height - this.lanterns.buffer + 10,
                            bottomX = tile.x + tile.width / 2,
                            bottomY = d3.select("#tiles").node().getBBox().y - 5,
                            midY = topY + (bottomY - topY) * .60,
                            controlY = this.height / 2 + (bottomY - this.height / 2) / 2;
                        let angle = Math.atan(bottomX - topX, bottomY - topY),
                            spacing = 8,
                            spacingX = Math.cos(Math.PI / 2 - angle) * spacing,
                            spacingY = Math.sin(Math.PI / 2 - angle) * spacing;

                        path.moveTo(topX, topY);
                        path.bezierCurveTo(
                            topX - spacingX, controlY - spacingY,
                            bottomX - spacingX, midY - spacingY, 
                            bottomX, bottomY
                        );
                        path.bezierCurveTo(
                            bottomX + spacingX, midY + spacingY, 
                            topX + spacingX, controlY + spacingY,
                            topX, topY
                        );
                        
                        return path;
                    });

    }

    drawTooltip() {

        let tooltipWidth = 250,
            tooltipHeight = 150;

        this.tooltip = this.svg
            .append("g")
                .attr("id", "tooltip")
                .classed("tooltip-hidden", true)
                .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

        this.tooltipAnnotation = this.tooltip
            .append("g")
                .attr("id", "tooltip-annotation");

        this.tooltip
            .append("rect")
                .attr("id", "tooltip-back")
                .attr("width", tooltipWidth)
                .attr("height", tooltipHeight)
                .attr("rx", 10);

        this.tooltipPhrase = this.tooltip
            .append("text")
                .attr("id", "tooltip-phrase")
                .attr("x", tooltipWidth / 2)
                .attr("y", tooltipHeight * .30)
                .classed("traditional", true);

        this.tooltipPinYin = this.tooltip
            .append("g")
                .classed("tooltip-pinyin", true)
                .attr("transform", `translate(0,${tooltipHeight * .35})`)

        this.tooltip
            .append("path")
                .attr("id", "tooltip-line")
                .attr("d", `M${tooltipWidth * .2},${tooltipHeight * .55} L${tooltipWidth * .8},${tooltipHeight*.55}`);

        this.tooltipPrefix = this.tooltip
            .append("text")
                .attr("id", "tooltip-prefix")
                .attr("x", tooltipWidth / 2)
                .attr("y", tooltipHeight * .7);

        this.tooltipTranslation = this.tooltip
            .append("text")
                .attr("id", "tooltip-translation")
                .attr("x", tooltipWidth / 2)
                .attr("y", tooltipHeight * .88);
    }

    addMouseoverLanterns() {

        let getTiles = (lantern) => {
            // return array of tile IDs that correspond to a given tile
            let tiles = [];
            this.data.links.forEach(link => {
                if (link.lantern === lantern) {
                    tiles.push(`tile-${link.tile}`);
                }
            });
            return tiles;
        }

        let getLinks = (id) => {
            return this.links.filter(d => d.lantern === id);
        }

        this.lanterns.lanterns
            .on("mouseover", function(d) {
                let selection = d3.select(this);
                let id = selection.data()[0].english;
                let tiles = getTiles(id);
                // Move lantern down
                selection
                    .transition()
                    .duration(200)
                    .attr("transform", "translate(0, 15)");
                // Light up tiles
                tiles.forEach(tile => {
                    d3.select(`#${tile}`).select("rect")
                        .classed("tile", false)
                        .classed("tile-hover", true);
                    d3.select(`#${tile}`).selectAll("text")
                        .classed("tile", false)
                        .classed("tile-hover", true);
                });
                // Show links
                getLinks(id)
                    .classed("hidden", false)
                    .classed("visible", true);
            })
            .on("mouseout", function(d) {
                let selection = d3.select(this);
                let id = selection.data()[0].english;
                let tiles = getTiles(id);
                // Move lantern back to normal
                selection
                    .transition()
                    .duration(100)
                    .attr("transform", "translate(0, 0)");
                // Unlight tiles
                tiles.forEach(tile => {
                    d3.select(`#${tile}`).select("rect")
                        .classed("tile", true)
                        .classed("tile-hover", false);
                    d3.select(`#${tile}`).selectAll("text")
                        .classed("tile", true)
                        .classed("tile-hover", false);
                });
                // Hide links
                getLinks(id)
                    .classed("hidden", true)
                    .classed("visible", false);
            });
            
    }

    addMouseoverTiles() {

        let getLanterns = (tile) => {
            // return array of lanterns that correspond to a given tile ID
            let lanterns = [];
            this.data.links.forEach(link => {
                if (link.tile === tile) {
                    lanterns.push(`lantern-${link.lantern}`);
                }
            });
            return lanterns;
        }

        let getLinks = (id) => {
            return this.links.filter(d => d.tile === id);
        }

        let svgWidth = this.width;
        let tooltipAnnotation = this.tooltipAnnotation,
            tooltipPhrase = this.tooltipPhrase,
            tooltipPinYin = this.tooltipPinYin,
            tooltipPrefix = this.tooltipPrefix,
            tooltipTranslation = this.tooltipTranslation;

        this.tiles.tiles
            .on("mouseover", function(d) {
                let selection = d3.select(this);
                let data = selection.data()[0];
                let id = data.id;
                let tooltip = d3.select("#tooltip");
                // Show links
                getLinks(id)
                    .classed("hidden", false)
                    .classed("visible", true);
                // Show tooltip
                tooltip
                    .classed("hidden", false)
                    .classed("tooltip-visible", true)
                    .transition()
                    .duration(500)
                    .ease(d3.easeLinear)
                    .attr("transform", () => {
                        let x = Math.min(
                            selection.node().getBBox().x + selection.node().getBBox().width, 
                            svgWidth - tooltip.node().getBBox().width
                        ),
                            y = selection.node().getBBox().y - tooltip.node().getBBox().height + 20;
                        return `translate(${x},${y})`;
                    });
                // Add text to tooltip
                tooltipPhrase.text(data.chinese_simplified);
                tooltipPrefix.text(data.prefix);
                tooltipTranslation.text(data.translation);
                tooltip.selectAll("text.tooltip-pinyin").remove();
                data.pinyin.forEach((character, index) => {
                    tooltipPinYin
                        .append("text")
                            .classed("tooltip-pinyin", true)
                            .attr("x", 68 + 37 * index)
                            .classed("traditional", true)
                            .text(character);
                })

            })
            .on("mouseout", function(d) {
                let selection = d3.select(this);
                let data = selection.data()[0];
                let id = data.id;
                let tooltip = d3.select("#tooltip");
                // Hide links
                getLinks(id)
                    .classed("hidden", true)
                    .classed("visible", false);
                // Hide tooltip
                tooltip
                    .classed("tooltip-hidden", true)
                    .classed("tooltip-visible", false)
                    .transition()
                    .duration(500)
                    .attr("transform", () => {
                        let x = Math.min(
                            selection.node().getBBox().x + selection.node().getBBox().width, 
                            svgWidth - tooltip.node().getBBox().width
                        ),
                            y = d3.select("svg").node().getBBox().height * .45;
                        return `translate(${x},${y})`;
                    });
            });
    }

}

export default BumpChart;