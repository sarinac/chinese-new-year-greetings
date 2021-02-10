class Tile {

    constructor(svg, dimensions, data) {
        
        this.svg = svg;
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.topSpace = dimensions.topSpace;
        this.data = data;

        this.draw();

    }

    draw() {

        this.createScales();

        // Create 1 <g> per tile
        this.tiles = this.svg 
            .append("g")
                .attr("id", "tiles")
                .selectAll("g.tile")
                .data(this.data.tiles)
                .enter()
                .append("g")
                    .classed("tile", true)
                    .attr("id", d => `tile-${d.id}`);

        // Draw background
        this.tiles 
            .append("rect")
                .classed("tile", true)
                .attr("x", (d, i) => this.tileX((i + 1) % 15))
                .attr("y", (d, i) => this.tileY(i < 15 ? 0 : 1))
                .attr("width", () => this.tileWidth)
                .attr("height", () => this.tileHeight)
                .attr("rx", () => 0.20 * this.tileWidth)
                .attr("ry", () => 0.20 * this.tileWidth);
        
        // Add text
        // [0, 1, 2, 3].forEach(characterIndex => {
        //     this.tiles 
        //         .append("text")
        //             .classed("tile", true)
        //             .classed("traditional", true)
        //             .style("font-size", this.tileFont)
        //             .attr("x", (d, i) => this.tileX((i + 1) % 15) + this.tileWidth / 2)
        //             .attr("y", (d, i) => this.tileY(i < 15 ? 0 : 1) + this.tileHeight/2 - this.tileFontHeight*1.5 + characterIndex*this.tileFontHeight)
        //             .text(d => d.chinese_simplified[characterIndex]);
        // });
        this.tiles 
            .append("text")
                .classed("tile", true)
                .classed("chinese", true)
                .classed("traditional", true)
                .style("font-size", this.tileFont)
                .attr("x", (d, i) => this.tileX((i + 1) % 15) + this.tileWidth / 2)
                .attr("y", (d, i) => this.tileY(i < 15 ? 0 : 1) + this.tileHeight/2)
                .text(d => d.chinese_simplified);
    }

    createScales() {

        this.tileX = d3.scaleLinear()
            .domain([0, 14])
            .range([this.width * .05, this.width * .85]); // Left X of tile

        this.tileY = d3.scaleLinear()
            .domain([0, 1])
            .range([this.topSpace + this.height * .70 , this.topSpace + this.height * .85]); // Top Y of tile

        this.tileWidth = .85 * (this.tileX(1) - this.tileX(0));
        this.tileHeight = .90 * (this.tileY(1) - this.tileY(0));

        this.tileFont = 18;
        this.tileFontHeight = 22;
        this.tileFontWidth = 16;

    }

}

export default Tile;