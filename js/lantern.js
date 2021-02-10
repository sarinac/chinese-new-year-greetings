class Lantern {

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

        // Create 1 <g> per lantern
        this.lanterns = this.svg 
            .append("g")
                .attr("id", "lanterns")
                .selectAll("g.lantern")
                .data(this.data.lanterns)
                .enter()
                .append("g")
                    .classed("lantern", true)
                    .attr("id", d => `lantern-${d.english}`);

        // Create <g> for shadow (back)
        this.lanternsBack = this.lanterns
        .append("g")
            .classed("lantern-back", true)
            .classed("shadow", true)
            .attr("transform", `translate(10, 10)`);

        // Create <g> for lantern (front)
        this.lanternsFront = this.lanterns
            .append("g")
                .classed("lantern-front", true);

        [this.lanternsFront, this.lanternsBack].forEach((lantern) => {
            this.drawCord(lantern);
            this.drawFuzz(lantern);
            this.drawTassel(lantern);
            this.drawBody(lantern);
        });

    }

    createScales() {

        this.lanternX = d3.scaleLinear()
            .domain([0, this.data.lanterns.length])
            .range([this.width * .08, this.width * .85]);

        this.lanternY = d3.scaleSqrt()
            .domain([d3.min(this.data.lanterns, d => d.count), d3.max(this.data.lanterns, d => d.count)])
            .range([this.topSpace + this.height * .30, this.topSpace + this.height * .50]); // This is the latern's lowest Y

        this.lanternBodyHeight = (d) => {
            return d.chinese_simplified.length * 30 + 30;
        }

        this.fuzzHeight = 20;
        this.stringHeight = 20;
        this.fontSize = 36;

    }

    drawCord(obj) {
        // Draw cord on given DOM element

        let cordWidth = 6;

        obj.append("rect")
            .attr("x", (d, i) => this.lanternX(i) - cordWidth / 2)
            .attr("y", -this.buffer)
            .attr("width", cordWidth)
            .attr("height", d => this.buffer + this.lanternY(d.count) - (d.first_intonation === 1 || d.first_intonation === 2 ? 0 : 30))
            .attr("class", obj === this.lanternsFront ? "red" : "");
        
    }

    drawFuzz(obj) {
        // chinese characters being same in traditional and simplified determines if lantern has tassels
        // Yes: fuzz
        // No: no fuzz

        let fuzzTopWidth = (this.lanternX(1) - this.lanternX(0)) * .15,
            tasselRadius = 4,
            fuzzBottomWidth = (this.lanternX(1) - this.lanternX(0)) * .4;

        let fuzz = obj.append("path")
            .attr("d", (d, i) => {
                return [
                    `M${this.lanternX(i) - fuzzTopWidth},${this.lanternY(d.count) - this.stringHeight - this.fuzzHeight} `,
                    `l${fuzzTopWidth*2},0 `,
                    `l${fuzzBottomWidth/2 - fuzzTopWidth},${this.fuzzHeight} `,
                    `a${tasselRadius},${tasselRadius},0,0,1,${-tasselRadius},${tasselRadius} `,
                    `a${fuzzBottomWidth / 2 + tasselRadius},${fuzzBottomWidth / 4},0,0,1,${-fuzzBottomWidth + 2 * tasselRadius},${0} `,
                    `a${tasselRadius},${tasselRadius},0,0,1,${-tasselRadius},${-tasselRadius} `,
                    `l${fuzzBottomWidth/2 - fuzzTopWidth},${-this.fuzzHeight} `,
                    "Z",
                ].join(" ");
            })
            .attr("class", obj === this.lanternsFront ? "gold" : "");

        // Apply the filter AFTER drawing on the fuzz (this must be done in this order due to index i)
        fuzz.filter(d => d.chinese_simplified !== d.chinese_traditional).remove();

    }

    drawTassel(obj) {
        // first word's intonation determines if lantern has tassels
        // 1: has gold, short tassel
        // 2: has red, long tassel
        // 3: no tassel
        // 4: no tassel

        let radius = 6,
            tasselTopWidth = 5,
            tasselRadius = 3,
            tasselBottomWidth = 18,
            mintasselHeight = 25;

        obj.filter(d => d.first_intonation === 1 || d.first_intonation === 2).append("circle")
            .attr("cx", (d, i) => this.lanternX(i))
            .attr("cy", d => this.lanternY(d.count))
            .attr("r", radius)
            .attr("class", obj === this.lanternsFront ? "gold" : "");
        
        obj.filter(d => d.first_intonation === 1 || d.first_intonation === 2).append("path")
            .attr("d", (d, i) => {
                let tasselHeight = d.first_intonation * mintasselHeight;
                return [
                    `M${this.lanternX(i) - tasselTopWidth},${this.lanternY(d.count) + tasselTopWidth*1.6} `,
                    `l${tasselTopWidth*2},0 `,
                    `l${tasselBottomWidth/2 - tasselTopWidth},${tasselHeight} `,
                    `a${tasselRadius},${tasselRadius},0,0,1,${-tasselRadius},${tasselRadius} `,
                    `a${tasselBottomWidth / 2 + tasselRadius},${tasselBottomWidth / 2},0,0,1,${-tasselBottomWidth + 2 * tasselRadius},${0} `,
                    `a${tasselRadius},${tasselRadius},0,0,1,${-tasselRadius},${-tasselRadius} `,
                    `l${tasselBottomWidth/2 - tasselTopWidth},${-tasselHeight} `,
                    "Z",
                ].join(" ");
            })
            .attr("class", d => {
                if (obj != this.lanternsFront) {
                    return "";
                } else {
                    return d.first_intonation === 1 ? "gold" : "red";
                }
            });

        obj.filter(d => d.first_intonation === 1 || d.first_intonation === 2).append("rect")
            .attr("x", (d, i) => this.lanternX(i) - tasselTopWidth)
            .attr("y", d => this.lanternY(d.count) + tasselTopWidth*.75)
            .attr("width", tasselTopWidth * 2)
            .attr("height", tasselTopWidth);

    }

    drawBody(obj) {
        // first word's intonation determines shape of lantern
        // 1: squiggly
        // 2: round
        // 3: squiggly
        // 4: round
        // number of characters determines height
        // Chinese written the same way Simplified and Traditional determines if latern has fuzz
        
        let bodyCapHeight = 10;
        let bodyWidth = (this.lanternX(1) - this.lanternX(0)) * .6;

        let drawSides = (d, direction) => {
            let path = [];
            let forward = (direction === "down" ? 1 : -1);
            if(d.first_intonation === 1 || d.first_intonation === 3) {
                // Squiggly
                let radius = this.lanternBodyHeight(d) / d.chinese_simplified.length / 16;
                let forwardFull = forward * radius,
                    forwardHalf = forwardFull / 2,
                    backwardHalf = -forwardHalf;
                let squiggly = [
                    `c ${0},${forwardHalf/2} ${backwardHalf/2},${forwardFull} ${backwardHalf},${forwardFull} `,
                    `s ${backwardHalf},${forwardFull/2} ${backwardHalf},${forwardFull} `,
                    `s ${forwardHalf/2},${forwardFull} ${forwardHalf},${forwardFull} `,
                    `s ${forwardHalf},${forwardFull/2} ${forwardHalf},${forwardFull} `,
                ].join(" ");
                for(let i = 0; i < d.chinese_simplified.length * 4; i++) {
                    path.push(squiggly);
                }
            } else {
                // Round
                let radius = this.lanternBodyHeight(d) / d.chinese_simplified.length / 2,
                    radiusHalf = radius / 2;
                path.push(`a${radiusHalf},${radius} 0 0 1 ${forward * radiusHalf} ${forward * radius}`);
                path.push(`l0,${forward * (this.lanternBodyHeight(d) - radius * 2)}`);
                path.push(`a${radiusHalf},${radius} 0,0,1 ${-forward * radiusHalf},${forward * radius}`);
            };
            return path.join(" ");
        };

        let rounded_rect = (x, y, w, h, r, tl, tr, bl, br) => {
            var topright = tr ? `a${r},${r} 0 0 1 ${r},${r}` : `h${r} v${r}`,
                bottomright = br ? `a${r},${r} 0 0 1 ${-r},${r}` : `v${r} h${-r}`,
                bottomleft = bl ? `a${r},${r} 0 0 1 ${-r},${-r}` : `h${-r} v${-r}`,
                topleft = tl ? `a${r},${r} 0 0 1 ${r},${-r}` : `v${-r} h${r}`;
            return [
                `M${x + r},${y}`,
                `h${w - 2*r}`,
                topright,
                `v${h - 2*r}`,
                bottomright,
                `h${2*r - w}`,
                bottomleft,
                `v${2*r - h}`,
                topleft,
                "z",
            ].join(" ")
        };

        // Draw top cap
        obj.append("path")
            .attr("d", (d, i) => rounded_rect(
                this.lanternX(i) - bodyWidth/2, 
                this.lanternY(d.count) - this.stringHeight - this.fuzzHeight - this.lanternBodyHeight(d) - bodyCapHeight,
                bodyWidth,
                bodyCapHeight,
                bodyCapHeight * .25,
                true,
                true,
                false,
                false
            ));

        // Draw bottom cap
        obj.append("path")
            .attr("d", (d, i) => rounded_rect(
                this.lanternX(i) - bodyWidth/2, 
                this.lanternY(d.count) - this.stringHeight - this.fuzzHeight,
                bodyWidth,
                bodyCapHeight,
                bodyCapHeight * .25,
                false,
                false,
                true,
                true
            ));

        // Draw body
        obj.append("path")
            .classed("lantern-body", true)
            .attr("d", (d, i) => {
                let lanternWidth = (d.first_intonation === 1 || d.first_intonation === 3) ? bodyWidth * 1.3 : bodyWidth;
                return [
                    `M${this.lanternX(i) - lanternWidth/2}, ${this.lanternY(d.count) - this.stringHeight - this.fuzzHeight - this.lanternBodyHeight(d)}`,
                    `l${lanternWidth}, 0`,
                    drawSides(d, "down"),
                    `l${-lanternWidth}, 0`,
                    drawSides(d, "up"),
                    "Z",
                ].join(" ")
            })
            .attr("class", obj === this.lanternsFront ? "red" : "");

        // Add text
        if(obj === this.lanternsFront) {
            // Cord text
            obj.append("text")
                .classed("english", true)
                .classed("gold", true)
                .style("font-size", this.fontSize * .5)
                .attr("transform", (d, i) => {
                    let padding = 4;
                    return [
                        "translate(",
                        `${this.lanternX(i) - padding},`,
                        `${this.lanternY(d.count) - this.stringHeight - this.fuzzHeight - this.lanternBodyHeight(d) - bodyCapHeight - padding})`,
                        "rotate(-90)",
                    ].join("")
                })
                .text(d => d.english);
                
            // Lantern text
            obj.append("text")
                .classed("traditional", true)
                .classed("gold", true)
                .classed("chinese", true)
                .style("font-size", this.fontSize)
                .attr("x", (d, i) => this.lanternX(i) - 3)
                .attr("y", d => this.lanternY(d.count) - this.stringHeight - this.fuzzHeight - this.lanternBodyHeight(d) / 2)
                .text(d => d.chinese_simplified);
        };

    }

    get buffer() {
        return this.topSpace + 20;
    }
}

export default Lantern;