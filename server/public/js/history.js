const refresh1 = (limitVal) => {
    const limit = parseInt(
        limitVal ? limitVal : document.getElementById("limitRange").value
    );

    document.getElementById("limitRangeLabel").innerHTML = limit;

    d3.json(`history?limit=${limit}`).then((raw) => {
        console.log(raw);
        const div = d3.select("#historyDiv");

        div.selectAll("div").data([]).exit().remove();

        const children = div
            .selectAll("div")
            .data(raw)
            .enter()
            .append("div")
            .attr("class", "recordDiv")
            .attr("id", (e, i) => {
                const id = `recordDiv${e.last_visit_time}`;
                return id;
            });

        const panel1 = children.append("div").attr("class", "leftPanel");
        const panel2 = children.append("div").attr("class", "rightPanel");

        panel1
            .append("li")
            .append("a")
            .text((e) => e.title)
            .attr("target", "_blank")
            .attr("class", "hrefTarget")
            .attr("href", (e) => e.url);

        panel1
            .append("p")
            .text((e) => e.last_visit_time)
            .attr("class", "lastVisitTimeP");

        panel1
            .append("button")
            .text("Toggle")
            .on("click", (e, b) => {
                if (e.target._display) {
                    e.target._display = false;
                } else {
                    e.target._display = true;
                }

                console.log(e.target, e.target._display, e.target._iframeId);

                d3.select(`#largeIframe${b.last_visit_time}`).attr(
                    "style",
                    e.target._display ? "height: 800px; " : "height: 200px"
                );

                d3.select(`#textarea${b.last_visit_time}`).attr(
                    "style",
                    e.target._display ? "display: block; " : "display: none"
                );
            });

        panel1
            .append("button")
            .text("Remove")
            .on("click", (e, b) => {
                const dom = document.getElementById(
                    `recordDiv${b.last_visit_time}`
                );
                dom.parentNode.removeChild(dom);
            });

        panel1.append("br");

        panel1
            .append("textarea")
            .attr("id", (e) => `textarea${e.last_visit_time}`)
            .attr("class", "textarea1")
            .attr("placeholder", "Details of the collection")
            .attr("style", "display: none")
            .text("")
            .on("input", (e, b) => {
                const newContent = e.target.value;
                const md = marked.parse(
                    newContent
                        .replaceAll("\t", "  ")
                        .replaceAll("<br>", "\n")
                        .replaceAll("&nbsp;", "\n")
                        .replaceAll("&ensp;", "\n")
                        .replaceAll("&emsp;", "\n")
                );
                console.log(newContent);
                console.log(md);
                // d3.select(`#full-detail-${currentTime}`).text(newContent);
                document.getElementById(
                    `markdown${b.last_visit_time}`
                ).innerHTML = md;
                // d3.select(`#full-detail-${currentTime}`).attr("innerHTML", md);
            });

        panel1
            .append("p")
            .attr("id", (e) => `markdown${e.last_visit_time}`)
            .text("What is the point of the collection?");

        panel2
            .append("iframe")
            // .attr("src", (e) => `http://localhost:10101/?target=${e.url}`)
            .attr("src", (e) => {
                if (e.url.startsWith("https://github.com/")) {
                    return `./iframe/?target=${e.url}`;
                }
                if (e.url.startsWith("https://pubmed.ncbi.nlm.nih.gov/")) {
                    return `./iframe/?target=${e.url}`;
                }
                return e.url;
            })
            .attr("sandbox", "allow-same-origin allow-forms")
            .attr("loading", "lazy")
            .attr("class", "largeIframe")
            .attr("width", "600px")
            .attr("height", "800px")
            // .attr("style", `display: none`)
            .attr("id", (e, i) => {
                const id = `largeIframe${e.last_visit_time}`;
                return id;
            });
    });
};
